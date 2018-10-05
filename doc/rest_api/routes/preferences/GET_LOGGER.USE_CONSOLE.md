# Get, if logging to the console is activated

Get, if currently the logging to the console is activated for the application server

**URL** : `/preferences/LOGGER.USE_CONSOLE`

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
