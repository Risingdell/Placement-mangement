# 🏫 Placement Management System - College Server Deployment Checklist

**Project Name**: Placement Management System
**Current Deployment**: Vercel (Frontend) + Render (Backend) + TiDB (Database) + Cloudinary (File Storage)
**Target Deployment**: College Server (Self-Hosted)
**Date**: March 2026

---

## 📋 EXECUTIVE SUMMARY

This document outlines all requirements, server access, and deployment steps needed to migrate the Placement Management System from cloud services (Vercel, Render, TiDB) to the college's own server infrastructure.

**Total Deployment Time**: 1-2 hours (after receiving server access)

---

## 🔴 CRITICAL INFORMATION TO REQUEST FROM COLLEGE IT TEAM

Send this checklist to your college IT department and ask them to provide the following details:

### 1️⃣ **Server Access & Authentication**
```
Required Information:
☐ SSH Access (Username)
☐ SSH Access (Password or SSH Key)
☐ Server IP Address
☐ Server Hostname (if applicable)
☐ Root or sudo access permission

Example:
- SSH Command: ssh admin@192.168.1.50
- Port: 22 (standard) or custom port
```

### 2️⃣ **Server Operating System**
```
Required Information:
☐ Operating System: Ubuntu / Debian / CentOS / RedHat
☐ OS Version: (Example: Ubuntu 20.04 LTS)
☐ Architecture: 32-bit or 64-bit

Note: Ubuntu 20.04 LTS or Debian 11 is recommended
```

### 3️⃣ **Node.js Runtime**
```
Required Information:
☐ Is Node.js pre-installed? (YES / NO)
☐ If YES, which version? (Run: node -v)
☐ If NO, can we install Node.js 18 or 20?
☐ Can we install npm packages globally? (npm install -g)
☐ Can we use PM2 for process management?

Minimum Requirements:
- Node.js v18 or v20 LTS
- npm v8+
```

### 4️⃣ **Database Server**
```
Required Information:
☐ Database System Available: MySQL / MariaDB / PostgreSQL
☐ Database Host: (IP or hostname)
☐ MySQL Server Version: (Example: MySQL 5.7 or 8.0)
☐ Root User Password: (for initial setup)

☐ New Database to Create: placement_portal
☐ New Database User: placement_admin
☐ Database Port: (Usually 3306)
```

### 5️⃣ **Web Server**
```
Required Information:
☐ Web Server Installed: Nginx / Apache / IIS
☐ Web Server Version:
☐ Can we configure reverse proxy?
☐ Is port 80 (HTTP) open?
☐ Is port 443 (HTTPS) open?

Recommended: Nginx (lighter weight for placement system)
```

### 6️⃣ **Domain & HTTPS**
```
Required Information:
☐ Domain/Subdomain to use: Example: placement.college.edu
☐ Will you provide SSL certificate? (YES / NO)
☐ If NO, can we use Let's Encrypt (free)?
☐ Is DNS configuration available?

Example URLs after deployment:
- Frontend: https://placement.college.edu
- Backend API: https://placement.college.edu/api
```

### 7️⃣ **Storage & File Upload**
```
Current Setup: Cloudinary (External)
☐ Can we keep using Cloudinary for image/resume uploads?
☐ Are outbound internet connections allowed?
☐ Is firewall configured to allow API calls to cloudinary.com?

If NOT allowed, we can move to:
☐ Local file storage on server
☐ College's file server
```

### 8️⃣ **System Resources**
```
Required Information:
☐ Minimum RAM Available: (Recommend: 2GB minimum)
☐ Available Storage Space: (Recommend: 20GB minimum)
☐ CPU Cores: (Recommend: 2+ cores)
☐ Internet Bandwidth: (Recommend: No limit for college network)
```

### 9️⃣ **Firewall & Port Access**
```
Required Information:
☐ Custom ports allowed? (5000, 5001, etc.)
☐ Or should we run behind Nginx on ports 80/443?
☐ Outbound internet access allowed? (For Cloudinary API)
☐ External API calls allowed? (For email, Cloudinary)

Ports Required:
- Port 22: SSH access
- Port 80: HTTP
- Port 443: HTTPS
- Port 3306: MySQL (internal only)
- Port 5000: Node.js (internal only, behind Nginx)
```

### 🔟 **Deployment Method**
```
Required Information:
☐ Preferred deployment method:
   ☐ Git clone from GitHub
   ☐ FTP upload
   ☐ SCP upload
   ☐ Direct file copy
☐ GitHub repository access allowed?
☐ Public internet access to GitHub allowed?

Recommended: Git clone (easiest for updates)
```

### 1️⃣1️⃣ **Email Service** (If using college email)
```
Required Information:
☐ SMTP Server Address:
☐ SMTP Port: (Usually 587 or 465)
☐ SMTP Username:
☐ SMTP Password:
☐ Can external email APIs be used? (Gmail, SendGrid)

Note: Currently using Resend API (cloud-based)
```

### 1️⃣2️⃣ **Backup & Maintenance**
```
Required Information:
☐ Database backup frequency?
☐ Who manages server backups?
☐ Can we access backup files?
☐ Server maintenance schedule?
☐ Monitoring/Uptime monitoring system available?
```

