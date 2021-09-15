# keycloak-cognito-logout-adapter

`index.html` is adapter between Keycloak which requires `state` to be passed as part of logout flow and Cognito which does not support [RP-Initiated Logout](https://openid.net/specs/openid-connect-rpinitiated-1_0.html#RPLogout).

The page is called during two phases of logging out, once per each phase.

## Phase 1

Keycloak redirects to `index.html` as part of upstream IdP logout.

The page saves `post_logout_redirect_uri` and `state` URL parameters to local store and redirects to `cognito_url` (with added `logout_uri` pointing to the page itself)

## Phase 2

Cognito after finishing logging the user out, redirects to `index.html`.

The page loads `post_logout_redirect_uri` and `state` from local store and redirects back to Keycloak, using `post_logout_redirect_uri` with added `state` parameter.

## Keycloak sample configuration

Identity Provider -> Logout URL -> `https://THIS-PROJECT/index.html?cognito_url=https%3A%2F%2Fauth.example.com%2Flogout%3Fclient_id%3D012345`

Note that `logout_uri` should not be specified, it is being added automatically by the page.

## Cognito sample configuration

User Pool -> App integration -> App client settings -> Sign out URL(s) -> `https://THIS-PROJECT/index.html`
