
# How to setup the tutorial
1. Run `setup.bat` to install all the dependencies
2. Run `start.bat` to start the tutorial apps

3. Add the applications to the core-seed project
    1. Stop the core-seed project if it is already running
    2.  Open the config.json file at the root folder of core-seed project - https://github.com/Glue42/core-plus-seed/blob/master/config.json#L16 and add the following application definitions:
    ```json
    {
        "name": "js-clients",
        "type": "window",
        "title": "Clients",
        "details": {
            "url": "http://localhost:9002/clients"
        },
        "customProperties": {
            "includeInWorkspaces": true
        }
    },
    {
        "name": "js-client-details",
        "type": "window",
        "title": "Client Details",
        "details": {
            "url": "http://localhost:9002/client-details"
        },
        "customProperties": {
            "includeInWorkspaces": true
        }
    }
    ```
    3. Run `npm run updateConfig` command in order for the changes to take effect
    4. Start the core-seed project
