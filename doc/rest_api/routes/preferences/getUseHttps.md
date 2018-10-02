# Get preference, if HTTPS is used

Get, if the application is using a HTTPS server.

**URL** : `/preferences/SERVER.HTTPS`

**Method** : `GET`

**Auth required** : YES


## Success response

**Code** : `200 OK`

**Content example**

```json
{
  "data": true
}
```


## Error response

All errors, that can appear by using this route.


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
  "errors" : [
    {
      "code": 500,
      "type": "ServiceNotInitializedError",
      "message": "Error message"
    }
  ]
}
```
