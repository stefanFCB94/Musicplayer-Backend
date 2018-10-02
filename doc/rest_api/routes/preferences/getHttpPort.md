# Get HTTP port

Get the port, on which the HTTP server will be served.

**URL**: `/preferences/SERVER.HTTP_PORT`

**Method**: `GET`

**Auth required** : YES


## Success Response

**Code** : `200 OK`

**Content example**

```json
{
  "data": 8080
}
```

## Error Response

The following error response can occur by requesting the configured HTTP port system setting. By using this route, the following errors must be handled.


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