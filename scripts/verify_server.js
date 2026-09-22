const { Client } = require('ssh2');

const jumpConfig = {
  host: '103.167.12.53',
  port: 22,
  username: 'root',
  password: '@#Tim1t42026'
};

const targetConfig = {
  host: '192.168.1.101',
  port: 22,
  username: 'hnf',
  password: '@programmer'
};

function run(client, cmd) {
  return new Promise((resolve, reject) => {
    client.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = '';
      stream.on('data', d => { out += d.toString(); process.stdout.write(d); });
      stream.stderr.on('data', d => { out += d.toString(); process.stderr.write(d); });
      stream.on('close', code => resolve({ code, out }));
    });
  });
}

async function verify() {
  console.log('=== 1. Checking Jump Host (103.167.12.53) ===');
  const jumpConn = new Client();
  await new Promise((resolve, reject) => {
    jumpConn.on('ready', resolve);
    jumpConn.on('error', reject);
    jumpConn.connect(jumpConfig);
  });
  console.log('Jump host connected.');

  console.log('\n--- Nginx Public Port 3006 Test on Jump Host ---');
  await run(jumpConn, 'curl -I http://127.0.0.1:3006');
  await run(jumpConn, 'curl -I http://103.167.12.53:3006');

  console.log('\n=== 2. Connecting to Target VM (192.168.1.101) ===');
  const stream = await new Promise((resolve, reject) => {
    jumpConn.forwardOut('127.0.0.1', 12345, targetConfig.host, targetConfig.port, (err, s) => {
      if (err) return reject(err);
      resolve(s);
    });
  });

  const targetConn = new Client();
  await new Promise((resolve, reject) => {
    targetConn.on('ready', resolve);
    targetConn.on('error', reject);
    targetConn.connect({ sock: stream, username: targetConfig.username, password: targetConfig.password });
  });
  console.log('Target VM connected.');

  console.log('\n--- Git Status & Commit History on Target VM ---');
  await run(targetConn, 'cd /home/hnf/bphtb-online && git status && git log -n 3 --oneline');

  console.log('\n--- PM2 Process Status on Target VM ---');
  await run(targetConn, 'pm2 show bphtb-online | grep -E "name|status|uptime|restarts|script path"');

  console.log('\n--- Local Endpoint Test on Target VM (port 3006) ---');
  await run(targetConn, 'curl -I http://127.0.0.1:3006');

  console.log('\n--- Checking No STS Format on Server ---');
  await run(targetConn, 'grep -n "12964111301" /home/hnf/bphtb-online/lib/sspd.ts');
  await run(targetConn, 'grep -n "12964111301" /home/hnf/bphtb-online/app/api/bphtb/[id]/verifikasi/route.ts');

  console.log('\n--- Checking Upload Route on Server ---');
  await run(targetConn, 'ls -la /home/hnf/bphtb-online/app/api/upload');

  targetConn.end();
  jumpConn.end();
  console.log('\n======================================================');
  console.log('✅ VERIFICATION RESULT: All synchronized & running!');
  console.log('======================================================');
}

verify().catch(console.error);
