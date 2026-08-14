#!/usr/bin/env sh
# Post-import hardening for realm "devflow" (Keycloak 25.x).
# Run inside the Keycloak container after --import-realm.
# Uses KEYCLOAK_ADMIN / KEYCLOAK_ADMIN_PASSWORD from the container environment.
set -eu

SERVER="${KC_SERVER:-http://localhost:8080}"
REALM=devflow
CLIENT_ID=devflow-web

/opt/keycloak/bin/kcadm.sh config credentials \
  --server "$SERVER" \
  --realm master \
  --user "$KEYCLOAK_ADMIN" \
  --password "$KEYCLOAK_ADMIN_PASSWORD"

CID="$(/opt/keycloak/bin/kcadm.sh get clients -r "$REALM" -q clientId="$CLIENT_ID" --fields id \
  | sed -n 's/.*"id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n1)"

if [ -z "${CID}" ]; then
  echo "Client $CLIENT_ID not found" >&2
  exit 1
fi

echo "Applying defaults to client $CLIENT_ID ($CID)"

for SCOPE_NAME in web-origins acr profile roles email basic; do
  SCOPE_ID="$(/opt/keycloak/bin/kcadm.sh get client-scopes -r "$REALM" --fields id,name \
    | tr '\n' ' ' \
    | sed -n "s/.*\"id\"[[:space:]]*:[[:space:]]*\"\\([^\"]*\\)\"[^}]*\"name\"[[:space:]]*:[[:space:]]*\"${SCOPE_NAME}\".*/\\1/p")"
  if [ -z "${SCOPE_ID}" ]; then
    SCOPE_ID="$(/opt/keycloak/bin/kcadm.sh get client-scopes -r "$REALM" --fields id,name \
      | tr '\n' ' ' \
      | sed -n "s/.*\"name\"[[:space:]]*:[[:space:]]*\"${SCOPE_NAME}\"[^}]*\"id\"[[:space:]]*:[[:space:]]*\"\\([^\"]*\\)\".*/\\1/p")"
  fi
  if [ -n "${SCOPE_ID}" ]; then
    /opt/keycloak/bin/kcadm.sh update "clients/${CID}/default-client-scopes/${SCOPE_ID}" -r "$REALM" || true
    echo "  default scope: $SCOPE_NAME"
  else
    echo "  missing scope: $SCOPE_NAME" >&2
  fi
done

# PKCE + post-logout (Keycloak multi-value separator is ##)
/opt/keycloak/bin/kcadm.sh update "clients/${CID}" -r "$REALM" \
  -s "attributes.pkce.code.challenge.method=S256" \
  -s "attributes.post.logout.redirect.uris=http://localhost:3000/##http://localhost:3000/login" \
  -s "attributes.oauth2.device.authorization.grant.enabled=false" \
  -s "attributes.oidc.ciba.grant.enabled=false" || true

/opt/keycloak/bin/kcadm.sh add-roles -r "$REALM" --rname default-roles-devflow --rolename USER || true

/opt/keycloak/bin/kcadm.sh create "clients/${CID}/protocol-mappers/models" -r "$REALM" \
  -s name=audience-devflow-web \
  -s protocol=openid-connect \
  -s protocolMapper=oidc-audience-mapper \
  -s 'config.included.client.audience=devflow-web' \
  -s 'config.id.token.claim=false' \
  -s 'config.access.token.claim=true' \
  -s 'config.introspection.token.claim=true' || true

/opt/keycloak/bin/kcadm.sh update realms/"$REALM" -s loginTheme=devflow || true
echo "loginTheme=devflow"

echo "post-import complete"
