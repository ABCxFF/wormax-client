# wormax-client
Incomplete interface to interact with [wormax](https://wormax.io) api and game servers

### Contributions

This project is no longer being maintained. If you make any advancements in reversing the wormax client or find bugs, pull requests and issues are welcome


### Example Usage:

```js

const SocketClient = require('../socket/index')
const APIClient = require('../api/index');

const client = new APIClient('default', { lang: 'en', party: '' })

client.recieveInitCookies()
  .then(() => client.getServersByRegion(region))
  .then((servers) => client.getSpawnData(servers[0].key, 'LB Bot'))
  .then((data) => {
    const ws = new SocketClient(data, client.cookies);

    ws.once('accept', () => {
      ws.enter();

      ws.once('leaderboard', (data) => {
        console.log('Retrieved Leaderboard', data)
        ws.close();
      })
    });
});
```
