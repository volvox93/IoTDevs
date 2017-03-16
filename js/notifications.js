var Notifications = new function () {
    this.visibleTime = 10;
    this.types = {success: 'success', info: 'info', error: 'error', warning: 'warning'};
    this.typesDescriptor = {
        success: {css: 'alert-success', title: 'Success!'},
        error: {css: 'alert-danger', title: 'Error!'},
        warning: {css: 'alert-warning', title: 'Warning!'},
        info: {css: 'alert-info', title: 'Info!'}
    };

    this.show = function (text, type) {
        var notifArea = $('#notifications-area');
        var newAlert = this.create(text, type);
        notifArea.append(newAlert);

        setTimeout(function () {
            newAlert.remove();
        }, this.visibleTime * 1000);
    };

    this.create = function (text, type) {
        var container = $('<div>', {'class': 'alert alert-dismissible ' + this.typesDescriptor[type].css});
        var close = $('<button>', {'class': 'close', 'data-dismiss': 'alert', 'text': '×'});
        var title = $('<h4>', {'text': this.typesDescriptor[type].title});
        var message = $('<p>', {'html': text});

        container.append(close);
        container.append(title);
        container.append(message);

        return container;
    };
};