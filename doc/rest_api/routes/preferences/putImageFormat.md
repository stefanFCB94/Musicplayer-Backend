# Update image format

Updates the image format, which should be used, when images are converted.

**URL** : `/preferences/imageformat`

**Method** : `PUT`

**Auth required** : YES

**Data constraints**

```json
{
    "format": "[valid image format]",
}
```

**Data example**

```json
{
    "format": "JPEG"
}
```

## Success Response

**Code** : `204 No content`


## Error Response

The following error response can occur, by using this route

### RequestParamterNotSetError
> **Condition** : If format is not passed in the request body
>
> **Code** : `400 BAD REQUEST`

### ServiceNotInitializedError
> **Condition** : A service is not fully initialized
>
> **Code** : `500 Internal error`

### ParameterOutOfBoundsError
> **Condition** : The image format is longer than the database field
>
> **Code** : `400 BAD REQUEST`

### RequiredParameterNotSet
> **Condition** : A required paramter is not set
>
> **Code** : `400 BAD REQUEST`

### UnsupportedImageFormatError
> **Condition** : A unsupported image format was transmitted
>
> **Code** : `400 BAD REQUEST`

### Error
> **Condition** : Unsupported error
>
> **Code** : `500 INTERNAL SERVER ERROR`


## Error content:
```json
{
  "errors": [
    {
      "code": 400,
      "parameter": "format",
      "type": "RequestParameterNotSetError",
      "message": "Format must be set"
    }
  ]
}
```
