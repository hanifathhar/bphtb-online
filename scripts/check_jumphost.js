const { Client } = require('ssh2');

const jumpConfig = {
  host: '103.167.12.53',
  port: 22,
  username: 'root',
  password: '@#Tim1t42026'
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

  await runCommand(jumpConn, 'cat /etc/nginx/sites-enabled/* | grep -C 5 "3006" || true', 'Jump Host Nginx 3006');
  await runCommand(jumpConn, 'curl -I http://192.168.1.101:3006 || true', 'Jump Host curl 192.168.1.101:3006');
  await runCommand(jumpConn, 'curl -I http://103.167.12.53:3006 || true', 'Jump Host curl 103.167.12.53:3006');
  await runCommand(jumpConn, 'nginx -T | grep -E "server_name|listen|proxy_pass" || true', 'Jump Host Nginx map');

  jumpConn.end();
}

main().catch(console.error);
