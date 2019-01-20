# Table Title

The table holds all information about the available music title, which are available in music library. The table does not hold the information, where the files for the title are saved.


## Table definition

| Column name | Data type | Length | Nullable | Default value | Index |
| --- | --- | --- | --- | --- | --- |
| id | varchar | 36 | no | - | Primary |
| title | varchar | 1024 | no | - | - |
| artist | varchar | 36 | no | - | Foreign key |
| album | varchar | 36 | yes | - | Foreign key |
| duration | integer | - | no | - | - |
| year | integer | - | yes  | - | - |
| track_number | integer | - | yes | - | - |
| cd_number | integer | - | yes | - | - |
| playcount | integer | - | no | 0 | - |
| skipcount | integer | - | no | 0 | - |
| created_at | datetime | - | no | systime | - |
| updated_at | datetime | - | no | systime | - |


## Column description

| Column name | Description |
| --- | --- | 
| id | The unique ID of the title |
| title | The title name |
| artist | The ID of the artist, who performed the title |
| album | The ID of the album, on which the album is part of |
| duration | The duration of the title in seconds |
| year | The year, the title was released |
| track_number | The track number the title is on the album |
| cd_number | The disc number of the album, the title is on |
| playcount | How often the title was played |
| skipcount | How often the title was skipped |
| created_at | The timestamp the title was created |
| updated_at | The timestamp the title was updated the last time |


## Foreign keys

 In the following, all foreign keys are described:

### Artist

* Connected table: [Artist](./artist.md)
* Connected column: **ID**
* Action on update: Cascade
* Action on delete: No Action

The title is connected to one artist. The artist cannot be deleted while at least one title is is connected to that artist.

### Album

* Connected table: [Album](./album.md)
* Connected column: **ID**
* Action on update: Cascade
* Action on delete:  No Action

The album can be part of one album. The album cannot be deleted while at least one title is part of the that album.
