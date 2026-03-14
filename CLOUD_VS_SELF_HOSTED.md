# ☁️ Cloud vs 🖥️ Self-Hosted: Comparison Guide

## Current Architecture (Cloud-Based)

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR USERS                               │
│                  (Students/Admin)                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Browser Request (HTTPS)
                         │
        ┌────────────────┴────────────────┐
        │                                  │
    ┌───▼──────┐                    ┌─────▼───────┐
    │  VERCEL  │                    │  RENDER     │
    │(Frontend)│                    │ (Backend)   │
    │ React    │                    │ Node.js     │
    │ Build    │                    │ Express     │
    └────┬─────┘                    └──────┬──────┘
         │                                 │
         │ Static HTML                     │ API Calls
         │                                 │
    ┌────▼───────────────────────────────▼──────┐
    │                                            │
    │    ┌─────────────────────────────────┐   │
    │    │      TiDB CLOUD                 │   │
    │    │  (MySQL Database)               │   │
    │    │  - Users                        │   │
    │    │  - Drives                       │   │
    │    │  - Applications                 │   │
    │    └─────────────────────────────────┘   │
    │                                            │
    │    ┌─────────────────────────────────┐   │
    │    │      CLOUDINARY API             │   │
    │    │  (File/Image Storage)           │   │
    │    │  - Resume uploads               │   │
    │    │  - Student photos               │   │
    │    └─────────────────────────────────┘   │
    │                                            │
    └────────────────────────────────────────────┘

✅ ADVANTAGES:
- Auto-scaling
- Always available (99.9% uptime)
- Automatic backups
- Easy deployment (git push)
- Global CDN for frontend

❌ DISADVANTAGES:
- Higher cost (monthly)
- Dependent on external services
- No data control
- Internet required
```

---

## New Architecture (Self-Hosted on College Server)

```
┌──────────────────────────────────────────────────────────────┐
│                    YOUR USERS                                │
│                  (College Campus)                            │
└─────────────────────────┬──────────────────────────────────┘
                          │
                          │ HTTPS Request
                          │ (Port 443)
        ┌─────────────────┴─────────────────┐
        │                                    │
    ┌───▼────────────────────────────────────▼──┐
    │                                           │
    │     COLLEGE SERVER (Single Machine)      │
    │                                           │
    │  ┌────────────────────────────────────┐ │
    │  │    NGINX WEB SERVER                │ │
    │  │  (Reverse Proxy)                   │ │
    │  │  - Serves React Frontend           │ │
    │  │  - Routes /api to Backend          │ │
    │  │  - SSL/HTTPS handling              │ │
    │  │  - Port 80 (HTTP)                  │ │
    │  │  - Port 443 (HTTPS)                │ │
    │  └──────────┬──────────────┬──────────┘ │
    │             │              │            │
    │             │              │            │
    │  ┌──────────▼──┐   ┌──────▼────────┐  │
    │  │  FRONTEND   │   │   BACKEND     │  │
    │  │  BUILD      │   │   NODE.JS     │  │
    │  │  (React)    │   │   Express     │  │
    │  │  Static     │   │   PM2 Manager │  │
    │  │  HTML/JS    │   │   Port 5000   │  │
    │  └─────────────┘   └──────┬────────┘  │
    │                           │            │
    │         ┌─────────────────┴──────────┐ │
    │         │                            │ │
    │    ┌────▼──────────────────────────┐ │ │
    │    │   MYSQL DATABASE              │ │ │
    │    │   (Local)                     │ │ │
    │    │   - Users                     │ │ │
    │    │   - Drives                    │ │ │
    │    │   - Applications              │ │ │
    │    │   - Port 3306 (internal)      │ │ │
    │    └───────────────────────────────┘ │ │
    │                                       │ │
    │    ┌──────────────────────────────┐  │ │
    │    │   CLOUDINARY API             │  │ │
    │    │   (External - Optional)      │  │ │
    │    │   - File uploads             │  │ │
    │    │   - Resume storage           │  │ │
    │    └──────────────────────────────┘  │ │
    │                                       │ │
    └───────────────────────────────────────┘ │
    │                                           │
    └───────────────────────────────────────────┘

✅ ADVANTAGES:
- Complete control over data
- No external dependency costs
- Fast network (college LAN)
- Full customization
- Data privacy (on college network)

❌ DISADVANTAGES:
- Manual scaling required
- Maintenance responsibility
- Requires server knowledge
- Manual backups needed
- Uptime depends on server availability
```

---

## Side-by-Side Comparison

| Aspect | ☁️ Cloud (Current) | 🖥️ Self-Hosted (New) |
|--------|------------------|---------------------|
| **Frontend Hosting** | Vercel | Nginx on College Server |
| **Backend Hosting** | Render | Node.js on College Server |
| **Database** | TiDB (Cloud) | MySQL (Local) |
| **File Storage** | Cloudinary | Cloudinary (can switch) |
| **Cost** | Monthly subscription | Server cost only |
| **Maintenance** | Provider's responsibility | Your responsibility |
| **Deployment Time** | Minutes (git push) | 1-2 hours (SSH + setup) |
| **Scaling** | Automatic | Manual |
| **Backups** | Automatic | Manual setup |
| **Internet Dependency** | High | Lower (works on LAN) |
| **Data Control** | Limited | Full |
| **SSL/HTTPS** | Automatic (Vercel) | Let's Encrypt (free) |
| **Monitoring** | Limited | Full access to logs |

---

## What Needs to Change

### 1. **Frontend Deployment** 📱

**BEFORE (Vercel):**
```
Your Machine
    ↓
