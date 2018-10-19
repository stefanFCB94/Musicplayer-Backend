# Table Library_File

In the table library_file all files, which are be part of the saved muic library, are stored.
The table can be seen as the file index of the music libraries folders.

Each file in the library folders will be stored with a MD5 checksum, through which new files and a renaming of files can be detected.

Also futher information about the file are stored in the database, to get access to these information for applications.


## Table defination

| Column name | Data type | Length | Nullable | Default value | Index |
| --- | --- | --- | --- | --- | --- |
| id | varchar | 36 | no | - | Primary |
| path | varchar | 1024 | no | - | - |
| checksum | varchar | 32 | no | - | Unique |
| filesize | int | - | no | - | - |
| created_at | datetime | - | no | systime | - |
| updated_at | datetime | - | no | systime | - |


## Column description

| Column name | Description |
| --- | --- |
| id | A unique UUID vlaue, which identifies the file entity |
| path | The absolute path to the file on the filesystem |
| checksum | The calculated MD5 checksum of the library file |
| filesize | The size of the files in bytes |
| created_at | The timestamp, the file reference was created |
| updated_at | The timestamp, the file reference was updated the last time |