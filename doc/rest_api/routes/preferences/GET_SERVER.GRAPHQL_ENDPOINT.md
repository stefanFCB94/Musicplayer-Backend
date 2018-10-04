# Get GraphQL endpoint

Get the URL path, on which the GraphQL endpoint will be served on the server.

**URL**: `/preferences/SERVER.GRAPHQL_ENDPOINT`

**Method**: `GET`

**Auth required** : YES


## Success Response

**Code** : `200 OK`

**Data type** : `string`

**Content example**

```json
{
  "data": "/graphql"
}
```

## Error Response

The following errors can occure by requesting the GraphQL endpoint through the REST API.

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