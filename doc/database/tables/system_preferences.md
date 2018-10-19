# Table System_Preferences

In the table system_preferences all system preferences are stored.
In the table all preference values, that goes further than the database configuration are stored.
Possible preferences are for example: (The number of hash rounds, repositories to scan for music, the storage directory, etc.)

The database stores each preference value as its own table entry.
Each entry has a unique identifier and a setting key.

The setting key defines, the system setting, the value is for.
With that format it is possible to store multiple values for each system setting.

## Table definition

| Column name | Data type | Length | Nullable | Default value | Index |
| --- | --- | --- | --- | --- | --- |
| id | varchar | 36 | no | - | Primary |
| setting | varchar | 255 | no | - | - |
| value | varchar | 1024 | yes | - | - |
| created_at | datetime | - | no | systime | - |
| updated_at | datetime | - | no | systime | - |

## Column description

| Column name | Description |
| --- | --- |
| id | A UUID value, which identifies the system preference value entry |
| setting | The setting key, the value belongs to |
| value | The system preference value |
| created_at | The timestamp, the system preference value was created |
| updated_at | The timestamp, when the system preference was updated the last time |
