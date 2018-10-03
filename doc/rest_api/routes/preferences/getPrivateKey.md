# Get the path to the private key

Get the path, where the private key file is stored on the server. The private key is required to serve the HTTPS server.

**URL** : `/preferences/SERVER.PRIVATE_KEY`

**Method** : `GET`

**Auth required** : YES


## Success response

**Code** : `200 OK`

**Content example**

```json
{
  "data": "/etc/musicplayer/ssl/private.key"
}
```


## Error response

The following errors can occur by using the route to access the path to the private key.


### ServiceNotInitializedError
> **Condition** : If not all required services are fully initialized
>
> **Code** : `500 INTERNAL SERVER ERROR`


### Error
> **Condition** : If a unknown error occurs
>
> **Code** : `500 INTERNAL SERVER ERROR`


## Error content
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
