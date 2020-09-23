const sockets = require('./clientManager');
const { findLobbyByUser } = require('./matchmaker');

function message(id, message) {
    let user = sockets.getSocket(id);
    if(!user)
        return;

    user.send(message);
}

function messageLobby(userId, message) {
    const lobby = findLobbyByUser(userId);
    if(!lobby)
        return;

    for(let user of lobby.users) {
        sockets.getSocket(user).send(message);
    }
}

module.exports = {
    message,
    messageLobby
}