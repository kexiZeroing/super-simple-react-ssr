# Super Simple React SSR

Server-Side Process:
- The server runs React components and renders them to HTML strings.
- Data fetching happens on the server before rendering.
- The server injects initial data into the HTML as a global variable.
- The complete HTML is sent to the client.

Client-Side Hydration:
- After receiving the server-rendered HTML, React "hydrates" the content in the browser.
- Hydration attaches event listeners and makes the static content interactive.
- The client-side React must receive the same data used for server rendering to ensure consistency.

## Problems with SSR and SSR Streaming
Read: https://tigerabrodi.blog/why-is-react-server-components-actually-beneficial-full-history

1. Hydration cost
2. Server blocking even using `renderToNodeStream()` to stream HTML
3. Mismatching between server and client cause error (like timestamps or random numbers)

This is where `Suspense` comes in. We can show a nice loading while the data for a specific component is being fetched. Let's see how Streaming + Suspense work together under the hood.

```jsx
function Profile() {
  const promise = fetchData();

  if (promise.status === "pending") {
    // This is what "suspending" actually means:
    // The component throws a promise!
    throw promise;
  }

  // If we get here, we have data
  // otherwise Suspense would have caught the promise
  return <div>{data.name}</div>;
}

// catch logic
try {
  return <Profile />;
} catch (thrownValue) {
  if (thrownValue instanceof Promise) {
    return <Loading />;
  }
}
```

It's important that the server keeps the connection open so it can stream the HTML as it's ready. Using `Transfer-Encoding: chunked` to tells the browser: *"I'm going to send data in chunks, don't close the connection when you get the first chunk. Each chunk will start with its size, I'll send a zero-size chunk when I'm done."*

```jsx
// 1. Immediately sends the shell:
<div id="layout">
  <h1>Welcome!</h1>
  <!-- Suspense boundary starts -->
  <div data-suspense-boundary="123">
    <div class="spinner">Loading...</div>
  </div>
</div>

// 2. When data loads, the server streams the following:
<template data-suspense-chunk="123">
  <div class="profile">Alice's Profile ...</div>
</template>
// Inline script to perform the replacement 
<script>
  document
    .querySelector('[data-suspense-boundary="123"]')
    .replaceWith(document.querySelector('[data-suspense-chunk="123"]').content);
</script>
```

The problem we still have is that we download JS for every component even if it's just displaying data (static content). So that's what RSC tries to solve.

## Why use webpack-node-externals
1. When building a server-side application, you don't want to bundle Node.js core modules (e.g., fs, path, http). These modules are available natively in the Node.js runtime, so including them in the bundle is unnecessary.
2. Server-side applications typically use many dependencies from `node_modules`, but you can keep `node_modules` dependencies as require statements in the output file, so they are resolved at runtime rather than bundled.
3. If you're writing a library for Node.js, you likely don't want to bundle dependencies. This avoids duplicating dependencies for consumers of your library.

## Next.js pages router

```js
const pages = readdirSync(join(process.cwd(), "pages")).map(
  file => file.split(".")[0]
);

pages.forEach((page) => {
  app.get(`/${page}`, async (req, res) => {
    const mod = await import(`./pages/${page}`);
    // This is why nextjs needs default export
    const Component = mod.default;
     
    let props = {};
    // getServerSideProps
    if (mod.gSSP) {
      props = await mod.gSSP(req);
    }

    res.send(```
      <body>
        <div id="root">${renderToString(<Component {...props} />)}</div>
        <script src="/client.js"></script>
      </body>
    ```);
  });
});
```
