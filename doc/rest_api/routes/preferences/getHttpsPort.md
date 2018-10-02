# Get HTTPS port

Get the port, on which the HTTPS server will be served

**URL**: `/preferences/SERVER.HTTPS_PORT`

**Method**: `GET`

**Auth required** : YES


## Success response

**Code** : `200 OK`

**Content example**

```json
{
  "data": 8433
}
```


## Error response

The following error response can occur by using this route. All errors should be handled by the client.

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