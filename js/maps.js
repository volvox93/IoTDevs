// google maps helper
var poli = {lat: 44.4441596, lng: 26.0513788};
var map = null;
var markers = [];
var info = [];
var rawData = {};
var parsedData = {};
var minifiedData = [];
var infowindow;
var fullColumns = {};
var targetColumns = {};

var maps_redraw = function () {
    // init map & stuff
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: poli
    });
    google.maps.event.addListener(map, 'click', function (event) {
        var lat = event.latLng.lat();
        var lng = event.latLng.lng();
        $('#new-device-area').find('input[name=devLoc]').val(lat + ',' + lng);
    });

    infowindow = new google.maps.InfoWindow();


    // parse all devices and place them on the map
    for (var i in Config.configuration.devices) {
        var device = Config.configuration.devices[i];
        var server = Config.getServer(device.server);

        // get the device data
        $.ajax({
            type: "GET",
            url: server.url,
            dataType: 'json',
            indexValue: device.name,
            headers: {
                "Authorization": "Basic " + btoa(server.username + ':' + server.password)
            },
            data: {pretty: true, db: device.database, q: device.query},
            success: function (data) {
                var device = Config.getDevice(this.indexValue);
                rawData[device.name] = data;
                addDeviceOnMap(device);
                console.log(data);
                console.log(device.query);
                console.log(server.url);
            }
        });
    }

}

$(window).load(maps_redraw);

var get10 = function(deviceName, domain){
    // get the last 10 values
    console.log(domain);

    var x_l_axis = [];
    var y_l_axis = [];

    x_axis = fullColumns[deviceName][0];
    y_axis = fullColumns[deviceName][1];
    var target = 25;
    last = x_axis.length;
    if(target < last){
        target = last;
    }
    i = 0;
    var l_val = null;
    for(i = 0; i < x_axis.length-1; i+= x_axis.length/10){
        if(y_axis[i] !== undefined && x_axis[i] !== undefined){
            y_l_axis.push(y_axis[i]);
            x_l_axis.push(x_axis[i]);
        }
    }
    
    if(y_axis[last] !== undefined && x_axis[last] !== undefined){
        y_l_axis.push(y_axis[last]);
        x_l_axis.push(x_axis[last]);
    }
    x_l_axis.unshift('x');
    y_l_axis.unshift(deviceName);
    console.log([x_l_axis. y_l_axis]);
    return [x_l_axis, y_l_axis];
}

var addDeviceOnMap = function (device) {
    // first parse the data
    var devId = device.name;
    var data = rawData[devId];
    var results = data['results'];

    var x_axis = [];
    var y_axis = [];

    for (var i in results) {
        var series = results[i];
        for (var j in series) {
            var arr = series[j];
            for (var p in arr) {
                var devData = arr[p];
                console.log(devData);
                for (var x in devData['values']) {
                    var c = devData['values'][x];
                    var d = new Date(Date.parse(c[0]));

                    x_axis.push(date_to_str(d));
                    y_axis.push(c[1]);
                }
            }
        }
    }

    // generate info window chart data
    info[devId] = ' <h3 class="firstHeading" id="currentMiniChart">' + device.name + '</h3>' +
        '<div class="row m-n">' +
        '<div class="col-md-6"><a href="javascript:void(0)" class="btn btn-success" disabled>Data variation</a></div>' +
        '<div class="col-md-6"><button type="button" class="btn btn-primary pull-right" data-toggle="modal" data-target="#complete-dialog">View complete data</button></div>' +
        '</div>' +
        '<div id="chart_mini" class="map-chart">' +
        '</div>' +
        '<div class="">' +
        '<label><input type="checkbox" data-target="' + device.name + '"> Add to compare</label>' +
        '</div>';


    var location = getCoordinates(device.location);

    markers[devId] = new google.maps.Marker({
        position: new google.maps.LatLng(location.lat, location.lng),
        map: map
    });


    google.maps.event.addListener(markers[devId], 'click', (function (marker, i) {
        return function () {
            infowindow.setContent(info[i]);
            infowindow.open(map, marker);
        }
    })(markers[devId], devId));


    // get the last 10 values
    var last = 10;
    var x_l_axis = [];
    var y_l_axis = [];

    i = 0;
    var l_val = null;
    while (x_l_axis.length <= last && i < x_axis.length) {
        if (x_axis[i] != l_val) {
            l_val = x_axis[i];
            y_l_axis.push(y_axis[i]);
            x_l_axis.push(x_axis[i]);
        }
        i++;
    }

    x_l_axis.unshift('x');
    y_l_axis.unshift(device.name);

    minifiedData[device.name] = [x_l_axis, y_l_axis];

    google.maps.event.addListener(infowindow, 'domready', (function (devId) {
        return function () {
            var devName = $('#currentMiniChart').text();

            if (devName == devId) {
                chartTheseColumns('#chart_mini', minifiedData[devId]);
            }
        }
    })(device.name));

    x_axis.unshift('x');
    y_axis.unshift(device.name);

    fullColumns[device.name] = [x_axis, y_axis];
    targetColumns[device.name] = fullColumns[device.name];
    //targetColumns[device.name] = get10(device.name);
    console.log(fullColumns[device.name]);
    console.log(targetColumns[device.name]);

    autoCenter();

};

var getStreet = function (devName, latlng) {
    $.ajax({
        type: 'GET',
        url: "https://maps.googleapis.com/maps/api/geocode/json",
        dataType: 'json',
        data: {
            'latlng': latlng,
            'key': Config.configuration.apiKey
        },
        success: function (data) {
            var newAddress = "Unknown Address";
            if (data.status == "OK") {
                // get the address
                newAddress = data.results[0].formatted_address;
            }
            updateDeviceAddress(devName, newAddress);
        }
    });
};

var updateDeviceAddress = function (devName, address) {
    Config.updateDevice(devName, 'address', address);
    Config.save();
    updateDevices();
};


var locateDevice = function (latlng) {
    var newCrds = getCoordinates(latlng);
    map.setCenter(new google.maps.LatLng(newCrds.lat, newCrds.lng));
    map.setZoom(16);
};

var getCoordinates = function (latlng) {
    var res = latlng.split(',');
    return {lat: parseFloat(res[0]), lng: parseFloat(res[1])};
};

var autoCenter = function () {
    var bounds = new google.maps.LatLngBounds();
    for (var i in markers) {
        console.log(i);
        bounds.extend(markers[i].position);
    }

    map.fitBounds(bounds);
}