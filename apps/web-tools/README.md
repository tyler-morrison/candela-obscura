# Candela Obscura Web Tools

[![Netlify Status](https://api.netlify.com/api/v1/badges/023d0fd8-292e-4e8d-92c8-338822f8a921/deploy-status)](https://app.netlify.com/sites/candela-obscura-webtools/deploys)

This website will host a landing page, developer blog, and email sign-up form for beta users.

## TODO

- [ ] Basic Unauth Page
- [ ] Basic Auth Page
- [ ] DNS records
- [ ] Clerk auth integration
- [ ] Sanity CMS integration
- [ ] State Machine "Hello world"
- [ ] Magic Link Flow

## Relevant Docs

- [Remix Docs](https://remix.run/docs)
- [Nx Docs](https://nx.dev)

## Development

From your terminal:

```sh
nx run web-tools:serve
```

This starts your app in development mode, rebuilding assets on file changes.

## Deployment

First, build your app for production:

```sh
nx run web-tools:build
```

Then run the app in production mode:

```sh
nx run web-tools:start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `remix build`

- `packages/marketing/build/`
- `packages/marketing/public/build/`

### Using a Template

When you ran `npx create-remix@latest` there were a few choices for hosting. You can run that again to create a new project, then copy over your `app/` folder to the new project that's pre-configured for your target server.

```sh
cd ..
# create a new project, and pick a pre-configured host
npx create-remix@latest
cd my-new-remix-app
# remove the new project's app (not the old one!)
rm -rf app
# copy your app over
cp -R ../my-old-remix-app/app app
```
