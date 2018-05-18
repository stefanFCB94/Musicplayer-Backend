# Table Local_User

In the table local_user are all local users are saved, with the neccassary informations, which includes the first- and lastname as well as the hashed password of the user.

Each user, which wants to use the systems requires a user account, which at the end requires a entry as local_user.

The table also holds a column, which saves the information, if a user can log in or not. The value can be used to lock users out of the system without deleting the information about him. 

The column can also be used to create users, which are used for systems tasks, like periodic scanning for files. The changes on the database must be made by a user, which information are stored in the updated and created information column. For automatic tasks a not loginable user can be used.

## Table definition

| Column name | Data type | Length | Nullable | Default value | Index |
| --- | --- | --- | --- | --- | --- |
| id | varchar | 36 | no | - | Primary
| firstname | varchar | 64 | yes | - | - |
| lastname | varchar | 64 | no | - | - |
| mail | varchar | 128 | no | - | unique |
| password | varchar | 128 | no | - | - |
| login_possible | int | - | no | 1 | - |
| created_at | datetime | - | no | systime | - |
| updated_at | datetime | - | no | systime | - |


## Column description

| Column name | Description |
| --- | --- |
| id | The unique identifier, that identifies the local user |
| firstname | The firstname of the user |
| lastname | The lastname of the user |
| mail | The mail address of the user. Mail address must be unique, because users in the login process are identified by their mail address |
| password | The hashed password of the user |
| login_possible | 1 if the user can login to the application, 0 if the user has no right to login, because it is used or it is a user for some internal routines |
| created_at | The timestamp, when the user was created |
| updated_at | The timestamp, when the user was updated the last time | 