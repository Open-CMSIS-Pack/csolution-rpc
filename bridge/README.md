# csolution-rpc-bridge

A lightweight TypeScript-based Node.js utility that launches a local HTTP server to bridge REST API `/rpc/*` endpoints in POST requests with a native binary `csolution` executable using anonymous pipes. It enables seamless integration between OpenAPI Swagger Editor (either [web based](https://editor-next.swagger.io/) or [vscode extension](https://marketplace.visualstudio.com/items?itemName=42Crunch.vscode-openapi)) and `csolution` RPC server by translating HTTP calls into piped stdin/stdout interactions, allowing structured JSON request and response bodies according to [JSON RPC 2.0](https://www.jsonrpc.org/specification).

### Install node modules

```
npm install
```

### Build
```
npm run build
```

### Lint
```
npm run lint
```

### Run
```
node dist/server.js
```
By default it listens on http://localhost:3000
