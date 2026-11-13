#!/bin/bash
# PropertyHub EC2 Automated Production Setup Script
set -e

echo "=========================================================="
echo " Starting PropertyHub Production Deployment on EC2"
echo "=========================================================="

# 1. Update system packages
echo "--> Updating system packages..."
sudo apt update && sudo apt install -y curl git nginx fail2ban

# 2. Configure Nginx Reverse Proxy
echo "--> Configuring Nginx reverse proxy..."
sudo tee /etc/nginx/sites-available/propertyhub > /dev/null << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    client_max_body_size 50M;

    # Frontend (Next.js)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API (FastAPI)
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket Support for Chat / Notifications
    location /api/v1/ws {
        proxy_pass http://127.0.0.1:8000/api/v1/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }

    # Static Uploads directory
    location /uploads/ {
        proxy_pass http://127.0.0.1:8000/uploads/;
    }
}
EOF

# Enable Nginx config and remove default
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/propertyhub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# 3. Create .env from template if missing
if [ ! -f .env ]; then
    echo "--> Creating .env from .env.example..."
    cp .env.example .env
    RANDOM_SECRET=$(openssl rand -hex 32)
    sed -i "s/SECRET_KEY=.*/SECRET_KEY=$RANDOM_SECRET/" .env
    sed -i "s/ENVIRONMENT=.*/ENVIRONMENT=production/" .env
    sed -i "s/DEBUG=.*/DEBUG=False/" .env
fi

# 4. Start Docker services
echo "--> Building and starting Docker containers..."
docker compose down || true
docker compose up -d --build

# 5. Wait for database and backend readiness
echo "--> Waiting for services to become healthy..."
sleep 15

# Check status
docker compose ps

echo "=========================================================="
echo " PropertyHub deployment completed successfully!"
echo " Visit: http://$(curl -s http://checkip.amazonaws.com || echo '<EC2_PUBLIC_IP>')"
echo "=========================================================="
