Enterprise GTM Starter
====================

Example project showcasing how to use Replicated vendor APIs to build a go-to-market portal to allow end customers to self-service signups and license downloads.

Deploy to your cloud
---------------------

```
brew install ship
ship init github.com/replicatedhq/enterprise-gtm-starter
```

Developing 
------------

- Create a kustomize overlay with your username:

```bash
mkdir kustomize/overlays/dev_${USER}
```

```bash
echo '
bases:
  - ../dev

patches:
  - ./deployment.yaml
 ' > kustomize/overlays/dev_${USER}/kustomization.yaml
```
- create the placeholder patch:
```bash
echo 'apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  template:
    spec:
      containers:
        - name: backend
          env:
            - name: REPLICATED_API_TOKEN
              value: edit me
            - name: REPLICATED_APP
              value: edit me
            - name: REPLICATED_CHANNEL_ID
              value: edit me
  ' > kustomize/overlays/dev_${USER}/deployment.yaml
```
- Edit `kustomize/overlays/dev_${USER}/deployment.yaml` with your app ID and API keys from vendor.replicated.com (you can create an API token from the "teams and tokens" page. You can get your channel ID from `replicated channel ls` with the [replicated CLI](https://github.com/replicatedhq/replicated)
- Get [Tilt](https://github.com/windmilleng/tilt)
- Get a kubernetes cluster (probably in Docker for Desktop but Minikube/GKE/EKS/etc.. works fine too)
- run `tilt up` to run the stack and watch for changes
- navigate to http://localhost:3000
