$(document).ready(function () {

    Config.init();
    updateServers();
    updateDevices();

    $('#add-server').click(function () {
        var server = $('#servers-dialog');
        if (Config.addServer(server.find('input[name=name]').val(), server.find('input[name=url]').val(),
                server.find('input[name=username]').val(), server.find('input[name=password]').val()))
            Notifications.show("Server added.", Notifications.types.success);
        else Notifications.show("A server with the same name already exists. Please change it, as the name is used " +
            "as unique identifier", Notifications.types.error);
        updateServers();
    });

    $('#add-device').click(function () {
        var device = $('#new-device-area');

        if (Config.addDevice(device.find('input[name=devName]').val(), device.find('input[name=devLoc]').val(),
                device.find('select[name=devServer]').val(), device.find('input[name=devDB]').val(),
                device.find('input[name=devQuery]').val(), device.find('select[name=devType]').val(),
                device.find('input[name=devUnit]').val()))
            Notifications.show("Device added.", Notifications.types.success);
        else
            Notifications.show("A device with the same name already exists. Please change it, as the name is used " +
                "as unique identifier", Notifications.types.error);

        console.log(Config.configuration);

        // get the address for device
        getStreet(device.find('input[name=devName]').val(), device.find('input[name=devLoc]').val());
        updateDevices();

    });

    $('#new-device-area').find('input[name=devLoc]').focus(function () {
        Notifications.show("You can click on the map to get the gps coordinates or complete with something like:" +
            " 45.234,32.456", Notifications.types.info);
    });

    $('#update-device').click(function () {
        var updater = $('#edit-device');
        var devName = updater.find('input[name=devName]').val();
        Config.updateDevice(devName, 'location', updater.find('input[name=devLoc]').val());
        Config.updateDevice(devName, 'server', updater.find('select[name=devServer]').val());
        Config.updateDevice(devName, 'database', updater.find('input[name=devDB]').val());
        Config.updateDevice(devName, 'query', updater.find('input[name=devQuery]').val());
        Config.updateDevice(devName, 'type', updater.find('select[name=devType]').val());
        Config.updateDevice(devName, 'unit', updater.find('input[name=devUnit]').val());
        Config.save();
        updateDevices();
        Notifications.show("Device updated.", Notifications.types.success);
    });

    $('#remove-device').click(function () {
        var devName = $('#edit-device').find('input[name=devName]').val();
        if (Config.removeDevice(devName)) {
            Notifications.show("Device removed.", Notifications.types.success);
            updateDevices();
            $('#edit-device').modal('hide');
        } else {
            Notifications.show("Cannot delete device: not found.", Notifications.types.error);
        }

    });

    $('#export-conf').click(function () {
        console.log("called");
        Config.export();
    });

    $('#import-conf').click(function () {
        console.log("called");
        Config.import();
    });


    var devOpts = $('select[name=devType]');
    // update options on device type
    for (var key in DeviceTypesEnumerator)
        devOpts.append($('<option>', {'text': key, 'value': DeviceTypesEnumerator[key]}));

});

var updateDevices = function () {
    if (Config.configuration.devices.length == 0)
        return;

    var container = $('#devices-list');
    container.html('');

    for (var i in Config.configuration.devices) {
        var device = Config.configuration.devices[i];

        var li = $('<div>', {'class': "list-group-item"});
        var row = $('<div>', {'class': "row-content"});
        var value = $('<div>', {'class': "least-content", text: '89 ' + device.unit});
        var title = $('<h4>', {
            'class': "list-group-item-heading", 'html': device.name + "<small> - " +
            getTypeString(device.type) + "</small>"
        });
        var edit = $('<button>', {
            'class': 'close',
            'html': '<i class="glyphicon glyphicon-edit"></i>',
            'alt': 'Edit device data',
            'title': 'Edit device data',
            'data-target': device.name
        });
        edit.click(function () {
            editDevice($(this).attr('data-target'));
        });
        var locate = $('<button>', {
            'class': 'close',
            'html': '<i class="glyphicon glyphicon-screenshot"></i>',
            'alt': 'Locate on map',
            'title': 'Locate on map',
            'data-target': device.location
        });
        locate.click(function () {
            locateDevice($(this).attr('data-target'));
        });

        var desc = $('<p>', {
            'class': "list-group-item-text",
            'text': "Server: " + device.server + ", " + device.address
        });
        var separator = $('<div>', {'class': "list-group-separator"});

        row.append(value);
        row.append(title);
        row.append(edit);
        row.append(locate);
        row.append(desc);
        li.append(row);
        container.append(li);
        container.append(separator);
    }

};

