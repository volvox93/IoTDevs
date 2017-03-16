// utils 
function date_to_str(date) {
    return date.getFullYear() + '-' + date.getDate() + '-' + date.getMonth() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
}

function getIdFromString(str) {
    return str.replace("[^a-zA-Z0-9]", "_");
}