# 📌 مرجع الأوامر السريعة - Command Reference

## نظام إبراهيم للمحاسبة

---

## 🔥 الأوامر الأكثر استخداماً

### تشغيل المشروع كامل:
```bash
# من المجلد الرئيسي
npm run dev
```

### تشغيل Backend فقط:
```bash
cd backend
npm run dev
```

### تشغيل Frontend فقط:
```bash
cd frontend
npm run dev
```

---

## 📦 التثبيت

### تثبيت كل المكتبات:
```bash
npm run install:all
```

### أو بشكل منفصل:
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

---

## 🗄️ قاعدة البيانات

### تطبيق Migrations:
```bash
npm run migrate
```

### تطبيق Seeds:
```bash
npm run seed
```

### أو يدوياً في Supabase:
1. اذهب: https://supabase.com/dashboard/project/kyxbhmvxtudrvdbhpjbz/sql
2. نفذ: `database/migrations/001_initial_schema.sql`
3. نفذ: `database/seeds/001_initial_data.sql`

---

## 🌐 الروابط المهمة

### التطبيق المحلي:
```
Frontend: http://localhost:5173
Backend:  http://localhost:5000
Health:   http://localhost:5000/health
API:      http://localhost:5000/api
```

### Supabase Dashboard:
```
Project:  https://supabase.com/dashboard/project/kyxbhmvxtudrvdbhpjbz
SQL:      https://supabase.com/dashboard/project/kyxbhmvxtudrvdbhpjbz/sql
API:      https://supabase.com/dashboard/project/kyxbhmvxtudrvdbhpjbz/settings/api
```

---

## 🛠️ التطوير

### Frontend Build:
```bash
cd frontend
npm run build
```

### Frontend Preview:
```bash
cd frontend
npm run preview
```

### Lint:
```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

### Format:
```bash
# Backend
cd backend
npm run format

# Frontend
cd frontend
npm run format
```

---

## 🔍 فحص الأخطاء

### Backend Logs:
- الملف: `backend/logs/app.log`
- الملف: `backend/logs/error.log`

### فحص Health:
```bash
curl http://localhost:5000/health
```

### اختبار API:
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'
```

---

## 🔑 متغيرات البيئة

### Backend (.env):
```env
SUPABASE_URL=https://kyxbhmvxtudrvdbhpjbz.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=... # احصل عليه من Supabase
JWT_SECRET=... # غيره لقيمة قوية
JWT_REFRESH_SECRET=... # غيره لقيمة قوية
PORT=5000
NODE_ENV=development
```

### Frontend (.env):
```env
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://kyxbhmvxtudrvdbhpjbz.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

---

## 🐛 حل المشاكل الشائعة

### Port Already in Use:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# أو غير المنفذ في .env
```

### Clear npm Cache:
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

### Clear Browser Cache:
```
Ctrl + Shift + Del (Clear Cache)
أو
Ctrl + F5 (Hard Refresh)
```

### Reset Database:
1. احذف كل الجداول من Supabase SQL Editor
2. نفذ migrations من جديد

---

## 📋 Git Commands

### Initialize Git:
```bash
git init
git add .
git commit -m "Initial commit: Ibrahim Accounting System v1.0"
```

### Create .gitignore:
```bash
# تم إنشاؤه بالفعل في .gitignore
```

### Push to GitHub:
```bash
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

---

## 🚀 النشر

### Vercel (Frontend):
```bash
cd frontend
npm run build
# Upload dist/ folder
```

### Railway/Render (Backend):
```bash
cd backend
# Set environment variables
# Deploy
```

### Environment Variables للنشر:
- كل المتغيرات من `.env`
- `NODE_ENV=production`

---

## 📞 الدعم

### الأوامر للحصول على معلومات:
```bash
# Node version
node --version

# npm version
npm --version

# Check ports
netstat -ano | findstr :5000
netstat -ano | findstr :5173
```

### معلومات الاتصال:
```
Email:    systemibrahem@gmail.com
Phone:    +963 994 054 027
WhatsApp: +963 994 054 027
```

---

## 📚 الملفات التوثيقية

- `START.md` - تشغيل فوري في 3 خطوات
- `QUICKSTART.md` - دليل سريع مفصل
- `SETUP.md` - دليل الإعداد الكامل
- `API_DOCUMENTATION.md` - توثيق API
- `PROJECT_SUMMARY.md` - ملخص المشروع
- `COMMANDS.md` - هذا الملف

---

## 🎯 اختصارات مفيدة

### PowerShell:
```bash
# Clear screen
cls

# List files
dir

# Change directory
cd path\to\directory

# Go back
cd ..

# Home directory
cd ~
```

### VS Code:
```
Ctrl + `    : Open Terminal
Ctrl + B    : Toggle Sidebar
Ctrl + P    : Quick Open File
Ctrl + Shift + P : Command Palette
F5         : Run/Debug
```

---

## ⚡ سير عمل التطوير السريع

### 1. تشغيل كل صباح:
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2  
cd frontend && npm run dev
```

### 2. عند إضافة ميزة جديدة:
```bash
# Backend: أضف route + controller
# Frontend: أضف page + API call
# Test
# Commit
git add .
git commit -m "feat: add new feature"
```

### 3. عند الانتهاء:
```bash
Ctrl + C  # في كل terminal
```

---

**آخر تحديث:** 2025-11-07
