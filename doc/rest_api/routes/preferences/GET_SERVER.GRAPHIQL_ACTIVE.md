# Get if graphical user inferface of GraphQL is activated

Get, if the graphical user interface for the GraphQL API will be served on the server.

**URL**: `/preferences/SERVER.GRAPHIQL_ACTIVE`

**Method**: `GET`

**Auth required** : YES


## Success Response

**Code** : `200 OK`

**Data type** : `boolean`

**Content example**

```json
{
  "data": true
}
```

## Error Response

The following errors can occur by requesting, if the graphical user interface of the GraphQL API will be served.

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