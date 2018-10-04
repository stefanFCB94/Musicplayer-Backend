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

In the following section are all available routes listed. Each of the routes has its own documentation page, where details about the route are listed.

### Route groups

| Name | Description |
| --- | --- |
| [Preferences](./preferences/index.md) | Get and update preference values |


### Other routes

| Name | Method | Route | Description |
| --- | --- | --- | --- |
| [Login](./routes/login.md) | POST | /login | Try to login a user and get the JSON web token for further requests |
| [Signup](./routes/signup.md) | POST | /signup | User self signup route |