git push origin main
    ↓
Vercel automatically builds and deploys
    ↓
Available at: https://placement-mangement.vercel.app
```

**AFTER (Self-Hosted):**
```
Your Machine
    ↓
npm run build
    ↓
Manually upload /build folder to server
    ↓
Nginx serves static files
    ↓
Available at: https://placement.college.edu
```

---

### 2. **Backend Deployment** 🔧

**BEFORE (Render):**
```
GitHub Repository
    ↓
git push
    ↓
Render auto-builds and deploys
    ↓
Running at: https://placement-mangement-system-w83k.onrender.com
```

**AFTER (Self-Hosted):**
```
GitHub Repository
    ↓
git clone on server
    ↓
npm install
    ↓
Create .env file
    ↓
pm2 start server.js
    ↓
Running at: http://localhost:5000 (proxied by Nginx)
```

---

### 3. **Database Setup** 📊

**BEFORE (TiDB):**
```
TiDB Cloud Console
    ↓
Database automatically provisioned
    ↓
Connection: tidb-cloud-host:4000
```

**AFTER (Self-Hosted):**
```
College Server (MySQL)
    ↓
mysql -u root
CREATE DATABASE placement_portal;
CREATE USER 'placement_admin';
    ↓
Connection: localhost:3306
```

---

### 4. **File Upload Storage** 📸

**OPTION A: Keep Cloudinary (Recommended)**
```
No change - works the same
Upload requests still go to Cloudinary API
```

**OPTION B: Switch to Local Storage**
```
Backend receives file
    ↓
Saves to: /var/www/uploads/
    ↓
Served by Nginx
```

---

## 🎯 What You Need to DO

### Immediate Actions:

1. **✅ Create a comprehensive checklist** (DONE - see COLLEGE_SERVER_DEPLOYMENT_CHECKLIST.md)

2. **✅ Send email to College IT** with requirements (DONE - see EMAIL_TO_COLLEGE_IT.txt)

3. **⏳ Wait for college IT to provide server details**

4. **📝 Document their responses** in a table:

   | Requirement | Response |
   |------------|----------|
   | Server IP | 192.168.1.50 |
   | OS | Ubuntu 20.04 |
   | SSH Username | admin |
   | DB Type | MySQL 8.0 |
   | Domain | placement.college.edu |
   | Nginx | Installed? YES |
   | etc... | ... |

5. **🚀 Follow deployment steps** once you have access

---

## 🔄 Deployment Workflow Comparison

### Current Workflow (Cloud)
```
Code Change
    ↓
git push origin main
    ↓
Vercel: Auto-builds frontend
    ↓
Render: Auto-builds backend
    ↓
Live in 2-3 minutes
```

### New Workflow (Self-Hosted)
```
Code Change
    ↓
git push origin main
    ↓
ssh to server
    ↓
git pull
    ↓
npm run build (frontend)
npm install (backend)
    ↓
pm2 restart placement-backend
    ↓
Live in 5-10 minutes
```

---

## ⚠️ Important Considerations

### What Stays the Same ✅
- React frontend code (no changes)
- Node.js backend code (minimal changes)
- Database schema (just migration)
- Cloudinary integration (works same)
- Authentication logic (JWT stays)

### What Changes 🔄
- **Where** code runs (cloud → server)
- **How** deployment happens (auto → manual)
- **Database** location (TiDB → MySQL)
- **Frontend URL** (vercel → college domain)
- **Backend URL** (render → college domain)
- **Environment variables** (.env location)

### What's New ⭐
- PM2 process manager
- Nginx reverse proxy
- SSL certificate management
- Server maintenance responsibility
- Database backup responsibility

---

## 📞 Support & Handover

### After Deployment, You'll Have:

```
Admin Panel:
- SSH into server
- Monitor with: pm2 logs
- Restart: pm2 restart all
- View Nginx logs: tail /var/log/nginx/error.log

College IT Will Need To:
- Regular backups
- Server monitoring
- Security patches
- Port access management
```

---

## 🎓 Key Takeaway

The **code itself doesn't change much**, but **where and how it runs** changes completely.

Think of it like moving a restaurant:
- Same menu (code)
- Same chefs (developers)
- New location (college server)
- Different suppliers (local MySQL instead of TiDB)

---

**Ready to move forward? Let the college IT team know what you need!** 🚀
