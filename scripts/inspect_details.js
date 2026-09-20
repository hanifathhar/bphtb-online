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

  // Check jump host iptables rules and nginx configs
  await runCommand(jumpConn, 'iptables -t nat -S', 'Jump Host NAT rules');
  await runCommand(jumpConn, 'ls -la /etc/nginx/sites-enabled/ || ls -la /etc/nginx/conf.d/', 'Jump Host Nginx sites');
  await runCommand(jumpConn, 'cat /etc/nginx/sites-enabled/* 2>/dev/null || cat /etc/nginx/conf.d/* 2>/dev/null || true', 'Jump Host Nginx Configs');

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

  // Check target host configs
  await runCommand(targetConn, 'cat /home/hnf/bphtb-online/ecosystem.config.js', 'Target ecosystem.config.js');
  await runCommand(targetConn, 'cd /home/hnf/bphtb-online && git status', 'Target git status');
  await runCommand(targetConn, 'cd /home/hnf/bphtb-online && git remote -v', 'Target git remote');
  await runCommand(targetConn, 'pm2 show bphtb-online', 'Target PM2 bphtb-online details');

  targetConn.end();
  jumpConn.end();
}

main().catch(console.error);
