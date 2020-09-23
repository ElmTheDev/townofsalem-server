'use strict';
const fs = require('fs');
const Https = require('https');
const uuid = require('uuid-random');

const WebSocketServer = require('ws').Server;

const {
    setSocket,
    removeSocket,
    getSocket
} = require('./src/lib/clientManager');
const {
    findLobby, findLobbyByUser
} = require('./src/lib/matchmaker');
const {
    messageLobby
} = require('./src/lib/messageManager');

const PAYLOADS = require('./src/payloads/constants');

const {
    generateMessagePayload,
    generateUserInLobbyPayload,
    generateUserLeftPayload
} = require('./src/payloads/methods');

const privateKey = fs.readFileSync('key.pem', 'utf8');
const certificate = fs.readFileSync('cert.pem', 'utf8');

const credentials = {
    key: privateKey,
    cert: certificate
};

const httpsServer = Https.createServer(credentials);
const wss = new WebSocketServer({
    server: httpsServer
});

wss.on('connection', (ws) => {
    ws.id = uuid();
    setSocket(ws.id, ws);

    ws.on('message', async (data) => {
        if (data.toString().includes("iv\":")) { // Is login attempt
            ws.send(Buffer.from("0102", "hex")); // Positive login respones
            ws.send(Buffer.from("J75*46*6*31*0", "utf8"));
            ws.send(Buffer.from("250102020201023333020203", "hex")); // Not sure what this is (All Unicode)
            ws.send(Buffer.from(".42,-3,1,39,31,0,-2,-2,-2,", "utf8"));

            const username = "admin";
            const goldValue = 99999;
            const silverValue = 99999;
            ws.send(Buffer.from(`\u001c${username}*${goldValue}*${silverValue}*1`, "utf8")); // *1 is possibly user ID
            ws.send(Buffer.from("X11*31", "utf8"));
            ws.send(Buffer.from("C3", "hex"));
            ws.send(Buffer.from("349488673", "utf8"));

            ws.send(Buffer.from("0,1,2,3,4,5,6,7,8,9,11,12,13,14,15,16,19,20,21,22,23,24,25,26,27,28,29,31,32,33,35,36,37,39,40,43,44,45,47,48,49,51,52,55,56,57,59,60,61,63,64,67,68,71,72,75,76,79,83,84,85,87,91,92,93,95,99,103,104", "utf8"));

            // Character toggles
            ws.send(Buffer.from("+0,1,2,3,4,5,6,7,8,9,11,12,13,14,15,16,19,20,21,22,23,24,25,26,27,28,29,31,32,33,35,36,37,39,40,43,44,45,47,48,49,51,52,55,56,57,59,60,61,63,64,67,68,71,72,75,76,79,83,84,85,87,91,92,93,95,99,103,104", "utf8"));

            // Map toggle
            ws.send(Buffer.from("-0,1,2,3,4,5,6,7,8,9,11,12,13,14,15,16,19,20,21,22,23,24,25,26,27,28,29,31,32,33,35,36,37,39,40,43,44,45,47,48,49,51,52,55,56,57,59,60,61,63,64,67,68,71,72,75,76,79,83,84,85,87,91,92,93,95,99,103,104", "utf8"));

            // Houses
            ws.send(Buffer.from(",0,1,2,3,4,5,6,7,8,9,11,12,13,14,15,16,19,20,21,22,23,24,25,26,27,28,29,31,32,33,35,36,37,39,40,43,44,45,47,48,49,51,52,55,56,57,59,60,61,63,64,67,68,71,72,75,76,79,83,84,85,87,91,92,93,95,99,103,104", "utf8"));

            ws.send(Buffer.from("217,39,45", "utf8"));

            // Friends
            ws.send(Buffer.from("\u0014admin,1,\u0001,2*Elm,2,\u0001,2", "utf8"));

            ws.send(Buffer.from("50,12,31,38,44", "utf8"));
            ws.send(Buffer.from("60", "utf8"));
            ws.send(Buffer.from("W0*3,1*3,2*4,3*1", "utf8"));
            ws.send(Buffer.from("\uFFFD2*6", "utf8"));

            ws.send(Buffer.from("DA01020304060708090A0B0C0D12131415", "hex"));
            ws.send(Buffer.from("E401", "hex"));
            ws.send(Buffer.from("DB01", "hex"));
            ws.send(Buffer.from("\uFFFD6,59,316,407,5,181,1726,4,0,10,2,4,0,2,-1,-1", "utf8"));
            ws.send(Buffer.from("\uFFFD12,0,0,0,0,0,0,4,0,10,0,0,0,0,-1,-1", "utf8"));
            ws.send(Buffer.from("\uFFFD1,3,7,0,-50035909,5*1*2*3*4*6,", "utf8"));

            ws.send(Buffer.from("\uFFFD50186", "utf8"));

        } else if (data.toString("utf8") == "K\u0000") {
            ws.send(Buffer.from("\uFFFD1,3,7,0,-50035909,5*1*2*3*4*6,", "utf8")); // Unsure what this one does
        } else if (data.toString('utf8') == "J31607100,1\u0000") {
            ws.send(Buffer.from("\uFFFD50186", "utf8")); // Unsure as well
        } else if (data.toString('hex') == "1e0100") {
            // Start normal solo game
            console.log(`${ws.id} started matchmaking`);

            let lobby = findLobby(ws.id, "normal");
            ws.send(Buffer.from(PAYLOADS.JOINED_LOBBY, "hex"));

            for (let user of lobby.users) {
                if (user !== ws.id) {
                    getSocket(user).send(Buffer.from(generateUserInLobbyPayload(ws.id, false), "utf8"));
                }
                ws.send(Buffer.from(generateUserInLobbyPayload(user, lobby.host === user), "utf8"));
            }
        } else if (data.toString('hex').startsWith('03') && data.toString('hex').endsWith("00")) {
            const parsedMessage = data.toString('utf8').trim();
            messageLobby(ws.id, Buffer.from(generateMessagePayload(1, parsedMessage), "hex"))
        } else {
            // Unhandled request
            console.log(`Buffer: ${data}\nHex: ${data.toString("hex")}\nString: ${data.toString("utf8")}`)
        }
    });

    ws.on('close', () => {
        removeSocket(ws.id);
        let lobby = findLobbyByUser(ws.id);
        if(lobby) {
            lobby.users = lobby.users.filter(x => x !== ws.id);
            for(let user of lobby.users) {
                // getSocket(user).send(Buffer.from(generateUserLeftPayload(ws.id), "hex"));
            }
        }
        console.log('socket closed');
    });
});

httpsServer.listen(3700);