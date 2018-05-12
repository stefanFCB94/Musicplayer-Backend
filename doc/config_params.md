# Configure the application

To configure the application you have to build a configuration file.

All aspects of the application, which can be modified can be part of the configuration file. The configuration file is the main part of the possible customizations and is neccassary to start the application.

Main features / requirements of the configuration file:
* File is configured in JSON
* Different configuration files can be loaded for diffent node environment variables
* A custom configuration file can be loaded with the config paramater on the start of the application


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