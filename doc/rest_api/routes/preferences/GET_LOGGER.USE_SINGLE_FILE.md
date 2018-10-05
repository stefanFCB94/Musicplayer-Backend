# Get, if logging to a single file is activated

If activated, the logging service will log all messages, not depending on the current date,
to a single file.

**URL** : `/preferences/LOGGER.USE_SINGLE_FILE`

**Method** : `GET`

**Auth required** : YES


## Success Response

**Code** : `200 OK`

**Data type** : `boolean`

**Content example**

```json
{
  "data": false
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
