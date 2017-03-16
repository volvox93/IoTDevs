function Server() {
    this.name = null;
    this.url = null;
    this.username = null;
    this.password = null;

    this.init = function (name, url, username, passwd) {
        this.name = name;
        this.url = url;
        this.username = username;
        this.password = passwd;
    };
}