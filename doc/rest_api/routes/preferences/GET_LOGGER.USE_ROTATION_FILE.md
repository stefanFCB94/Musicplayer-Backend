# Get, if logging to a daily rotation file is activated

Get, if the logger is currently logging in a daily rotation file.
If logging to such a file the logger will create for every day a single file with the timestamp of the day.

**URL** : `/preferences/LOGGER.USE_ROTATION_FILE`

**Method** : `GET`

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
