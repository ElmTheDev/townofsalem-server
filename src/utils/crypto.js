function d2h(d) {
    var s = (+d).toString(16);
    if (s.length < 2) {
        s = '0' + s;
    }
    return s;
}

module.exports = {
    d2h
}