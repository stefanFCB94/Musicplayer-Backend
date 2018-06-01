# Login

User signup route, which creates new local user and logs the user in by returning a valid JSON web token.

**URL** : `/signup`

**Method** : `POST`

**Auth required** : NO

**Data constraints**

```json
{
    "mail": "[valid email address]",
    "password": "[password in plain text]",
    "lastname": "[lastname in plain text]",
    "firstname": "[firstname in plain text] (optional)",
    "loginPossible": "[boolean value] (optional)"
}
```

**Data example**

```json
{
    "mail": "user@example.com",
    "password": "abcd1234",
    "lastname": "Smith",
    "firstname": "John",
    "loginPossible": false
}
```

## Success Response

**Code** : `201 CREATED`

**Content example**

```json
{
  "data": {
    "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtYWlsIjoic3RlZmFu",
    "user": {
      "loginPossible": 1,
      "id": "d3effb73-1b35-4f71-aacf-efa7431ca7b1",
      "firstname": "John",
      "lastname": "Smith",
      "mail": "user@example.com",
      "createdAt": 1527865520300,
      "updatedAt": 1527865520300
    }
  }
}
```

## Error Response

The following error response can occur, by using this route

### SignupNotAvailableError
> **Condition** : If signup by user is not allowed
>
> **Code** : `400 BAD REQUEST`


### RequestParamterNotSetError
> **Condition** : If mail address, password or lastname is not transmitted 
>
> **Code** : `400 BAD REQUEST`


### ParameterOutOfBoundsError
> **Condition** : If one of the parameters are is longer than the field in the database
>
> **Code** : `400 BAD REQUEST`


### UnsupportedParamterValueError
> **Condition** : If a parameter was passed in with a wrong format
>
> **Code** : `400 BAD REQUEST`


### UserAlreadyExistsError
> **Condition** : If user with passed mail address already exists
>
> **Code** : `400 Bad Request`



## Error content:
```json
{
  "errors": [
    {
      "code": 422,
      "type": "UserAlreadyExistsError",
      "message": "User with mail address stefan.laeufle@web.dee already exists"
    }
  ]
}
```
