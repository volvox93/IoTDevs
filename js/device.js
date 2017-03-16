function Device() {
    this.name = null;
    this.location = null;
    this.server = null;
    this.database = null;
    this.query = null;
    this.type = null;
    this.unit = null;
    this.address = 'Unknown Address';

    this.init = function (name, location, server, database, query, type, unit) {
        this.name = name;
        this.location = location;
        this.server = server;
        this.database = database;
        this.query = query;
        this.type = type;
        this.unit = unit;
    };
}

var DeviceTypesEnumerator = {
    acceleration: 0,
    acoustic: 1,
    chemical: 2,
    electric: 3,
    force: 4,
    humidity: 5,
    optical: 6,
    motion: 7,
    proximity: 8,
    pressure: 9,
    temperature: 10,
    undefined: -1
};

var getTypeString = function (type) {
    for (var i in DeviceTypesEnumerator) {
        if (type == DeviceTypesEnumerator[i])
            return i.toString();
    }
    return 'undefined';
}