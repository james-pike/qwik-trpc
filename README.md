# Qwik + Supabase Auth + Prisma + tRPC + Tailwind ⚡️

## Project TODO list

- [x] Qwik setup
- [x] Post sub pages with params
- [x] Qwik api routes
- [x] Magic link Supabase auth
- [x] Password Supabase auth
- [x] OAuth Supabase with google
- [x] PKCE Supabase auth flow
- [x] Supabase as plugin
- [x] Sign out
- [x] Auth refresh token
- [x] Redirect navigation after login
- [x] Protected routes
- [x] tRPC setup
- [x] tRPC + cookies auth guard setup
- [x] tRPC queries/mutation on client side
- [x] tRPC queries/mutation on server side
- [x] tRPC using Prisma
- [x] Protected tRPC procedures
- [x] Crud on Post model
- [x] Crud on Comments
- [ ] Optimistic updates
- [x] Tailwind setup + DaisyUI

## qwik-supabase

This project includes an alternative approach to using `Supabase` in `Qwik` project. The standard way of doing this is by using official supabase integration[supabase-auth-helpers-qwik](https://qwik.builder.io/docs/integrations/supabase/) that uses [@supabase/auth-helpers](https://github.com/supabase/auth-helpers) under the hood.

I'm not using any helper libraries and only rely on `supabase-js` sdk. The code for integration is located here `src/lib/qwik-supabase.ts`. This way I can provide better integration with qwik `routeAction$` and `plugin` middleware features.

Available `routeAction$` actions:

- `useSupabaseSignInWithOtp`,
- `useSupabaseSignInWithPassword`,
- `useSupabaseSignInWithOAuth`,
- `useSupabaseSignOut`,
- `useSupabaseSignUp`,

## Project Structure

Inside of you project, you'll see the following directories and files:

```graphql
├── public/
│   └── ...
└── src/
    ├── components/
    │   └── ...
    ├── modules/
    │   └── ...
    ├── server/
    │   └── ...
    └── routes/
        └── ...
```

- `src/routes`: Provides the directory based routing, which can include a hierarchy of `layout.tsx` layout files, and `index.tsx` files as the page. Additionally, `index.ts` files are endpoints. Please see the [routing docs](https://qwik.builder.io/qwikcity/routing/overview/) for more info.

- `src/components`: Recommended directory for components.

- `public`: Any static assets, like images, can be placed in the public directory. Please see the [Vite public directory](https://vitejs.dev/guide/assets.html#the-public-directory) for more info.

## Add Integrations

Use the `npm run qwik add` command to add other integrations. Some examples of integrations include as a Cloudflare, Netlify or Vercel server, and the Static Site Generator (SSG).

```text
npm run qwik add
```

## Development

Development mode uses [Vite's development server](https://vitejs.dev/). For Qwik during development, the `dev` command will also server-side render (SSR) the output. The client-side development modules loaded by the browser.

```text
npm run dev
```

> Note: during dev mode, Vite will request many JS files, which does not represent a Qwik production build.

## Preview

The preview command will create a production build of the client modules, production build of `src/entry.preview.tsx`, and create a local server. The preview server is only for convenience to locally preview a production build, but it should not be used as a production server.

```text
npm run preview
```

## Production

The production build should generate the client and server modules by running both client and server build commands. Additionally, the build command will use Typescript run a type check on the source.

```text
npm run build
```

## Vercel Edge

This starter site is configured to deploy to [Vercel Edge Functions](https://vercel.com/docs/concepts/functions/edge-functions), which means it will be rendered at an edge location near to your users.

## Installation

The adaptor will add a new `vite.config.ts` within the `adapters/` directory, and a new entry file will be created, such as:

```
└── adapters/
    └── vercel-edge/
        └── vite.config.ts
└── src/
    └── entry.vercel-edge.tsx
```

Additionally, within the `package.json`, the `build.server` script will be updated with the Vercel Edge build.

## Production build

To build the application for production, use the `build` command, this command will automatically run `npm run build.server` and `npm run build.client`:

```shell
npm run build
```

[Read the full guide here](https://github.com/BuilderIO/qwik/blob/main/starters/adapters/vercel-edge/README.md)

## Dev deploy

To deploy the application for development:

```shell
npm run deploy
```

Notice that you might need a [Vercel account](https://docs.Vercel.com/get-started/) in order to complete this step!

## Production deploy

The project is ready to be deployed to Vercel. However, you will need to create a git repository and push the code to it.

You can [deploy your site to Vercel](https://vercel.com/docs/concepts/deployments/overview) either via a Git provider integration or through the Vercel CLI.
