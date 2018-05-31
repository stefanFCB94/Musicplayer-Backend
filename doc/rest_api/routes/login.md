# Login

Login a user and get the JSON web token for further requests.

**URL** : `/login/`

**Method** : `POST`

**Auth required** : NO

**Data constraints**

```json
{
    "mail": "[valid email address]",
    "password": "[password in plain text]"
}
```

**Data example**

```json
{
    "mail": "user@example.com",
    "password": "abcd1234"
}
```

## Success Response

**Code** : `200 OK`

**Content example**

```json
{
  "data": {
    "jwt": "93144b288eb1fdccbe46d6fc0f241a51766ecd3d"
  }
}
```

## Error Response

> **Condition** : If mail address is not transmitted 
>
> **Code** : `400 BAD REQUEST`
>
> **Type** : `RequestParameterNotSetError`

> **Condition** : If password is not transmitted
>
> **Code** : `400 BAD REQUEST`
>
> **Type** : `RequestParameterNotSetError`

> **Condition** :  If the user with the transmitted mail address does not exist
>
> **Code** : `404 NOT FOUND`
>
> **Type** : `UserNotExistsError`

> **Condition** : If the combination of mail and password does not match
>
> **Code** : `400 BAD REQUEST`
>
> **Type** : `PasswordNotMatchError`

> **Condition** : If the user is configured, that he cannot login to the application
>
> **Code** : `400 BAD REQUEST`
>
> **Type** : `UserNotLoginableError`

**Error content:**
```json
{
  "errors": [
    {
      "code": 400,
      "parameter": "mail",
      "type": "RequestParameterNotSetError",
      "message": "The mail must be set to login an user"
    }
  ]
}
```
