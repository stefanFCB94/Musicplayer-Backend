# Table Storage_File

In the table storage_file all file, which are stored are saved.
The table can be seen as index of the storage.

Each file, which is generated by the musicserver is stored in the storage space and for each of that files a reference is created in the table storage_file.

Files of each type are stored in the table, e.g. cover images or artist images of various sizes.
Each file will be saved with the UUID as filename and has a unique ID to identify the file.

Eache file will be saved with the corresponding MD5 checksum to detect changes of a file and to identify files, that are already stored in the respository. The MD5 is used to protect the duplicate storage of the same file under differnt names.

## Table definition

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
| id | A UUID value, which identifies the file entity |
| path | The path of the file in the storage. It will be saved the fullpath to the file from the root folder of the storage |
| checksum | The MD5 of the saved file. Used to identify changed files in the storage |
| filesize | The filesize of the referenced file in bytes |
| created_at | The timestamp, the file reference entity was created |
| updated_at | The timestamp, when the file reference was updated the last time |
