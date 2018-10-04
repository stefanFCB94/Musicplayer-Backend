# Get REST endpoint

Get the URL path, which is used as the base URL path of the REST endpoint.
All paths of the REST routes are relative to the configured REST endpoint.

**URL**: `/preferences/SERVER.REST_ENDPOINT`

**Method**: `GET`

**Auth required** : YES


## Success Response

**Code** : `200 OK`

**Data type** : `string`

**Content example**

```json
{
  "data": "/rest"
}
```

## Error Response

The following errors can occure by requesting the REST endpoint, which is used as base path for the REST API routes.


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