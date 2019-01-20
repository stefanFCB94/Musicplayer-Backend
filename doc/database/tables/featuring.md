# Table Featuring

The table saves the information, which artists have a featuring on a specific title. 

For each featuring it is also saved in which order the featured artists are named.

## Table definition

| Column name | Data type | Length | Nullable | Default value | Index |
| --- | --- | --- | --- | --- | --- |
| id | varchar | 36 | no | - | Primary |
| title | varchar | 36 | no | - | Foreign key |
| artist | varchar | 36 | no | - | Foreign key |
| order| integer | - | no | - | - |
| created_at | datetime | - | no | systime | - |
| updated_at | datetime | - | no | systime | - |


## Column description

| Column name | Description |
| --- | --- |
| id | The unique ID of the featuring entry |
| title | The ID of the title, on which the featuring is on |
| artist | The ID of the artist, who has the featuring on the title |
| order | The order number, of the featuring |
| created_at | The timestamp the featuring entry was created |
| updated_at | The timestamp the entry was updated the last time |


## Foreign keys

In the following all foreign Keys are described:

### Title

* Connected table: [Title](./title.md)
* Connected column: **ID**
* Action on update: Cascade
* Action on delete: Cascade

The featuring is connected to one specific title. If the title is deleted, the featuring will be deleted too


### Artist

* Connected table: [Artist](./artist.md)
* Connected column: **ID**
* Action on update: Cascade
* Action on delete: No Action

The featuring is connected to a specific artist. The artist cannot be deleted, while he is connected to at least one featuring entry.
