# Prompt 6F — obtain tokens via Auth Code+PKCE and probe Gateway (status codes only).
# Usage (PowerShell):
#   $env:DF_TEST_PASS = '<local-only password>'
#   .\probe-auth-api.ps1
$ErrorActionPreference = 'Stop'
if (-not $env:DF_TEST_PASS) { throw 'Set DF_TEST_PASS to the local Keycloak test user password (never commit it).' }
$userName = if ($env:DF_TEST_USER) { $env:DF_TEST_USER } else { 'devflow-local' }

function New-Pkce {
  $bytes = New-Object byte[] 32
  [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  $verifier = ([Convert]::ToBase64String($bytes) -replace '\+','-' -replace '/','_' -replace '=','')
  $sha = [Security.Cryptography.SHA256]::Create()
  $hash = $sha.ComputeHash([Text.Encoding]::ASCII.GetBytes($verifier))
  $challenge = ([Convert]::ToBase64String($hash) -replace '\+','-' -replace '/','_' -replace '=','')
  [pscustomobject]@{ verifier = $verifier; challenge = $challenge }
}

$pkce = New-Pkce
$cookie = Join-Path $env:TEMP 'kc-c.txt'
$form = Join-Path $env:TEMP 'kc-f.html'
$hdrs = Join-Path $env:TEMP 'kc-h.txt'
$tokFile = Join-Path $env:TEMP 'kc-tok.json'
$outNull = Join-Path $env:TEMP 'curl-out.null'
$redirect = 'http://localhost:3000/auth/callback'
$kcBase = if ($env:KEYCLOAK_URL) { $env:KEYCLOAK_URL.TrimEnd('/') } else { 'http://localhost:8280' }
$authUrl = "$kcBase/realms/devflow/protocol/openid-connect/auth?client_id=devflow-web&redirect_uri=$([uri]::EscapeDataString($redirect))&response_type=code&scope=openid%20profile%20email&code_challenge=$($pkce.challenge)&code_challenge_method=S256"

Remove-Item $form, $cookie, $hdrs, $tokFile, $outNull -ErrorAction SilentlyContinue
$curlCode = & curl.exe -s -c $cookie -b $cookie -o $form -w '%{http_code}' $authUrl
if ($curlCode -eq '302' -or $curlCode -eq '303') {
  # First hop may redirect to login; follow Location once
  $loc = (& curl.exe -s -c $cookie -b $cookie -D - -o NUL $authUrl | Select-String -Pattern '^location:' | Select-Object -First 1).Line -replace '^location:\s*',''
  if ($loc) {
    $curlCode = & curl.exe -s -c $cookie -b $cookie -o $form -w '%{http_code}' $loc.Trim()
  }
}
if ($curlCode -ne '200' -or -not (Test-Path $form) -or (Get-Item $form).Length -lt 100) {
  throw "NO_FORM http=$curlCode path=$form size=$((Get-Item $form -ErrorAction SilentlyContinue).Length)"
}
$html = [System.IO.File]::ReadAllText($form)
$actionMatch = [regex]::Match($html, 'action="([^"]+)"')
if (-not $actionMatch.Success) {
  # Keycloak sometimes uses single quotes
  $actionMatch = [regex]::Match($html, "action='([^']+)'")
}
if (-not $actionMatch.Success) { throw "NO_ACTION html_len=$($html.Length) snippet=$($html.Substring(0,[Math]::Min(200,$html.Length)))" }
$action = [System.Net.WebUtility]::HtmlDecode($actionMatch.Groups[1].Value) -replace '&amp;', '&'
curl.exe -s -D $hdrs -o $outNull -c $cookie -b $cookie -X POST $action `
  --data-urlencode "username=$userName" `
  --data-urlencode "password=$($env:DF_TEST_PASS)" `
  --data-urlencode 'credentialId='
$locLine = Select-String -Path $hdrs -Pattern '^location:' | Select-Object -First 1
if (-not $locLine) { Get-Content $hdrs | Select-Object -First 25; throw 'NO_LOCATION' }
$loc = $locLine.Line -replace '^location:\s*', ''
if ($loc -notmatch 'code=([^&]+)') { throw "NO_CODE loc=$loc" }
$codeVal = $Matches[1]
curl.exe -s -o $tokFile -X POST "$kcBase/realms/devflow/protocol/openid-connect/token" `
  -d "grant_type=authorization_code" -d 'client_id=devflow-web' -d "code=$codeVal" `
  -d "redirect_uri=$redirect" -d "code_verifier=$($pkce.verifier)"
$tok = Get-Content $tokFile -Raw | ConvertFrom-Json
if (-not $tok.access_token) { throw 'TOKEN_FAIL' }
$access = $tok.access_token
$refresh = $tok.refresh_token
Write-Output "token_ok expires_in=$($tok.expires_in)"

function Probe([string]$Name, [string]$Url, [string]$Token) {
  $code = & curl.exe -s -o $outNull -w '%{http_code}' -H "Authorization: Bearer $Token" $Url
  Write-Output "$Name -> $code"
}

$gw = if ($env:GW_URL) { $env:GW_URL.TrimEnd('/') } else { 'http://localhost:8080' }
Probe 'valid_auth_me' "$gw/api/auth/me" $access
Probe 'valid_users_me' "$gw/api/users/me" $access
Probe 'valid_orgs' "$gw/api/organizations" $access
Probe 'valid_projects' "$gw/api/projects" $access
Probe 'idor_random_user' "$gw/api/users/00000000-0000-0000-0000-000000000099" $access

curl.exe -s -o $tokFile -X POST "$kcBase/realms/devflow/protocol/openid-connect/token" `
  -d 'grant_type=refresh_token' -d 'client_id=devflow-web' -d "refresh_token=$refresh"
$tok2 = Get-Content $tokFile -Raw | ConvertFrom-Json
if ($tok2.access_token) {
  Write-Output 'refresh_ok'
  Probe 'after_refresh_auth_me' "$gw/api/auth/me" $tok2.access_token
} else {
  Write-Output 'refresh_fail'
}

$parts = $access.Split('.')
$payload = $parts[1].Replace('-', '+').Replace('_', '/')
while ($payload.Length % 4) { $payload += '=' }
$claims = ([Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($payload))) | ConvertFrom-Json
Write-Output ("claims azp={0} aud={1} roles={2}" -f $claims.azp, ($claims.aud -join ','), ($claims.realm_access.roles -join ','))

Remove-Item $tokFile, $cookie, $form, $hdrs, $outNull -ErrorAction SilentlyContinue
Write-Output 'cleanup_ok'
