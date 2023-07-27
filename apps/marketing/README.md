# Candela Obscura Marketing

This website will host a landing page, developer blog, and email sign-up form for beta users.

## TODO
- [x] Basic Landing Page
- [ ] Debug Nx Cache misses
- [ ] Check if Clean Target Can Be Removed
- [ ] Add Lint Target
- [ ] "Core Values" Page that echos [Critter Community Guidelines](https://critrole.com/community/)
- [ ] Developer Blog (powered by [Sanity](https://www.sanity.io))
- [ ] Email Sign-up Form

## Relevant Docs

- [Remix Docs](https://remix.run/docs)
- [Nx Docs](https://nx.dev)

## Development

From your terminal:

```sh
nx run marketing:serve
```

This starts your app in development mode, rebuilding assets on file changes.

## Deployment

First, build your app for production:

```sh
nx run marketing:build
```

Then run the app in production mode:

```sh
nx run marketing:start
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
