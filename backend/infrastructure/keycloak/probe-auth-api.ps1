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
$authUrl = "http://localhost:8180/realms/devflow/protocol/openid-connect/auth?client_id=devflow-web&redirect_uri=$([uri]::EscapeDataString($redirect))&response_type=code&scope=openid%20profile%20email&code_challenge=$($pkce.challenge)&code_challenge_method=S256"

curl.exe -s -c $cookie -b $cookie -o $form $authUrl | Out-Null
$html = Get-Content $form -Raw
if ($html -notmatch 'action="([^"]+)"') { throw 'NO_ACTION' }
$action = [System.Net.WebUtility]::HtmlDecode($Matches[1]) -replace '&amp;', '&'
curl.exe -s -D $hdrs -o $outNull -c $cookie -b $cookie -X POST $action `
  --data-urlencode "username=$userName" `
  --data-urlencode "password=$($env:DF_TEST_PASS)" `
  --data-urlencode 'credentialId='
$locLine = Select-String -Path $hdrs -Pattern '^location:' | Select-Object -First 1
if (-not $locLine) { Get-Content $hdrs | Select-Object -First 25; throw 'NO_LOCATION' }
$loc = $locLine.Line -replace '^location:\s*', ''
if ($loc -notmatch 'code=([^&]+)') { throw "NO_CODE loc=$loc" }
$codeVal = $Matches[1]
curl.exe -s -o $tokFile -X POST 'http://localhost:8180/realms/devflow/protocol/openid-connect/token' `
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

Probe 'valid_auth_me' 'http://localhost:8080/api/auth/me' $access
Probe 'valid_users_me' 'http://localhost:8080/api/users/me' $access
Probe 'valid_orgs' 'http://localhost:8080/api/organizations' $access
Probe 'valid_projects' 'http://localhost:8080/api/projects' $access
Probe 'idor_random_user' 'http://localhost:8080/api/users/00000000-0000-0000-0000-000000000099' $access

curl.exe -s -o $tokFile -X POST 'http://localhost:8180/realms/devflow/protocol/openid-connect/token' `
  -d 'grant_type=refresh_token' -d 'client_id=devflow-web' -d "refresh_token=$refresh"
$tok2 = Get-Content $tokFile -Raw | ConvertFrom-Json
if ($tok2.access_token) {
  Write-Output 'refresh_ok'
  Probe 'after_refresh_auth_me' 'http://localhost:8080/api/auth/me' $tok2.access_token
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
