# Musicserver REST API

The musicserver has a REST api to communicate from client to server.

The REST api does not support every aspect of the functionality of the server. For that purpose the GraphQL api shoudl be used, because that api is the primary api of the server.

The REST api onyl is designed as secondory api to make data available to client, which do not support he GraphQL standard.


## Authentification

Every route of the REST api, except the [login](./routes/login.md) and the [signup](./routes/routes.md) routes, are require the valid authentification.

The authentifiation is supported through the a JSON web token (JWT), which should be transmitted in the HTTP header "Authorization" with a bearer schema.

Example:
```
GET /rest/type/object
Host: ...
Authorization: Bearer eyJhbGciOiJIUzI1NiIXVCJ9...TJVA95OrM
```

## Data exchange

If you have to transmit data to the server, e.g. to transmit the login data to server, the data has to be send as JSON (MimeType: application/json) in the request body.

GET requests require possible parameters as GET request paramter.

Data from the server will always be send in JSON format.


## Available routes

In the following section are all available routes listed. Each of the routes ahs its own documentation page, where details about the route are listed.

| Name | Method | Route | Description |
| --- | --- | --- | --- |
| [Login](./routes/login.md) | POST | /login | Try to login a user and get the JSON web token for further requests |
| [Signup](./routes/signup.md) | POST | /signup | User self signup route |
| [Get image format](./routes/preferences/getImageFormat.md) | GET | /preferences/IMAGE.FORMAT | Get the defined image format |
| [Get HTTP port](./routes/preferences/getHttpPort.md) | GET | /preferences/SERVER.HTTP_PORT | Get the port of the HTTP server |
| [Get HTTPS port](./routes/preferences/getHttpsPort.md) | GET | /preferences/SERVER.HTTPS_PORT | Get the port of the HTTPS server |
| [Get HTTPS is used](./routes/preferences/getUseHttps.md) | GET | /preferences/SERVER.HTTPS | Get, if the HTTPS server is used |
| [Get private key path](./routes/preferences/getPrivateKey.md) | GET | /preferences/SERVER.PRIVATE_KEY | Get the path to the private key on the server |
| [Update image format](./routes/preferences/putImageFormat.md) | PUT | /preferences/IMAGE.FORMAT | Update the image format |