---

## 📊 CURRENT PROJECT ARCHITECTURE

```
BEFORE (Cloud-Based)
═══════════════════════
Frontend:    https://placement-mangement.vercel.app
                          ↓
Backend:     https://placement-mangement-system-w83k.onrender.com
                          ↓
Database:    TiDB (Cloud MySQL)
                          ↓
Storage:     Cloudinary API (Image/Resume uploads)


AFTER (College Server)
═══════════════════════
Browser
   ↓ (HTTPS)
Nginx Reverse Proxy
   ├─ Static files (React Frontend)
   │
   ├─ /api requests → Node.js Backend (Port 5000)
   │      ↓
   │   Express Server
   │      ↓
   │   MySQL Database (localhost:3306)
   │
   └─ File Uploads → Cloudinary API
```

---

## 📦 PROJECT TECHNOLOGY STACK

| Component | Technology | Version |
|-----------|-----------|---------|
| **Frontend** | React + Vite | 19 + latest |
| **Frontend Styling** | Tailwind CSS | 3+ |
| **Frontend Routing** | React Router DOM | 7 |
| **Backend Runtime** | Node.js | 18 or 20 LTS |
| **Backend Framework** | Express | 4.18+ |
| **Database** | MySQL | 5.7 or 8.0 |
| **Database Connector** | mysql2 (promisePool) | latest |
| **Authentication** | JWT (JSON Web Token) | HS256 |
| **File Storage** | Cloudinary | (external API) |
| **Process Manager** | PM2 | latest |
| **Web Server** | Nginx | latest |

---

## 🔧 DEPLOYMENT STEP-BY-STEP PROCESS

Once you receive the above information, follow these steps:

### **Phase 1: Server Preparation** (20 minutes)

```bash
# Step 1: Connect to server
ssh admin@college-server-ip

# Step 2: Update system
sudo apt update && sudo apt upgrade -y

# Step 3: Install Node.js (if not installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Step 4: Verify installation
node -v  # Should show v20.x.x
npm -v   # Should show 9.x.x or higher

# Step 5: Install PM2 globally
sudo npm install -g pm2

# Step 6: Install Nginx (if not installed)
sudo apt install -y nginx

# Step 7: Verify Nginx installation
sudo systemctl status nginx
```

### **Phase 2: Database Migration** (15 minutes)

```bash
# Step 1: Export database from TiDB (run on local machine)
mysqldump -u tidb_user -p -h tidb-host placement_db > placement_backup.sql

# Step 2: Transfer SQL file to college server
scp placement_backup.sql admin@college-server-ip:/home/admin/

# Step 3: Connect to server and create database
ssh admin@college-server-ip

# Step 4: Create new database user (on college MySQL)
mysql -u root -p
CREATE DATABASE placement_portal;
CREATE USER 'placement_admin'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON placement_portal.* TO 'placement_admin'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Step 5: Import database backup
mysql -u placement_admin -p placement_portal < /home/admin/placement_backup.sql

# Step 6: Verify data
mysql -u placement_admin -p placement_portal
SELECT COUNT(*) FROM users;
EXIT;
```

### **Phase 3: Backend Deployment** (15 minutes)

```bash
# Step 1: Navigate to deployment directory
cd /var/www/

# Step 2: Clone project from GitHub
sudo git clone https://github.com/Risingdell/Placement-mangement.git
cd Placement-mangement/backend

# Step 3: Install dependencies
npm install

# Step 4: Create .env file with college server details
sudo nano .env
```

**Content for .env file:**
```
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_USER=placement_admin
DB_PASSWORD=secure_password_here
DB_NAME=placement_portal
DB_PORT=3306

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

FRONTEND_URL=https://placement.college.edu
```

```bash
# Step 5: Start backend with PM2
pm2 start server.js --name "placement-backend"
pm2 save
pm2 startup

# Step 6: Verify it's running
pm2 status
```

### **Phase 4: Frontend Build & Deployment** (10 minutes)

```bash
# Step 1: Build React frontend (on local machine)
cd /path/to/frontend
npm run build

# This creates /build folder

# Step 2: Copy build to server
scp -r build/* admin@college-server-ip:/var/www/frontend/

# OR on server, clone and build
ssh admin@college-server-ip
cd /var/www/Placement-mangement
npm run build
```

### **Phase 5: Nginx Configuration** (10 minutes)

```bash
# Step 1: Create Nginx config
sudo nano /etc/nginx/sites-available/placement

# Step 2: Add this configuration:
```

**Nginx Configuration File:**
```nginx
upstream backend {
    server 127.0.0.1:5000;
}

server {
    listen 80;
    listen [::]:80;
    server_name placement.college.edu;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name placement.college.edu;

    # SSL Certificate (update paths)
    ssl_certificate /etc/letsencrypt/live/placement.college.edu/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/placement.college.edu/privkey.pem;

    client_max_body_size 50M;

    # Frontend - React build
    location / {
        root /var/www/frontend/build;
        try_files $uri /index.html;
        index index.html;
    }

    # API - Proxy to Node.js backend
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Step 3: Enable Nginx config
sudo ln -s /etc/nginx/sites-available/placement /etc/nginx/sites-enabled/

# Step 4: Test Nginx
sudo nginx -t

# Step 5: Reload Nginx
sudo systemctl reload nginx

# Step 6: Verify Nginx
sudo systemctl status nginx
```

