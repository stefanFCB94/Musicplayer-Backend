# Preference routes

The following routes can be accessed to manage the preferences of the application.
All options, that can be requested, created or updated are listed below with a short description.


# Get configured preference values

| Name | Method | Route |
| --- | --- | --- |
| [Get HTTP port](./GET_SERVER.HTTP_PORT.md) | GET | /preferences/SERVER.HTTP_PORT |
| [GET HTTPS port](./GET_SERVER.HTTPS_PORT.md) | GET | /prefernces/SERVER.HTTPS_PORT |
| [Is HTTPS server used](./GET_SERVER.USE_HTTPS.md) | GET | /preferences/SERVER.USE_HTTPS |
| [Get private key path](./GET_SERVER.PRIVATE_KEY.md) | GET | /preferences/SERVER.PRIVATE_KEY |
| [Get certificate path](./GET_SERVER.CERTIFICATE.md) | GET | /preferences/SERVER.CERTIFICATE |
| [Get GraphQL endpoint](./GET_SERVER.GRAPHQL_ENDPOINT.md) | GET | /preferences/SERVER.GRAPHQL_ENDPOINT |
| [Get GraphiQL endpoint](./GET_SERVER.GRAPHIQL_ENDPOINT.md) | GET | /preferences/SERVER.GRAPHIQL_ENDPOINT |
| [Get GraphiQL is used](./GET_SERVER.GRAPHIQL_ACTIVE.md) | GET | /preferences/SERVER.GRAPHIQL_ACTIVE |
| [Get REST endpoint](./GET_SERVER.REST_ENDPOINT.md) | GET | /preferences/SERVER.REST_ENDPOINT |
| [Get image format](./GET_IMAGE.FORMAT.md) | GET | /preferences/IMAGE.FORMAT |
| [Get signup possible](./GET_SIGNUP.POSSIBLE.md) | GET | /preferences/SIGNUP.POSSIBLE |
| [Get JWT algorithm](./GET_SECURITY.JWT.ALGORITHM.md) | GET | /preferences/SECURITY.JWT.ALGORITHM |
| [Get JWT lifetime](./GET_SECURITY.JWT.EXPIRES.md) | GET | /preferences/SECURITY.JWT.EXPIRES |
| [Get JWT secret encryption key](./GET_SECURITY.JWT.SECRET.md) | GET | /preferences/SECURITY.JWT.SECRET |


# Update preference values

| Name | Method | Route |
| --- | --- | --- |
| [Update image format](./PUT_IMAGE.FORMAT.md) | PUT | /preferences/IMAGE.FORMAT |