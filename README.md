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

### Why use webpack-node-externals
1. When building a server-side application, you don't want to bundle Node.js core modules (e.g., fs, path, http). These modules are available natively in the Node.js runtime, so including them in the bundle is unnecessary.
2. Server-side applications typically use many dependencies from `node_modules`, but you can keep `node_modules` dependencies as require statements in the output file, so they are resolved at runtime rather than bundled.
3. If you're writing a library for Node.js, you likely don't want to bundle dependencies. This avoids duplicating dependencies for consumers of your library.

### Next.js pages router

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
