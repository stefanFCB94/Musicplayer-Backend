# Get path to HTTPS certificate

Get the path to the certificate, which is used for the HTTPS server.
The path represents the path on the server to the certificate file.

**URL**: `/preferences/SERVER.CERTIFICATE`

**Method**: `GET`

**Auth required** : YES


## Success Response

**Code** : `200 OK`

**Data type** : `string`

**Content example**

```json
{
  "data": "/etc/musicplayer/server.crt"
}
```

## Error Response

The following error response can occur by requesting the configured path of the certificate file on the server.


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