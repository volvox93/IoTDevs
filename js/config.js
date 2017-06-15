var DEBUG = true;


var Config = new function () {
    this.storeKeys = {devices: 'iotDevices', servers: 'iotServers'};
    this.configuration = {
        servers: [],
        devices: [],
        apiKey: 'AIzaSyCKQqo1jNNq0hwzKhL_hRof0bft562M2qk'
    };

    this.init = function () {
        this.get();
        if (this.configuration.servers === null && DEBUG) {
            this.configuration.servers = [];
            Notifications.show("Null servers configuration on init.", Notifications.types.warning);
        }
        if (this.configuration.devices === null && DEBUG) {
            this.configuration.devices = [];
            Notifications.show("Null devices configuration on init.", Notifications.types.warning);
        }
        // save the config, in case of null or error, the conf will be reset
        this.save();
        Notifications.show("Loaded " + this.configuration.servers.length + " servers and " +
            this.configuration.devices.length + " devices.", Notifications.types.info);
    };

    this.get = function () {
        try {
            this.configuration.servers = JSON.parse(localStorage.getItem(this.storeKeys.servers));
        }
        catch (err) {
            this.configuration.servers = [];
            Notifications.show("Cannot load servers configuration. Servers reset. <br>" + (DEBUG ? err.message : ''),
                Notifications.types.error);
        }
        try {
            this.configuration.devices = JSON.parse(localStorage.getItem(this.storeKeys.devices));
        }
        catch (err) {
            this.configuration.devices = [];
            Notifications.show("Cannot load devices configuration. Devices reset. <br>" + (DEBUG ? err.message : ''),
                Notifications.types.error);
        }
        return this.configuration;
    };

    this.save = function () {
        localStorage.setItem(this.storeKeys.devices, JSON.stringify(this.configuration.devices));
        localStorage.setItem(this.storeKeys.servers, JSON.stringify(this.configuration.servers));
        if (DEBUG) console.log('Configuration saved.');
    };

    this.addServer = function (name, url, username, passwd) {
        var server = new Server();
        // search for same name server
        for (var i in this.configuration.servers)
            if (name == this.configuration.servers[i].name)
                return false;

        server.init(name, url, username, passwd);
        this.configuration.servers.push(server);
        this.save();
        return true;
    };

    this.removeServer = function (svName) {
        for (var i in this.configuration.servers)
            if (svName == this.configuration.servers[i].name) {
                this.configuration.servers.splice(i, 1);
                this.save();
                return true;
            }
        return false;
    };

    this.getServer = function (svName) {
        for (var i in this.configuration.servers)
            if (svName == this.configuration.servers[i].name)
                return this.configuration.servers[i];
        return null;
    };

    this.addDevice = function (name, location, server, database, query, type, unit) {
        var device = new Device();
        // search for same name device
        for (var i in this.configuration.devices)
            if (name == this.configuration.devices[i].name)
                return false;
        device.init(name, location, server, database, query, type, unit);
        this.configuration.devices.push(device);
        this.save();
        return true;
    };

    this.updateDevice = function (name, key, value) {
        for (var i in this.configuration.devices) {
            if (name == this.configuration.devices[i].name) {
                // the one that needs update
                this.configuration.devices[i][key] = value;
            }
        }
    };

    this.removeDevice = function (devName) {
        for (var i in this.configuration.devices)
            if (devName == this.configuration.devices[i].name) {
                this.configuration.devices.splice(i, 1);
                this.save();
                return true;
            }
        return false;
    };

    this.getDevice = function (devName) {
        for (var i in this.configuration.devices)
            if (devName == this.configuration.devices[i].name)
                return this.configuration.devices[i];
        return null;
    };

    this.export = function () {
        var button = document.createElement("a");
        button.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.configuration)));
        button.setAttribute("download", "iotDev.json");
        if (document.createEvent) {
            var event = document.createEvent('MouseEvents');
            event.initEvent('click', true, true);
            button.dispatchEvent(event);
        }
        else {
            button.click();
        }

        Notifications.show("Exported to iotDev.json.", Notifications.types.success);
        if (DEBUG) console.log('Exported');
    }

    this.__async_readFile = function (evt) {
           var files = evt.target.files;
           var file = files[0];
           var reader = new FileReader();
           reader.onload = function() {
                result = Config.configuration;
                try {
                    result = JSON.parse(this.result);
                }
                catch (err) {
                    Notifications.show("Cannot load from input. Discarding file. <br>" + (DEBUG ? err.message : ''),
                        Notifications.types.error);
                    if (DEBUG) {
                        console.log("Cannot load from input. Discarding file. Logging error.");
                        console.log(err);
                    }
                    return;
                }
                // TODO: validate the user input
                Config.configuration = result;
                Config.save();
                Notifications.show("Loaded the data <br>", Notifications.types.success);
                updateDevices();
                maps_redraw();
           }
           reader.readAsText(file)
        }

    this.import = function () {
        var input = document.createElement("input");
        input.setAttribute("type", "file");
        input.addEventListener('change', this.__async_readFile, false);
        input.click();
    }

};
