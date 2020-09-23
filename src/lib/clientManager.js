let sockets = {};

function setSocket(id, websocket) {
    sockets[id] = websocket;
}

function getSocket(id) {
    return sockets[id];
}

function removeSocket(id) {
    delete sockets[id];
}

module.exports = {
    setSocket,
    getSocket,
    removeSocket
}