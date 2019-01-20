# Table Album

In the table album all albums of the music library are stored. Each album reference, which is connected with at least one title will be saved.

To each album the most necassary inforamtion, like the name of the album or the number of tracks and discs, will be saved in the table album.


## Table definition

| Column name | Data type | Length | Nullable | Default value | Index |
| --- | --- | --- | --- | --- | --- |
| id | varchar | 36 | no | - | Primary |
| name | varchar | 1024 | no | - | - |
| artist | varchar | 36 | no | - | Foreign Key |
| title_count | integer | - | yes | - | - |
| disc_count | integer | - | yes | - | - |
| created_at | datetime | - | no | systime | - |
| updated_at | datetime | - | no | systime | - |

## Column description

| Column name | Description |
| --- | --- |
| id | The unique ID of the album |
| name | The name of the album | 
| artist | The ID of the artist, who made the album |
| title_count | The number of titles the  album has |
| disc_count| The number of disc of the album |
| created_at | The timestamp the album entry was created |
| updated_at | The timestamp the album entry was updated the last time |


## Foreign keys

In the following all foreign keys are described:

### Artist

* Connected table: [Artist](./artist.md)
* Connected column: **ID**
* Action on update: Cascade
* Action on delete: No Action

The album is connected to one artist. The artist cannot be deleted while at least album is connected to it.
