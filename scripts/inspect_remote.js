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

function runCommand(client, cmd, label) {
  return new Promise((resolve, reject) => {
    client.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      let stderr = '';
      stream.on('data', d => stdout += d.toString());
      stream.stderr.on('data', d => stderr += d.toString());
      stream.on('close', code => {
        console.log(`\n=== [${label}] CMD: ${cmd} (code ${code}) ===`);
        if (stdout) console.log('STDOUT:\n' + stdout);
        if (stderr) console.log('STDERR:\n' + stderr);
        resolve({ code, stdout, stderr });
      });
    });
  });
}

async function main() {
  const jumpConn = new Client();
  
  await new Promise((resolve, reject) => {
    jumpConn.on('ready', resolve);
    jumpConn.on('error', reject);
    jumpConn.connect(jumpConfig);
  });
  console.log('Connected to Jump Host');

  // Check jump host routing/nginx/iptables for port 3006
  await runCommand(jumpConn, 'iptables -t nat -L -n -v | grep 3006 || true', 'Jump Host iptables');
  await runCommand(jumpConn, 'netstat -tuln 2>/dev/null || ss -tuln', 'Jump Host Ports');
  await runCommand(jumpConn, 'which nginx && nginx -T 2>/dev/null | grep -A 15 "3006" || true', 'Jump Host Nginx');

  // Connect to target host
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
    targetConn.connect({
      sock: stream,
      username: targetConfig.username,
      password: targetConfig.password
    });
  });
  console.log('Connected to Target Host');

  // Check target host details
  await runCommand(targetConn, 'ls -la /home/hnf', 'Target Home Dir');
  await runCommand(targetConn, 'ls -la /home/hnf/bphtb-online || true', 'Target App Dir');
  await runCommand(targetConn, 'pm2 list', 'Target PM2');
  await runCommand(targetConn, 'cat /home/hnf/bphtb-online/.env || true', 'Target App .env');

  targetConn.end();
  jumpConn.end();
}

main().catch(console.error);
