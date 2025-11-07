# دليل الإعداد والتشغيل - Setup & Installation Guide

## نظام إبراهيم للمحاسبة | Ibrahim Accounting System

### المتطلبات الأساسية | Prerequisites

- Node.js 18+ 
- npm أو yarn
- حساب Supabase (مجاني)

### خطوات الإعداد | Setup Steps

#### 1. إعداد قاعدة البيانات | Database Setup

1. سجل دخول إلى Supabase: https://supabase.com
2. المشروع موجود بالفعل: `kyxbhmvxtudrvdbhpjbz`
3. نفذ migration scripts من مجلد `database/migrations`:
   ```sql
   -- في SQL Editor في Supabase، قم بتنفيذ:
   -- 1. افتح ملف database/migrations/001_initial_schema.sql
   -- 2. انسخ والصق المحتوى في SQL Editor
   -- 3. اضغط Run
   ```

4. نفذ seed data من `database/seeds/001_initial_data.sql`

#### 2. إعداد Backend | Backend Setup

```bash
# انتقل لمجلد backend
cd backend

# ثبت المكتبات
npm install

# أنشئ ملف .env (تم إنشاؤه بالفعل)
# تأكد من تحديث SUPABASE_SERVICE_ROLE_KEY من لوحة Supabase

# شغل الخادم
npm run dev
```

الخادم سيعمل على: http://localhost:5000

#### 3. إعداد Frontend | Frontend Setup

```bash
# في terminal جديد، انتقل لمجلد frontend
cd frontend

# ثبت المكتبات
npm install

# شغل التطبيق
npm run dev
```

التطبيق سيعمل على: http://localhost:5173

### الحصول على Service Role Key من Supabase

1. اذهب إلى: https://supabase.com/dashboard/project/kyxbhmvxtudrvdbhpjbz
2. اضغط على Settings → API
3. انسخ `service_role` key (secret)
4. ضعه في `backend/.env` → `SUPABASE_SERVICE_ROLE_KEY`

### تشغيل المشروع | Running the Project

بعد إعداد كل شيء:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

افتح المتصفح: http://localhost:5173

### الحساب الافتراضي | Default Account

للتسجيل:
- قم بالتسجيل من صفحة Register
- سيتم إنشاء متجرك تلقائياً
- ستحصل على تجربة مجانية 30 يوم

### المميزات الرئيسية | Key Features

✅ نظام متعدد المتاجر مع عزل كامل للبيانات
✅ دعم 3 عملات (TRY, SYP, USD)
✅ إدارة الواردات والصادرات
✅ إدارة المستودع
✅ إدارة الموظفين والرواتب
✅ نظام صلاحيات متقدم
✅ دعم 3 لغات (عربي، إنجليزي، تركي)
✅ الوضع الليلي
✅ نظام اشتراكات

### خطط الاشتراك | Subscription Plans

- تجربة مجانية: 30 يوم
- شهري: 5$
- 6 أشهر: 30$
- سنوي: 40$

للتجديد: واتساب +963 994 054 027

### البنية التقنية | Tech Stack

**Backend:**
- Node.js + Express
- Supabase (PostgreSQL)
- JWT Authentication
- RESTful API

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- Redux Toolkit
- React Query

**Database:**
- PostgreSQL (Supabase)
- Row Level Security
- Migrations & Seeds

### المشاكل الشائعة | Common Issues

**1. خطأ في الاتصال بقاعدة البيانات:**
- تأكد من SUPABASE_SERVICE_ROLE_KEY صحيح
- تأكد من تنفيذ migration scripts

**2. خطأ CORS:**
- تأكد من تشغيل Backend على port 5000
- تأكد من FRONTEND_URL في .env صحيح

**3. مشاكل المصادقة:**
- تأكد من JWT_SECRET و JWT_REFRESH_SECRET تم تعيينهم
- امسح localStorage وأعد تسجيل الدخول

### التطوير | Development

لإضافة ميزة جديدة:

1. **Backend:**
   - أضف route في `backend/src/routes/`
   - أضف controller في `backend/src/controllers/`
   - أضف validation

2. **Frontend:**
   - أضف صفحة في `frontend/src/pages/`
   - أضف route في `App.jsx`
   - أضف API call في services

### النشر | Deployment

**Backend:**
- Vercel, Railway, أو Render
- تأكد من متغيرات البيئة

**Frontend:**
- Vercel أو Netlify
- Build: `npm run build`

**Database:**
- Supabase (مستضافة بالفعل)

### الدعم | Support

📧 Email: systemibrahem@gmail.com
📱 Phone: +963 994 054 027
💬 WhatsApp: +963 994 054 027

---

## ملاحظات مهمة | Important Notes

### الأمان | Security

- ✅ تشفير كلمات المرور
- ✅ JWT + Refresh Tokens
- ✅ Rate Limiting
- ✅ CORS Protection
- ✅ Input Validation
- ✅ Row Level Security (RLS)

### الميزات القادمة | Upcoming Features

- [ ] تطبيق Android (React Native/Flutter)
- [ ] التقارير المتقدمة مع PDF/Excel
- [ ] إشعارات Push
- [ ] Offline Mode
- [ ] Multi-currency Exchange Rates
- [ ] Advanced Analytics
- [ ] Backup & Restore
- [ ] API Documentation (Swagger)

### المساهمة | Contributing

هذا مشروع خاص. للمساهمة أو الاستفسارات، تواصل معنا.

---

## License

جميع الحقوق محفوظة © 2025 نظام إبراهيم للمحاسبة
All Rights Reserved © 2025 Ibrahim Accounting System
