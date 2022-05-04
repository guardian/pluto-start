# Pluto Start

## What is it?
Pluto-start provides the user interface for the "home page" and also provides the oauth flow for user authentication.
It's a frontend-only project that is built into Javascript from Typescript (mostly!) and is served via an nginx pod.

Note that the top banner and menu bar, as well as parts of the login UI, are provided by the pluto-headers package: https://gitlab.com/codmill/customer-projects/guardian/pluto-headers.


## Prerequisites

- Node.js environment, preferably v16. v17 is known to fail on the current version of Webpack. We use `nvm` to manage node versions.
- Go development environment, as recent as possible. You can download this from https://go.dev/dl/.
- (Optional) GNU make to bring everything together

## Development (via prexit-local)

0. If you have not done so already, get prexit-local from https://gitlab.com/codmill/customer-projects/guardian/prexit-local
   and follow the instructions there to install it.

You'll need to make sure that you have Keycloak correctly set up and have the signing key
in order to be able to meaningfully test pluto-start

1. Once you have followed the prexit-local instructions and been able to log in, you should see the pluto-start UI immediately.

2. Ensure you are building on a recent Node.js version, but not _too_ recent (webpack seems to fail on node 17). We use node16 through `nvm` usually.

3. Ensure you have run `eval $(minikube docker-env)` so that Docker images get built into the prexit-local environment.

4. Run `make` in the root directory to build a dev version of the frontend into a Docker image

5. Either manually delete the currently running pluto-start pod or use the one-liner:
```bash
kubectl delete pod $(kubectl get pods | grep pluto-start | awk '{print $1}')
```

to do it automatically
