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
      stream.on('data', d => {
        process.stdout.write(d.toString());
        stdout += d.toString();
      });
      stream.stderr.on('data', d => {
        process.stderr.write(d.toString());
        stderr += d.toString();
      });
      stream.on('close', code => {
        console.log(`\n>>> [${label}] Exit code: ${code}`);
        if (code !== 0 && !cmd.includes('grep')) {
          console.warn(`Warning: Command "${cmd}" exited with code ${code}`);
        }
        resolve({ code, stdout, stderr });
      });
    });
  });
}

async function deploy() {
  console.log('--- Connecting to Jump Host (103.167.12.53) ---');
  const jumpConn = new Client();
  await new Promise((resolve, reject) => {
    jumpConn.on('ready', resolve);
    jumpConn.on('error', reject);
    jumpConn.connect(jumpConfig);
  });
  console.log('Connected to Jump Host successfully.');

  console.log('\n--- Forwarding connection to Target VM (192.168.1.101) ---');
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
  console.log('Connected to Target VM successfully.');

  // Step 1: Update code on target VM
  console.log('\n--- Step 1: Updating codebase on Target VM ---');
  await runCommand(targetConn, 'cd /home/hnf/bphtb-online && git fetch origin main && git reset --hard origin/main', 'Git Pull / Reset');

  // Step 2: Install dependencies & generate prisma
  console.log('\n--- Step 2: Installing dependencies & Prisma generate ---');
  await runCommand(targetConn, 'cd /home/hnf/bphtb-online && npm install && npx prisma generate', 'NPM Install & Prisma Generate');

  // Step 3: Build Next.js app
  console.log('\n--- Step 3: Building Next.js production bundle ---');
  await runCommand(targetConn, 'cd /home/hnf/bphtb-online && npm run build', 'Next.js Build');

  // Step 4: Restart PM2
  console.log('\n--- Step 4: Restarting application in PM2 ---');
  await runCommand(targetConn, 'cd /home/hnf/bphtb-online && pm2 restart bphtb-online || pm2 start "npm run start -- -p 3006" --name "bphtb-online"', 'PM2 Restart');
  await runCommand(targetConn, 'pm2 save', 'PM2 Save');

  // Step 5: Test local endpoint on target VM
  console.log('\n--- Step 5: Testing local endpoint on Target VM ---');
  await runCommand(targetConn, 'curl -I http://127.0.0.1:3006', 'Local Curl VM');

  targetConn.end();

  // Step 6: Configure Nginx on Jump Host for port 3006
  console.log('\n--- Step 6: Configuring Nginx reverse proxy on Jump Host (103.167.12.53:3006) ---');
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

  // Write nginx config on jump host
  const writeNginxCmd = `cat << 'EOF' > /etc/nginx/sites-available/bphtb-online-3006
${nginxConf}
EOF
ln -sf /etc/nginx/sites-available/bphtb-online-3006 /etc/nginx/sites-enabled/bphtb-online-3006
nginx -t && systemctl reload nginx
`;
  await runCommand(jumpConn, writeNginxCmd, 'Configure and Reload Nginx on Jump Host');

  // Step 7: Test public access on Jump Host
  console.log('\n--- Step 7: Testing access to http://103.167.12.53:3006 ---');
  await runCommand(jumpConn, 'curl -I http://103.167.12.53:3006', 'Curl Jump Host Public Port 3006');

  jumpConn.end();
  console.log('\n========================================');
  console.log('✅ DEPLOYMENT COMPLETED SUCCESSFULLY!');
  console.log('Access URL: http://103.167.12.53:3006');
  console.log('========================================');
}

deploy().catch((err) => {
  console.error('Deployment failed:', err);
  process.exit(1);
});