var editDevice = function (devName) {
    var device = Config.getDevice(devName);
    var editor = $('#edit-device');

    editor.find('input[name=devName]').val(device.name);
    editor.find('input[name=devLoc]').val(device.location);
    editor.find('input[name=devDB]').val(device.database);
    editor.find('input[name=devQuery]').val(device.query);
    editor.find('input[name=devUnit]').val(device.unit);

    editor.find('select[name=devServer]').val(device.server).change();
    editor.find('select[name=devType]').val(device.type).change();

    editor.modal('show');
};

var updateServers = function () {
    var container = $('#servers-list');
    var svList = $('select[name=devServer]');

    container.html('');
    svList.html('<option value="">Server</option>');

    for (var i in Config.configuration.servers) {
        var server = Config.configuration.servers[i];
        var tr = $('<tr>');
        tr.append($('<td>', {'text': server.name}));
        tr.append($('<td>', {'text': server.url}));
        tr.append($('<td>', {'text': server.username}));
        tr.append($('<td>', {'text': server.password}));
        var btn = $('<button>', {'class': "btn btn-danger btn-xs", 'data-target': server.name, 'html': 'delete'});
        btn.click(function () {
            var svName = $(this).attr('data-target');
            if (Config.removeServer(svName)) {
                Notifications.show("Server removed.", Notifications.types.success);
                updateServers();
            }
            else {
                Notifications.show("Cannot delete server: not found.", Notifications.types.error);
            }
        });
        tr.append($('<td>').append(btn));
        container.append(tr);

        var opt = $('<option>', {'text': server.name, 'value': server.name});
        svList.append(opt);
    }
};



$('#complete-dialog').on('shown.bs.modal', function () {
    var devName = $('#currentMiniChart').text();

    var chart = c3.generate({
        bindto: '#full_chart',
        data: {
            x: 'x',
            xFormat: '%Y-%d-%m %H:%M:%S',
            columns: fullColumns[devName],
            type: 'area-spline'
        },
        axis: {
            x: {
                type: 'timeseries',
                tick: {
                    format: '%y-%m-%d %H:%M:%S'
                }
            }
        }
    });
});

var initDays = 29;

var cb = function (start, end, label) {
    console.log(start.toISOString(), end.toISOString(), label);
    $('#daterange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
};

var optionSet1 = {
    startDate: moment().subtract(29, 'days'),
    endDate: moment(),
    minDate: '01/01/2014',
    maxDate: '12/12/2040',
    dateLimit: {
        days: 60
    },
    showDropdowns: true,
    showWeekNumbers: true,
    timePicker: false,
    timePickerIncrement: 1,
    timePicker12Hour: true,
    ranges: {
        'Today': [moment(), moment()],
        'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    },
    opens: 'left',
    buttonClasses: ['btn btn-default'],
    applyClass: 'btn-small btn-primary',
    cancelClass: 'btn-small',
    format: 'MM/DD/YYYY',
    separator: ' to ',
    locale: {
        applyLabel: 'Apply',
        cancelLabel: 'Clear',
        fromLabel: 'From',
        toLabel: 'To',
        customRangeLabel: 'Custom',
        daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
        monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        firstDay: 1
    }
};
$('#daterange span').html(moment().subtract(initDays, 'days').format('MMMM D, YYYY') + ' - ' + moment().format('MMMM D, YYYY'));
$('#daterange').daterangepicker(optionSet1, cb);
$('#daterange').on('show.daterangepicker', function () {
    console.log("show event fired");
});
$('#daterange').on('hide.daterangepicker', function () {
    console.log("hide event fired");
});
$('#daterange').on('apply.daterangepicker', function (ev, picker) {
    startDate = picker.startDate.format('YYYY-MM-DD');
    endDate = picker.endDate.format('YYYY-MM-DD');
    console.log("apply event fired, start/end dates are " + picker.startDate.format('MMMM D, YYYY') + " to " + picker.endDate.format('MMMM D, YYYY'));
});
$('#daterange').on('cancel.daterangepicker', function (ev, picker) {
    console.log("cancel event fired");
});
$('#daterange').submit();

$('#options1').click(function () {
    $('#daterange').data('daterangepicker').setOptions(optionSet1, cb);
});
$('#destroy').click(function () {
    $('#daterange').data('daterangepicker').remove();
});