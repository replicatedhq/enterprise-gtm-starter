Enterprise GTM Starter
====================

Example project showcasing how to use Replicated vendor APIs to build a go-to-market portal to allow end customers to self-service signups and license downloads.

How it works
------------

During operation, the project runs a web app and a backend API to generate and deliver new trial licenses for your app. When a user requests a trial, it will:

- Create a new customer record in Replicated
- Download the license from Replicated and deliver it to the user via browser download
- Deliver webhooks to update any configured CRM systems with the user's provided info
- Display configured installation instructions to the user

![operation](./doc/operation.png)

Deploying
---------------------

The Enterprise GTM starter can be configured and deployed directly to your existing Kubernetes cluster. The recommended installation method is to use [kots](https://github.com/replicatedhq/ship).

```
curl https://kots.io/install
kubectl kots install enterprise-gtm-starter
```

You'll need to procure a community license for the project, one can be found in this repo.

The KOTS configuration screen will allow you to configure:

- Replicated API token and Application details
- Trial duration and expiration behavior
- Custom copy and whitelabeling

Customizing
---------------------

As noted in [deploying](#deploying), there are a number of options that can be used to customize the messaging and operation of the go to market portal.
However, while the project aims to present some basic customizations, it is also designed to be a minimal POC.
Therefore, rich customization like CSS, extra fields, etc are not supported.
Instead, it's recommended that you import or copy the relevant pieces of this project into your own application.

Developing
------------

### Environment

As usual, set

```
REPLICATED_API_TOKEN
REPLICATED_APP
```

You can also set


```
GIN_ADDRESS # defaults to :8800
PROXY_FRONTEND # default to FE server @ localhost:3000
REPLICATED_API_ORIGIN # defaults to https://api.replicated.com/vendor
REPLICATED_CHANNEL # defaults to Stable
LICENSE_DURATION # defaults to 720h, about 1 month
```

### Running Locally

In one window, run

```
cd frontend
npm install
npm run start
```

In another, from the root of the repo

```
make serve
```

### Docker

You can also build a single docker image to run the frontend and backend, but this will be a slower iteration loop.

```
docker build . -t enterprise-gtm-starter && docker run --rm -p 8800:8800 -it -e REPLICATED_API_TOKEN -e REPLICATED_APP enterprise-gtm-starter

```