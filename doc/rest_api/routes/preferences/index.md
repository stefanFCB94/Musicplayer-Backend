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
| [Get storage path](./GET_STORAGE.PATH.md) | GET | /preferences/STORAGE.PATH |
| [Get log level](./GET_LOGGER.LEVEL.md) | GET | /preferences/LOGGER.LEVEL |
| [Get log directory](./GET_LOGGER.DIRETORY.md) | GET | /preferences/LOGGER.DIRECTORY |
| [Get log filename](./GET_LOGGER.FILENAME.md) | GET | /preferences/LOGGER.FILENAME |
| [Get log console used](./GET_LOGGER.USE_CONSOLE.md) | GET | /preferences/LOGGER.USE_CONSOLE |
| [Get log single file used](./GET_LOGGER.USE_SINGLE_FILE.md) | GET | /preferences/LOGGER.USE_SINGLE_FILE |
| [Get log rotation file used](./GET_LOGGER.USE_ROTATION_FILE.md) | GET | /preferences/LOGGER.USE_ROTATION_FILE |
| [Get library paths](./GET_LIBRARY.PATHS.md) | GET | /prefrences/LIBRARY.PATHS |
| [Get supported mime types](./GET_LIBRARY.SUPPORTED_MIME_TYPES.md) | GET | /preferences/LIBRARY.SUPPORTED_MIME_TYPES |

# Update preference values

| Name | Method | Route |
| --- | --- | --- |
| [Update image format](./PUT_IMAGE.FORMAT.md) | PUT | /preferences/IMAGE.FORMAT |