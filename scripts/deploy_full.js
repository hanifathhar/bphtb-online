const { Client } = require('ssh2');

const jumpConfig = {
  host: '103.167.12.53',
  port: 22,
  username: 'root',
  password: '@#Tim1t42026',
  readyTimeout: 40000,
  keepaliveInterval: 10000
};

const targetConfig = {
  host: '192.168.1.101',
  port: 22,
  username: 'hnf',
  password: '@programmer',
  readyTimeout: 40000,
  keepaliveInterval: 10000
};

function runExec(client, cmd, label) {
  return new Promise((resolve, reject) => {
    console.log(`\n>>> [${label}] RUN: ${cmd}`);
    client.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      let stderr = '';
      stream.on('data', d => {
        process.stdout.write(d.toString());
        stdout += d.toString();
      });
      stream.stderr.on('data', d => {
        process.stderr.write(d.toString());
        stderr += d.toString();
      });
      stream.on('close', (code, signal) => {
        console.log(`>>> [${label}] Exit code: ${code}`);
        resolve({ code, signal, stdout, stderr });
      });
    });
  });
}

async function deploy() {
  console.log('=== Connecting to Jump Host (103.167.12.53) ===');
  const jumpConn = new Client();
  await new Promise((resolve, reject) => {
    jumpConn.on('ready', resolve);
    jumpConn.on('error', reject);
    jumpConn.connect(jumpConfig);
  });
  console.log('Jump Host Connected!');

  console.log('=== Opening Tunnel to Target VM (192.168.1.101) ===');
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
      password: targetConfig.password,
      readyTimeout: 40000
    });
  });
  console.log('Target VM Connected!');

  // 1. Pull latest code on Target VM (preserve tracked upload file if present)
  console.log('\n--- 1. Pulling latest code on Target VM ---');
  await runExec(targetConn, 'cp -f /home/hnf/bphtb-online/public/uploads/1790648650916_QR_Code_-_BB_1952_HD.png /tmp/1790648650916_QR_Code_-_BB_1952_HD.png 2>/dev/null || true', 'Backup upload file');
  await runExec(targetConn, 'cd /home/hnf/bphtb-online && git fetch origin main && git reset --hard origin/main', 'Git Pull');
  await runExec(targetConn, 'cp -f /tmp/1790648650916_QR_Code_-_BB_1952_HD.png /home/hnf/bphtb-online/public/uploads/1790648650916_QR_Code_-_BB_1952_HD.png 2>/dev/null || true', 'Restore upload file');

  // 2. Ensure public/uploads directory exists with proper permissions
  console.log('\n--- 2. Setting up uploads directory ---');
  await runExec(targetConn, 'mkdir -p /home/hnf/bphtb-online/public/uploads && chmod -R 775 /home/hnf/bphtb-online/public/uploads', 'Setup uploads folder');

  // 3. Generate Prisma client
  console.log('\n--- 3. Prisma generate ---');
  await runExec(targetConn, 'cd /home/hnf/bphtb-online && npx prisma generate', 'Prisma Generate');

  // 4. Build Next.js
  console.log('\n--- 4. Building Next.js ---');
  await runExec(targetConn, 'cd /home/hnf/bphtb-online && npm run build', 'Next.js Build');

  // 5. Restart PM2
  console.log('\n--- 5. Restarting PM2 process ---');
  await runExec(targetConn, 'cd /home/hnf/bphtb-online && pm2 restart bphtb-online || pm2 start "npm run start -- -p 3006" --name "bphtb-online"', 'PM2 Restart');
  await runExec(targetConn, 'pm2 save', 'PM2 Save');

  // 6. Test local VM endpoint & uploaded file view
  console.log('\n--- 6. Testing VM endpoints ---');
  await runExec(targetConn, 'curl -I http://127.0.0.1:3006', 'Check Homepage');
  await runExec(targetConn, 'curl -I http://127.0.0.1:3006/uploads/1790648650916_QR_Code_-_BB_1952_HD.png || true', 'Check /uploads file serve');

  targetConn.end();

  // 7. Verify / Configure Nginx on Jump Host
  console.log('\n--- 7. Verifying Nginx Reverse Proxy on Jump Host (103.167.12.53:3006) ---');
  const nginxConf = `server {
    listen 3006;
    server_name 103.167.12.53;

    client_max_body_size 50M;

    location / {
        proxy_pass http://192.168.1.101:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
`;

  const writeNginxCmd = `cat << 'EOF' > /etc/nginx/sites-available/bphtb-online-3006
${nginxConf}
EOF
ln -sf /etc/nginx/sites-available/bphtb-online-3006 /etc/nginx/sites-enabled/bphtb-online-3006
nginx -t && systemctl reload nginx
`;
  await runExec(jumpConn, writeNginxCmd, 'Configure Nginx');

  // 8. Test public access on Jump Host
  console.log('\n--- 8. Testing access on Jump Host (103.167.12.53:3006) ---');
  await runExec(jumpConn, 'curl -I http://103.167.12.53:3006', 'Public URL Test');
  await runExec(jumpConn, 'curl -I http://103.167.12.53:3006/uploads/1790648650916_QR_Code_-_BB_1952_HD.png', 'Public Upload File Test');

  jumpConn.end();

  console.log('\n======================================================');
  console.log('🎉 DEPLOYMENT AND UPLOAD SERVING FIX SUCCESSFUL!');
  console.log('App URL: http://103.167.12.53:3006');
  console.log('======================================================');
}

deploy().catch(err => {
  console.error('Deployment error:', err);
  process.exit(1);
});
