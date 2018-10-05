# Get the path, where log files will be saved

Get the path on the server, where log files will be created and saved.

**URL** : `/preferences/LOGGER.DIRECTORY`

**Method** : `GET`

**Auth required** : YES


## Success Response

**Code** : `200 OK`

**Data type** : `string`

**Content example**

```json
{
  "data": "/vol1/musicplayer/logs"
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
