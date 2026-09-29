const { Client } = require('ssh2');

const jumpConfig = {
  host: '103.167.12.53',
  port: 22,
  username: 'root',
  password: '@#Tim1t42026',
  readyTimeout: 30000,
  keepaliveInterval: 10000
};

const targetConfig = {
  host: '192.168.1.101',
  port: 22,
  username: 'hnf',
  password: '@programmer',
  readyTimeout: 30000,
  keepaliveInterval: 10000
};

async function test() {
  console.log('Connecting to Jump host...');
  const jumpConn = new Client();
  await new Promise((resolve, reject) => {
    jumpConn.on('ready', resolve);
    jumpConn.on('error', reject);
    jumpConn.connect(jumpConfig);
  });
  console.log('Jump host ready.');

  console.log('Opening forwardOut stream...');
  const stream = await new Promise((resolve, reject) => {
    jumpConn.forwardOut('127.0.0.1', 0, targetConfig.host, targetConfig.port, (err, s) => {
      if (err) return reject(err);
      resolve(s);
    });
  });

  console.log('Connecting to Target VM through stream...');
  const targetConn = new Client();
  await new Promise((resolve, reject) => {
    targetConn.on('ready', resolve);
    targetConn.on('error', reject);
    targetConn.connect({
      sock: stream,
      username: targetConfig.username,
      password: targetConfig.password,
      readyTimeout: 40000
    });
  });
  console.log('Target VM ready!');

  const result = await new Promise((resolve, reject) => {
    targetConn.exec('uname -a && whoami && pwd && node -v && npm -v && pm2 -v && ls -la bphtb-online', (err, execStream) => {
      if (err) return reject(err);
      let out = '';
      let errOut = '';
      execStream.on('data', d => out += d);
      execStream.stderr.on('data', d => errOut += d);
      execStream.on('close', code => resolve({ code, out, errOut }));
    });
  });

  console.log('Target VM output:\n', result.out);
  if (result.errOut) console.error('Target VM stderr:\n', result.errOut);

  targetConn.end();
  jumpConn.end();
}

test().catch(e => {
  console.error('Error in test:', e);
  process.exit(1);
});
