import type {
  LinksFunction,
  V2_MetaFunction as MetaFunction,
} from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react';

import fonts from '../../marketing/app/styles/fonts.css';
import global from '../../marketing/app/styles/global.css';
import reset from '../../marketing/app/styles/reset.css';
import variables from '../../marketing/app/styles/variables.css';

export const meta: MetaFunction = () => [
  { charset: 'utf-8' },
  { title: 'Candela Obscura' },
  {
    name: 'viewport',
    content: 'width=device-width,initial-scale=1',
  },
];

export const links: LinksFunction = () => {
  return [
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      href: '/apple-touch-icon.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      href: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      href: '/favicon-16x16.png',
    },
    { rel: 'manifest', href: '/site.webmanifest' },
    { rel: 'stylesheet', href: reset },
    {
      rel: 'stylesheet',
      href: fonts,
    },
    {
      rel: 'stylesheet',
      href: variables,
    },
    { rel: 'stylesheet', href: global },
  ];
};

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        <script
          src="https://kit.fontawesome.com/eb21d71be1.js"
          crossOrigin="anonymous"
        ></script>
      </body>
    </html>
  );
}
