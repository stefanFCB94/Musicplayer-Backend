# Configure the application

To configure the application you have to build a configuration file.

All application preferences can be configured through a configuration file.
At least the database connection must be configured through in the configuration file.

All other options can be configured in the file or via the database.
The configured values in the database have a higher priority than the values from the config file.
If a value is configured in the database and the configuration file, then the value from the database is used.

Main features / requirements of the configuration file:
* File is configured in JSON
* Different configuration files can be loaded for diffent node environment variables
* A custom configuration file can be loaded with the config paramater on the start of the application

Main features / requirements of the database configuration:
* Connection to database must be configured in config file
* Options are configured in the table system_preferences
* Multiple values can be stored to a preference


# Loading different configuration files

Normally the configuration files are stored in the "config" directory of the application root directory.

In that directory can be stored different configuration files and the file suited the **NODE_ENV** environment variable will be loaded.

For example:
> NODE_ENV=production
>
> File loaded = <Application_Root>/config/production.json 

## Loading a manual configuration file

If you want to load a configuraiton file from custom directory you can start the application with the **--config** paramter.

With that parameter you can set a manual path to the configuration. A config paramter you must set the path to the file

> #> ./dist/lib/index.js --config ./custom_config.json


# Available configuration parameters

In the following section are listed all available configuration parameter and a description of the each of these parameters.

## Parameter for the server

The following paramter defines configuration paramter to configure the server and its api. The configuration parameter are mostly optional, but should be read carfully, espacially the ports, on which the server should run on.

Configuration parameters should match the conifguration for the clients of the server, espacially the ports and the graphql endpoint to get data from the api.

Paramter | Default value | Description
--- | --- | ---
SERVER.HTTP_PORT | 3000 | The port on which the HTTP server would be available
SERVER.HTTPS_PORT | 3001 | The port on which the HTTPS server would be available
SERVER.USE_HTTPS | false | True or false, if HTTPS should be used for th api
SERVER.PRIVATE_KEY | - | Only required, if HTTPS is used for the api. Configuration paramter defines the path to the private key file, used for the SSL encryption
SERVER.CERTIFICATE | - | Only required, if HTTPS is used for the api. Configuration paramter defines the path to the certificate used for the SSL encryption
SERVER.GRAPHQL_ENDPOINT | /graphql | The URL endpoint, where the graphql api is available
SERVER.GRAPHIQL_ENDPOINT | /graphiql | Only required, if the graphiql endpoint is activated. Defineds the URL endpoint on which the graphical user interface for the graphql api is available
SERVER.GRAPHIQL_ACTIVE | true | True or false, if the graphical user interface for the graphql endpoint should be activated
SERVER.REST_ENDPOINT | /rest | The base url of the REST api of the musicserver


## Parameter for the logger

Parameter | Default value | Description
--- | --- | ---
LOGGER.LEVEL | warn | The level which messages are logged.<br />Available levels, in ascending orders:<br /><ul><li>error</li><li>warn</li><li>info</li><li>verbose</li><li>debug</li><li>silly</li></ul>
LOGGER.DIRECTORY | . | The directory, in which the log file will be saved. All configuration files will be stored in that directory
LOGGER.FILENAME | musicserver | The name of the log file.<br /> The log file will be saved with a suffix (e.g. a timestamp) and the date type log
LOGGER.SINGLE_FILE | false | If true a log file will be stored in the logger directory and all logs will be stored in these file
LOGGER.CONSOLE | true | If true all the logs will be printed on the console
LOGGER.ROTATION_FILE | true | If true in the logger directory will be stored a log file, which will be rotated every day. So in the directory will be a log file for every day.

## Parameter for the database connection

All parameters of the database are required.
Without each of the parameters the musicserver will not start.

Parameter | Default value | Description
--- | --- | ---
DATABASE.TYPE | | The type of the database you want to connect to.<br /> Allowed values:<br /><ul><li>mysql</li><li>pg</li><li>mssql</li></ul>
DATABASE.HOST | | The host address of the database you want to connect to
DATABASE.PORT | | The port, on which the database connector is listening on
DATABASE.USERNAME | | The user, with which the database connection should be established. The user needs full rights on the database / the schema, including the right to create and drop tables
DATABASE.PASSWORD | | The password, which should be used to connect to the database
DATABASE.DATABASE | | The name of the schema, the databse, in which the information of the musicserver should be stored. In the best case that should be a emtpy database, where only the defined user has access on

## Security parameters

The following parameters can be used to configure the security level of the application.
The parameters are optional and are configured with a default value to achieve a moderate security level.

Paramter | Default value | Description
--- | --- | ---
SECURITY.SALT_ROUNDS | 10 | The number of rounds, which are used to generate a salt for the hashing of the passwords

## Authentification paramters

The following parameters can be used to configure the authentification service for your interests.
The paramters are optional.

Parameter | Default value | Description
--- | --- | ---
SIGNUP.POSSIBLE | false | A config paramter, which shows, if the self-signup for users is available. If false new users can only be created by the administartor of the application

## Storage parameters

The following paramters are required, to save files to the filesystem, which is required by the application.

In the storage various files, like covers or artist pictures will be saved.

Select a empty directory, on which the process of the application server has write acces to. The rest of the file structure will be created automatically.

Parameter | Default value | Description
--- | --- | ---
STORAGE.PATH | - | The absolute path on the filesystem, where the files of the application should be stored in


## Image processing parameters

The following parameters can be used to configure the image processing.

Parameter | Default value | Description
--- | --- | ---
IMAGE.FORMAT | JPEG | The format to which the images should be converted
