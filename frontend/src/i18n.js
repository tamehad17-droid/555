import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  ar: {
    translation: {
      // Common
      appName: 'نظام إبراهيم للمحاسبة',
      welcome: 'مرحباً',
      loading: 'جاري التحميل...',
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      add: 'إضافة',
      search: 'بحث',
      filter: 'تصفية',
      export: 'تصدير',
      print: 'طباعة',
      actions: 'الإجراءات',
      noData: 'لا توجد بيانات',
      
      // Auth
      login: 'تسجيل الدخول',
      logout: 'تسجيل الخروج',
      register: 'تسجيل',
      username: 'اسم المستخدم',
      password: 'كلمة المرور',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      
      // Dashboard
      dashboard: 'لوحة التحكم',
      statistics: 'الإحصائيات',
      
      // Navigation
      invoicesIn: 'الواردات',
      invoicesOut: 'الصادرات',
      inventory: 'المستودع',
      employees: 'الموظفون',
      payroll: 'الرواتب',
      partners: 'العملاء والموردين',
      reports: 'التقارير',
      settings: 'الإعدادات',
      
      // Currencies
      TRY: 'ليرة تركية',
      SYP: 'ليرة سورية',
      USD: 'دولار أمريكي',
      
      // Subscription
      subscription: 'الاشتراك',
      upgrade: 'ترقية',
      renewSubscription: 'تجديد الاشتراك',
      contactUs: 'اتصل بنا',
      whatsapp: 'واتساب',
    },
  },
  en: {
    translation: {
      // Common
      appName: 'Ibrahim Accounting System',
      welcome: 'Welcome',
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      print: 'Print',
      actions: 'Actions',
      noData: 'No data available',
      
      // Auth
      login: 'Login',
      logout: 'Logout',
      register: 'Register',
      username: 'Username',
      password: 'Password',
      email: 'Email',
      phone: 'Phone',
      
      // Dashboard
      dashboard: 'Dashboard',
      statistics: 'Statistics',
      
      // Navigation
      invoicesIn: 'Income',
      invoicesOut: 'Expenses',
      inventory: 'Inventory',
      employees: 'Employees',
      payroll: 'Payroll',
      partners: 'Customers & Vendors',
      reports: 'Reports',
      settings: 'Settings',
      
      // Currencies
      TRY: 'Turkish Lira',
      SYP: 'Syrian Pound',
      USD: 'US Dollar',
      
      // Subscription
      subscription: 'Subscription',
      upgrade: 'Upgrade',
      renewSubscription: 'Renew Subscription',
      contactUs: 'Contact Us',
      whatsapp: 'WhatsApp',
    },
  },
  tr: {
    translation: {
      // Common
      appName: 'İbrahim Muhasebe Sistemi',
      welcome: 'Hoş geldiniz',
      loading: 'Yükleniyor...',
      save: 'Kaydet',
      cancel: 'İptal',
      delete: 'Sil',
      edit: 'Düzenle',
      add: 'Ekle',
      search: 'Ara',
      filter: 'Filtrele',
      export: 'Dışa Aktar',
      print: 'Yazdır',
      actions: 'İşlemler',
      noData: 'Veri yok',
      
      // Auth
      login: 'Giriş',
      logout: 'Çıkış',
      register: 'Kayıt Ol',
      username: 'Kullanıcı Adı',
      password: 'Şifre',
      email: 'E-posta',
      phone: 'Telefon',
      
      // Dashboard
      dashboard: 'Gösterge Paneli',
      statistics: 'İstatistikler',
      
      // Navigation
      invoicesIn: 'Gelir',
      invoicesOut: 'Gider',
      inventory: 'Envanter',
      employees: 'Çalışanlar',
      payroll: 'Maaş',
      partners: 'Müşteriler ve Tedarikçiler',
      reports: 'Raporlar',
      settings: 'Ayarlar',
      
      // Currencies
      TRY: 'Türk Lirası',
      SYP: 'Suriye Lirası',
      USD: 'ABD Doları',
      
      // Subscription
      subscription: 'Abonelik',
      upgrade: 'Yükselt',
      renewSubscription: 'Aboneliği Yenile',
      contactUs: 'Bize Ulaşın',
      whatsapp: 'WhatsApp',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ar', // Default language
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
