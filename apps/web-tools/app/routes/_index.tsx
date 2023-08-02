import type { HeadersFunction } from '@remix-run/node';

export const headers: HeadersFunction = () => {
  console.log(
    'This is an example of how to set caching headers for a route, feel free to change the value of 60 seconds or remove the header'
  );
  return {
    // This is an example of how to set caching headers for a route
    // For more info on headers in Remix, see: https://remix.run/docs/en/v1/route/headers
    'Cache-Control': 'public, max-age=60, s-maxage=60',
  };
};

export default function Index() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <h1>Candela Obscura online tools. Coming soon!</h1>
    </main>
  );
}
