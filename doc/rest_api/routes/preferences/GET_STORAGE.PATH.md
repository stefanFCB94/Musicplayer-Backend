# Get the path, where all application data is stored

Returns the configured parameter, where the application data should be stored.
The setting describes the server path, where automatically created files of the application
server will be stored.

**URL** : `/preferences/STORAGE.PATH`

**Method** : `GET`

**Auth required** : YES


## Success Response

**Code** : `200 OK`

**Data type** : `string`

**Content example**

```json
{
  "data": "/vol1/musicplayer/storage"
}
```

## Error Response

The following error response can occur, by using this route


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
