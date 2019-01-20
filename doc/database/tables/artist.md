# Table Artist

In the table artist all artists of the music library are stored. Each artist, who performs a title or has a featuring on a title will be stored as entry in the table artist.


## Table defination

| Column name | Data type | Length | Nullable | Default value | Index |
| --- | --- | --- | --- | --- | --- |
| id | varchar | 36 | no | - | Primary |
| name | varchar | 1024 | no | - | Unique |
| created_at | datetime | - | no | systime | - |
| updated_at | datetime | - | no | systime | - |


## Colum description

| Column name | Description |
| --- | --- |
| id | A unique UUID, which identifies the artist entry |
| name | The name of the artist |
| created_at | The timestamp, the artist was created | 
| updated_at | The timestamp, the artist was updated the last time |