### **Phase 6: SSL Certificate Setup** (5 minutes)

```bash
# Step 1: Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Step 2: Get SSL certificate
sudo certbot certonly --nginx -d placement.college.edu

# Step 3: Auto-renew setup
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Step 4: Test auto-renewal
sudo certbot renew --dry-run
```

### **Phase 7: Verification & Testing** (10 minutes)

```bash
# Step 1: Check PM2 status
pm2 status

# Step 2: Check Nginx status
sudo systemctl status nginx

# Step 3: Check database connectivity
mysql -u placement_admin -p placement_portal -e "SELECT VERSION();"

# Step 4: Test API endpoint
curl -H "Content-Type: application/json" \
  https://placement.college.edu/api/auth/me

# Step 5: Check application logs
pm2 logs placement-backend

# Step 6: Open browser and test
# Frontend: https://placement.college.edu
# Should load the login page
```

---

## 🛡️ SECURITY CHECKLIST

Before going live, ensure:

```
☐ Change default MySQL password
☐ Enable MySQL remote access: NO (localhost only)
☐ Node.js runs as non-root user
☐ .env file has restrictive permissions (600)
☐ SSH key-based authentication enabled (not password)
☐ Firewall configured to allow only necessary ports
☐ HTTPS/SSL enabled
☐ Database backups configured
☐ PM2 logs monitored
☐ Regular updates scheduled
```

---

## 📱 POST-DEPLOYMENT VERIFICATION

After deployment, verify these work:

| Feature | How to Test | Expected Result |
|---------|-----------|-----------------|
| **Frontend Load** | Visit https://placement.college.edu | Login page displays |
| **Student Login** | Email: student@college.edu | Redirects to dashboard |
| **Admin Login** | Email: admin@college.edu | Admin dashboard loads |
| **API Connection** | Check browser DevTools → Network | API calls go to /api/... |
| **Database** | Create new account | User saved in MySQL |
| **File Upload** | Upload resume | File saved to Cloudinary |
| **Email** | Forgot password | Email received |

---

## 🚨 TROUBLESHOOTING GUIDE

| Issue | Solution |
|-------|----------|
| **Node.js app not starting** | Check: `pm2 logs placement-backend` |
| **Nginx error 502** | Backend not running: `pm2 status` |
| **Database connection refused** | Check `.env` credentials and MySQL running |
| **CORS errors** | Verify Nginx proxy headers are set correctly |
| **File upload fails** | Check Cloudinary credentials in `.env` |
| **HTTPS not working** | Verify SSL certificate paths in Nginx config |
| **Port already in use** | Change PORT in `.env` and restart PM2 |

---

## 📞 CONTACT & SUPPORT

**For deployment help:**
- Backend code: `/backend` folder
- Frontend code: `/src` folder
- Configuration: `.env` file
- Logs: `pm2 logs placement-backend`

---

## ✅ FINAL CHECKLIST

Before going live:

```
Pre-Deployment
☐ Database exported and tested
☐ .env file configured correctly
☐ Node.js and npm installed
☐ PM2 installed
☐ Nginx installed and configured
☐ SSL certificate obtained
☐ Cloudinary credentials verified

Post-Deployment
☐ Frontend loads without errors
☐ Login works (student and admin)
☐ API calls succeed
☐ Database queries work
☐ File uploads work
☐ Emails send successfully
☐ PM2 auto-starts on server reboot
☐ Nginx auto-starts on server reboot
☐ Monitoring/logging configured

Maintenance
☐ Database backups scheduled
☐ SSL auto-renewal configured
☐ PM2 logs monitored
☐ Server updates scheduled
☐ Security patches applied
```

---

## 📊 ENVIRONMENT VARIABLES REFERENCE

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_USER=placement_admin
DB_PASSWORD=college_secure_password
DB_NAME=placement_portal
DB_PORT=3306

# Authentication
JWT_SECRET=your_secret_key_here_change_this
JWT_EXPIRE=7d
SESSION_SECRET=your_session_secret_here

# Cloudinary (File Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URL (for CORS)
FRONTEND_URL=https://placement.college.edu

# Email Service
EMAIL_SERVICE=resend
RESEND_API_KEY=your_resend_key

# Optional: Admin Setup
ADMIN_EMAIL=admin@college.edu
ADMIN_PASSWORD=initial_secure_password
```

---

**Document Version**: 1.0
**Last Updated**: March 2026
**Prepared By**: Placement System Development Team

---

## 🎓 KEY POINTS TO COMMUNICATE

> **"We need your IT team's support to migrate from cloud services to your server. The deployment is straightforward once we have the required access and information above. Most deployment takes 1-2 hours."**

---

*This document should be sent to the College IT Department to ensure smooth deployment.*
