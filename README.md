# Pluto Start

## Installation

```bash
yarn install
```

## Development

### Setup Keycloak on Docker

- Follow the getting started tutorial https://www.keycloak.org/getting-started/getting-started-docker
- In Keycloak admin configure "Valid Redirect URIs" in your client settings and paste the URI `http://localhost:8000/oauth2/callback`. This is needed to tell Keycloak which redirectURIs to trust, otherwise Keycloak will render in error if there are unknown URIs.
- In Keycloak admin configure "Web Origins" and insert pluto-start URI as an allowed CORS origin `http://localhost:8000`.
- Configure Keycloak settings in the configuration file /build/local-config/config.json
  - Example:
  ```json
  {
    "clientId": "your-local-client",
    "resource": "http://localhost:8080",
    "oAuthUri": "http://localhost:8080/auth/realms/your-local-realm/protocol/openid-connect/auth",
    "tokenUri": "http://localhost:8080/auth/realms/your-local-realm/protocol/openid-connect/token"
  }
  ```
- Create a PEM-file named `publickey.pem` in the folder /build/local-config and paste your public key from your local Keycloak in this file: Realm Settings > Keys > Click on `Public key` and copy the public key > paste the public key in the PEM-file
- Also add a begin and end block in your PEM-file
  - Example
  ```
  -----BEGIN PUBLIC KEY-----
  <your-public-key>
  -----END PUBLIC KEY-----
  ```

### Run the local server

```bash
cd build && yarn build && ./run-local.sh
```
