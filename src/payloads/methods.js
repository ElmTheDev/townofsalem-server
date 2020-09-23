const {
    d2h
} = require('../utils/crypto');

function generateMessagePayload(userId, message) {
    return `06FF${d2h(userId).toUpperCase()}${Buffer.from(message, "utf8").toString("hex").toUpperCase()}`
}

function generateUserLeftPayload(userId) {
    return `050202${d2h(userId).toUpperCase()}`;
}

function generateUserInLobbyPayload(username, host = false) {
    return host ? `\u0004\u0002 ${username}*\u0004\u0001` : `\u0004\u0001 ${username}*\u0004\u0001`;
}

module.exports = {
    generateMessagePayload,
    generateUserInLobbyPayload,
    generateUserLeftPayload
}