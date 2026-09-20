const { Client } = require('ssh2');

const jumpConfig = {
  host: '103.167.12.53',
  port: 22,
  username: 'root',
  password: '@#Tim1t42026'
};

async function main() {
  const jumpConn = new Client();
  await new Promise((resolve, reject) => {
    jumpConn.on('ready', resolve);
    jumpConn.on('error', reject);
    jumpConn.connect(jumpConfig);
  });

  jumpConn.exec('cat /etc/nginx/sites-enabled/* || true', (err, stream) => {
    let out = '';
    stream.on('data', d => out += d);
    stream.on('close', () => {
      console.log('Nginx config:\n', out);
      jumpConn.end();
    });
  });
}

main().catch(console.error);
