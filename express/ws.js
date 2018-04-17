const WebSocket = require('ws');
const {handleAdd, handleRemove} = require('./routes/services/handle-addremove');
let wss = null;

function webSocketInitialise(server) {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    ws.isAlive = true;

    ws.on('pong', () => { ws.isAlive = true; });

    ws.on('message', async (message) => {
      message = JSON.parse(message);

      if(message.type === 'add') {
        let result = await handleAdd(message.symbol);

        if(result.push) {
          webSocketAdd({ type: 'add', data: result.data, update: true });
        }
        else {
          webSocketAdd({ type: 'add', update: false });
        }
      }
      else if(message.type === 'remove') {
        let result = await handleRemove(message.symbol);

        if(result.push) {
          webSocketRemove({ type: 'remove', symbol: message.symbol, update: true });
        }
        else {
          webSocketRemove({ type: 'remove', update: false });
        }
      }
    });

    ws.send(JSON.stringify({ connected: true }));
  });

  let connectionCheck = setInterval(() => {
    wss.clients.forEach((client) => {
      if(!client.isAlive) { return(client.terminate()); }
      client.isAlive = false;
      client.ping(null, false, true);
    });
  }, 30000);
}

function webSocketAdd(data) {
  wss.clients.forEach((client) => {
    client.send(JSON.stringify(data));
  });
}

function webSocketRemove(data) {
  wss.clients.forEach((client) => {
    client.send(JSON.stringify(data));
  });
}

module.exports = {
  webSocketInitialise: webSocketInitialise,
  webSocketAdd: webSocketAdd,
  webSocketRemove: webSocketRemove,
}
