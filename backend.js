import WebSocket, { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 6969 });
let messages = []

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);
  for (let index = 0; index < messages.length; index++) {
    const element = messages[index];
    ws.send("message:" + element.id + ":" + element.msg)
  }

  ws.on('message', function message(data, isBinary) {
    let command = data.toString().split(":")
    if (command[0] == "login") {
        wss.clients.forEach(function each(client) {
        if (client.name == command[1]) {
            ws.close()
        }
        });
        ws.name = command[1]
    }
    else if(command[0] == "message"){
    messages.push({msg:ws.name + ": " + command[2], id: command[1], name:ws.name})
    wss.clients.forEach(function each(client) {
    client.send("message:" + command[1] + ":" + ws.name + ": " + command[2], { binary: isBinary })
    });
    }
    else if(command[0] == "delete"){
        for (let index = 0; index < messages.length; index++) {
            const element = messages[index];
            if (element.id == command[1] && element.name == ws.name) {
                messages.splice(index,1)
                wss.clients.forEach(function each(client) {
                client.send("delete:" + command[1])
                });
                break
            }
        }
    }
    else if(command[0] == "edit"){
        for (let index = 0; index < messages.length; index++) {
            const element = messages[index];
            if (element.id == command[1] && element.name == ws.name) {
                messages[index].msg = ws.name + ": " + command[2]
                wss.clients.forEach(function each(client) {
                client.send("edit:" + command[1] + ":" + ws.name + ": " + command[2], { binary: isBinary })
                });
                break
            }
        }
    }
  });
});