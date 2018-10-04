# Get GraphiQL endpoint

Get the URL path, on which the graphical user interface for the GraphQL will be served.
Option is optional, if the preference SERVER.GRAPHIQL is set to false option is not used.

**URL**: `/preferences/SERVER.GRAPHIQL_ENDPOINT`

**Method**: `GET`

**Auth required** : YES


## Success Response

**Code** : `200 OK`

**Data type** : `string`

**Content example**

```json
{
  "data": "/graphiql"
}
```

## Error Response

The following errors can occur by requesting the configured GraphiQL endpoint through the REST API

### ServiceNotInitializedError
> **Condition** : If not all services are fully initialized
>
> **Code** : `500 INTERNAL SERVER ERROR`


### Error
> **Condition** : If a unknown error occurs
>
> **Code** : `500 INTERNAL SERVER ERROR`


## Error content:
```json
{
  "errors": [
    {
      "code": 500,
      "type": "ServiceNotInitializedError",
      "message": "Error message"
    }
  ]
}
```