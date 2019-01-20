# Table TitleFile

A entry in the table connectes a title to the files, which represents the the title. The table stores the infromation, which file is a specific title and all the additional music file releated information about the file.


## Table defintion

| Column name | Data type | Length | Nullable | Default value | Index |
| --- | --- | --- | --- | --- | --- |
| id | varchar | 36 | no | - | Primary |
| title | varchar | 36 | no | - | Foreign key |
| file | varchar | 36 | no | - | Foreign key | 
| format | varchar | 128 | no | - | - |
| bitrate | integer | - | no | - | - |
| variable | boolean | - | no | false | - |
| channels | varchar | 4 | no | 2.0 | - |
| sample_rate | integer | - | no | - | - |
| created_at | datetime | - | no | systime | - |
| updated_at | datetime | - | no | systime | - |


## Column description

| Column name | Description |
| --- | --- |
| id | The ID of the entry |
| title | The ID of the title, the file is connected to | 
| file | The ID of the library file, the title is connected to |
| format | The format the file as mime type |
| bitrate | The bitrate of the file in kBit/s |
| variable | True, if the bitrate is variable, false if constant |
| channels | The number of channels of the file |
| sample_rate | The sample rate of the file |
| created_at | The timestamp the entry was created |
| updated_at | The timestamp the entry was updated the last time |


## Foreign keys

In the following all foreign keys are described:

### Title

* Connected table: [Title](./title.md)
* Connected column: **ID**
* Action on update: Cascade
* Action on delete: Cascade

The file is connected to a specific title. If the title is deleted, the file should be deleted too.


### File

* Connected table: [LibraryFile](./library_file.md)
* Connected column: **ID**
* Action on update: Cascade
* Action on delete: Cascase

The library file, the title is connected to. If the library file is deleted, the connection to the title is delted too.
