# csolution rpc

### OpenAPI Specification for JSON-RPC 2.0 Endpoints

This OpenAPI specification defines endpoints conforming to the [JSON RPC 2.0](https://www.jsonrpc.org/specification) protocol. Each endpoint accepts a request body structured according to the JSON-RPC standard and returns a corresponding JSON-RPC response.

The endpoints are wrapped by HTTP POST requests with Content-Type `application/json` for easy tooling and documentation support, for example via OpenAPI Swagger Editor (either [web based](https://editor-next.swagger.io/) or [vscode extension](https://marketplace.visualstudio.com/items?itemName=42Crunch.vscode-openapi)).

### Name and schema conventions

Methods and interfaces must be declared in the OpenAPI yml schema file under the `components:/schemas:` node.

Methods requests and responses must have respectively `Request` or `Response` suffixes, which are referenced by each endpoint request and response body descriptions.

`allOf:` arrays are used to extend methods or interfaces.

Requests must extend `$ref: '#/x-jsonrpc-envelope-request'` or `$ref: '#/x-jsonrpc-envelope-request-with-params'`, while responses must extend `$ref: '#/x-jsonrpc-envelope-response'`.

### Online Editor for csolution-openapi.yml:

[Open API Swagger Next Editor](https://editor-next.swagger.io/?url=https://raw.githubusercontent.com/Open-CMSIS-Pack/csolution-rpc/refs/heads/main/api/csolution-openapi.yml)
