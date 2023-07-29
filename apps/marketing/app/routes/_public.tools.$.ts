import type { LoaderArgs } from '@remix-run/node';

const target = 'candela-obscura-webtools.netlify.app';

export async function loader({ request }: LoaderArgs) {
  const newUrl = new URL(request.url.replace('/tools', ''));
  newUrl.host = target;

  console.log(request);

  const newRequest = new Request(newUrl.toString(), new Request(request));
  const resp = await fetch(newRequest);
  console.log(resp)
}

// const target = "candela-obscura-webtools.netlify.app";
//
// export async function loader({ request }: LoaderArgs) {
//   const newUrl = new URL(request.url.replace('/tools', ''));
//   newUrl.host = target;
//
//   console.log(request)
//
//   const newRequest = new Request(newUrl.toString(), new Request(request));
//   return await fetch(newRequest);
// }
// export async function action({ request }: ActionArgs) {
//   const newUrl = new URL(request.url);
//   newUrl.host = target;
//
//   const newRequest = new Request(newUrl.toString(), new Request(request));
//   return await fetch(newRequest);
// }
