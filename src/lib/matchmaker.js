let lobbys = [];

function createLobby(user, type) {
    if (lobbys.find(x => x.users.includes(user)))
        return; // User already in lobbby

    lobbys.push({
        type,
        host: user,
        users: [user]
    });

    return lobbys.find(x => x.host === user);
}

function findLobby(user, type) {
    let lobby = lobbys.find(x => x.type === type && x.users.length < 2); // Increase later
        
    if(!lobby)
        return createLobby(user, type);

    lobby.users.push(user);
    console.log(lobby.users)
    return lobby;
}

function findLobbyByUser(user) {
    return lobbys.find(x => x.users.includes(user));
}

module.exports = {
    findLobby,
    createLobby,
    findLobbyByUser
}