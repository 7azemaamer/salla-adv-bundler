import {
  IconSparkles,
  IconHome,
  IconPackage,
  IconChartBar,
  IconSettings,
  IconChartPie,
  IconTrendingUp,
  IconPlus,
  IconChartLine,
  IconGift,
  IconCheck,
  IconConfetti,
  IconFileText,
  IconTarget,
  IconPalette,
  IconLock,
  IconSearch,
  IconFilter,
  IconCircleCheck,
  IconDots,
} from "@tabler/icons-react";

export const dashboardTourSteps = [
  {
    target: "body",
    content: (
      <div dir="rtl" className="text-right">
        <div className="flex items-center gap-2 mb-2">
          <IconSparkles size={28} className="text-blue-500" />
          <h3 className="text-xl font-bold">مرحباً بك في نظام الباقات!</h3>
        </div>
        <p className="text-gray-600">
          دعنا نأخذك في جولة سريعة لتتعرف على كيفية إنشاء وإدارة باقاتك المخصصة
          مع هدايا مجانية لزيادة مبيعاتك.
        </p>
      </div>
    ),
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tour="nav-dashboard"]',
    content: (
      <div dir="rtl" className="text-right">
        <div className="flex items-center gap-2 mb-2">
          <IconHome size={24} className="text-blue-500" />
          <h3 className="text-lg font-bold">الصفحة الرئيسية</h3>
        </div>
        <p className="text-gray-600">
          ابدأ من هنا! شاهد ملخصاً سريعاً لإحصائياتك وعروضك الأخيرة.
        </p>
      </div>
    ),
    placement: "left",
    offset: 10,
  },
  {
    target: '[data-tour="nav-bundles"]',
    content: (
      <div dir="rtl" className="text-right">
        <div className="flex items-center gap-2 mb-2">
          <IconPackage size={24} className="text-green-500" />
          <h3 className="text-lg font-bold">صفحة الباقات</h3>
        </div>
        <p className="text-gray-600">
          أنشئ، عدّل، وأدر جميع باقاتك من هنا. يمكنك تفعيل أو إيقاف أي باقة
          بضغطة زر.
        </p>
      </div>
    ),
    placement: "left",
    offset: 10,
  },
  {
    target: '[data-tour="nav-analytics"]',
    content: (
      <div dir="rtl" className="text-right">
        <div className="flex items-center gap-2 mb-2">
          <IconChartBar size={24} className="text-violet-500" />
          <h3 className="text-lg font-bold">صفحة التحليلات</h3>
        </div>
        <p className="text-gray-600">
          احصل على تقارير مفصلة عن أداء باقاتك، المبيعات، ومعدلات التحويل.
        </p>
      </div>
    ),
    placement: "left",
    offset: 10,
  },
  {
    target: '[data-tour="nav-settings"]',
    content: (
      <div dir="rtl" className="text-right">
        <div className="flex items-center gap-2 mb-2">
          <IconSettings size={24} className="text-gray-500" />
          <h3 className="text-lg font-bold">صفحة الإعدادات</h3>
        </div>
        <p className="text-gray-600">
          خصص طريقة عرض الباقات، الألوان، الميزات، وجميع إعدادات النظام.
        </p>
      </div>
    ),
    placement: "left",
    offset: 10,
  },
  {
    target: '[data-tour="stats-cards"]',
    content: (
      <div dir="rtl" className="text-right">
        <div className="flex items-center gap-2 mb-2">
          <IconChartPie size={24} className="text-blue-500" />
          <h3 className="text-lg font-bold">إحصائيات سريعة</h3>
        </div>
        <p className="text-gray-600">
          هنا يمكنك مشاهدة ملخص لأداء عروضك: عدد العروض، المشاهدات، ومعدل
          التحويل.
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="progress-bars"]',
    content: (
      <div dir="rtl" className="text-right">
        <div className="flex items-center gap-2 mb-2">
          <IconTrendingUp size={24} className="text-green-500" />
          <h3 className="text-lg font-bold">استخدام الخطة</h3>
        </div>
        <p className="text-gray-600">
          راقب استخدامك للعروض والمشاهدات ضمن حدود خطتك الحالية. عند الاقتراب من
          الحد، يمكنك الترقية للحصول على المزيد.
        </p>
      </div>
    ),
    placement: "top",
  },
  {
    target: '[data-tour="create-bundle"]',
    content: (
      <div dir="rtl" className="text-right">
        <div className="flex items-center gap-2 mb-2">
          <IconPlus size={24} className="text-blue-500" />
          <h3 className="text-lg font-bold">إنشاء باقة جديدة</h3>
        </div>
        <p className="text-gray-600">
          ابدأ بإنشاء أول باقة لك! اختر منتج رئيسي، أضف هدايا مجانية، وخصص
          التصميم والعروض.
        </p>
      </div>
    ),
    placement: "left",
  },
  {
    target: '[data-tour="view-analytics"]',
    content: (
      <div dir="rtl" className="text-right">
        <div className="flex items-center gap-2 mb-2">
          <IconChartLine size={24} className="text-violet-500" />
          <h3 className="text-lg font-bold">التحليلات</h3>
        </div>
        <p className="text-gray-600">
          احصل على تقارير مفصلة عن أداء باقاتك، مبيعاتك، وسلوك العملاء لتحسين
          استراتيجيتك.
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="manage-bundles"]',
    content: (
      <div dir="rtl" className="text-right">
        <div className="flex items-center gap-2 mb-2">
          <IconPackage size={24} className="text-green-500" />
          <h3 className="text-lg font-bold">إدارة العروض</h3>
        </div>
        <p className="text-gray-600">
          شاهد جميع عروضك، عدّلها، فعّلها أو أوقفها، وتابع أداء كل عرض على حدة.
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="recent-bundles"]',
    content: (
      <div dir="rtl" className="text-right">
        <div className="flex items-center gap-2 mb-2">
          <IconGift size={24} className="text-pink-500" />
          <h3 className="text-lg font-bold">العروض الأخيرة</h3>
        </div>
        <p className="text-gray-600">
          الوصول السريع لآخر باقاتك التي أنشأتها لمتابعة أدائها وإجراء
          التعديلات.
        </p>
      </div>
    ),
    placement: "right",
  },
  {
    target: '[data-tour="settings"]',
    content: (
      <div dir="rtl" className="text-right">
        <div className="flex items-center gap-2 mb-2">
          <IconSettings size={24} className="text-gray-500" />
          <h3 className="text-lg font-bold">الإعدادات</h3>
        </div>
        <p className="text-gray-600">
          خصص إعدادات العرض، الألوان، المؤقت، الشحن المجاني، وميزات أخرى لتحسين
          تجربة عملائك.
        </p>
      </div>
    ),
    placement: "left",
  },
  {
    target: "body",
    content: (
      <div dir="rtl" className="text-right">
        <div className="flex items-center gap-2 mb-2">
          <IconConfetti size={28} className="text-green-500" />
          <h3 className="text-xl font-bold">انتهت الجولة!</h3>
        </div>
        <p className="text-gray-600 mb-4">
          الآن أنت جاهز لإنشاء باقاتك المخصصة وزيادة مبيعاتك!
        </p>
        <p className="text-sm text-gray-500">
          يمكنك إعادة هذه الجولة في أي وقت من الإعدادات.
        </p>
      </div>
    ),
    placement: "center",
  },
];

export const createBundleTourSteps = [
  {
    target: "body",
    content: (
      <div dir="rtl" className="text-right">
        <div className="flex items-center gap-2 mb-2">
          <IconGift size={28} className="text-blue-500" />
          <h3 className="text-xl font-bold">إنشاء باقة جديدة</h3>
        </div>
        <p className="text-gray-600">
          دعنا نساعدك في إنشاء أول باقة! اتبع الخطوات لإضافة منتج رئيسي وهدايا
          مجانية.
        </p>
      </div>
    ),
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tour="bundle-name"]',
    content: (
      <div dir="rtl" className="text-right">
        <div className="flex items-center gap-2 mb-2">
          <IconFileText size={24} className="text-blue-500" />
          <h3 className="text-lg font-bold">اسم الباقة</h3>
        </div>
        <p className="text-gray-600">
          اختر اسماً واضحاً وجذاباً لباقتك (للإدارة الداخلية فقط).
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="target-product"]',
    content: (
      <div dir="rtl" className="text-right">
        <div className="flex items-center gap-2 mb-2">
          <IconTarget size={24} className="text-red-500" />
          <h3 className="text-lg font-bold">المنتج الرئيسي</h3>
        </div>
        <p className="text-gray-600">
          حدد المنتج الذي ستظهر عنده هذه الباقة. عندما يشاهد العميل هذا المنتج،
          سيرى عرض الهدايا المجانية.
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="free-items"]',
    content: (
      <div dir="rtl" className="text-right">
        <div className="flex items-center gap-2 mb-2">
          <IconGift size={24} className="text-pink-500" />
          <h3 className="text-lg font-bold">الهدايا المجانية</h3>
        </div>
        <p className="text-gray-600">
          أضف المنتجات التي سيحصل عليها العميل مجاناً عند شراء المنتج الرئيسي.
          يمكنك إضافة عدة هدايا وتنظيمها في مستويات.
        </p>
      </div>
    ),
    placement: "top",
  },
  {
    target: '[data-tour="bundle-settings"]',
    content: (
      <div dir="rtl" className="text-right">
        <div className="flex items-center gap-2 mb-2">
          <IconSettings size={24} className="text-gray-500" />
          <h3 className="text-lg font-bold">إعدادات العرض</h3>
        </div>
        <p className="text-gray-600">
          خصص التصميم، الألوان، نوع الخصم، وتفاصيل أخرى لجعل عرضك أكثر جاذبية.
        </p>
      </div>
    ),
    placement: "top",
  },
  {
    target: '[data-tour="save-bundle"]',
    content: (
      <div dir="rtl" className="text-right">
        <div className="flex items-center gap-2 mb-2">
          <IconCheck size={24} className="text-green-500" />
          <h3 className="text-lg font-bold">احفظ وانشر</h3>
        </div>
        <p className="text-gray-600">
          احفظ باقتك كمسودة أو انشرها مباشرة لتظهر للعملاء في متجرك.
        </p>
      </div>
    ),
    placement: "top",
  },
];

export const settingsTourSteps = [
  {
    target: "body",
    content: (
      <div dir="rtl" className="text-right">
        <div className="flex items-center gap-2 mb-2">
          <IconSettings size={28} className="text-gray-500" />
          <h3 className="text-xl font-bold">إعدادات النظام</h3>
        </div>
        <p className="text-gray-600">
          خصص طريقة عرض الباقات والميزات المتاحة في متجرك.
        </p>
      </div>
    ),
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tour="display-settings"]',
    content: (
      <div dir="rtl" className="text-right">
        <div className="flex items-center gap-2 mb-2">
          <IconPalette size={24} className="text-purple-500" />
          <h3 className="text-lg font-bold">إعدادات العرض</h3>
        </div>
        <p className="text-gray-600">
          تحكم في التصميم، الألوان، والنصوص التي تظهر للعملاء في نافذة العرض.
        </p>
      </div>
    ),
    placement: "right",
  },
  {
    target: '[data-tour="features-panel"]',
    content: (
      <div dir="rtl" className="text-right">
        <div className="flex items-center gap-2 mb-2">
          <IconSparkles size={24} className="text-yellow-500" />
          <h3 className="text-lg font-bold">الميزات الإضافية</h3>
        </div>
        <p className="text-gray-600">
          فعّل ميزات مثل المؤقت، الزر الثابت، الشحن المجاني، والإعلانات. بعض
          الميزات تتطلب ترقية الخطة.
        </p>
      </div>
    ),
    placement: "right",
  },
  {
    target: '[data-tour="locked-features"]',
    content: (
      <div dir="rtl" className="text-right">
        <div className="flex items-center gap-2 mb-2">
          <IconLock size={24} className="text-red-500" />
          <h3 className="text-lg font-bold">ميزات مقفلة</h3>
        </div>
        <p className="text-gray-600">
          الميزات المقفلة متاحة في الخطط المتقدمة. انقر على "ترقية" للحصول على
          المزيد من الميزات.
        </p>
      </div>
    ),
    placement: "left",
  },
];

export const bundlesTourSteps = [
  {
    target: "body",
    content: (
      <div dir="rtl" className="text-right">
        <div className="flex items-center gap-2 mb-2">
          <IconPackage size={28} className="text-gray-500" />
          <h3 className="text-xl font-bold">إدارة الباقات</h3>
        </div>
        <p className="text-gray-600">
          شاهد وتابع جميع الباقات المنشورة في متجرك من مكان واحد.
        </p>
      </div>
    ),
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tour="search-bundles"]',
    content: (
      <div dir="rtl" className="text-right">
        <div className="flex items-center gap-2 mb-2">
          <IconSearch size={24} className="text-blue-500" />
          <h3 className="text-lg font-bold">البحث</h3>
        </div>
        <p className="text-gray-600">
          ابحث عن باقة محددة بالاسم أو رقم SKU بسهولة.
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="filter-bundles"]',
    content: (
      <div dir="rtl" className="text-right">
        <div className="flex items-center gap-2 mb-2">
          <IconFilter size={24} className="text-green-500" />
          <h3 className="text-lg font-bold">الفلترة</h3>
        </div>
        <p className="text-gray-600">
          رتب الباقات حسب الحالة: الكل، مفعّلة، معطّلة، أو مسودة.
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="create-bundle-btn"]',
    content: (
      <div dir="rtl" className="text-right">
        <div className="flex items-center gap-2 mb-2">
          <IconPlus size={24} className="text-green-500" />
          <h3 className="text-lg font-bold">إنشاء باقة جديدة</h3>
        </div>
        <p className="text-gray-600">انقر هنا لإنشاء باقة جديدة من الصفر.</p>
      </div>
    ),
    placement: "right",
  },
  {
    target: '[data-tour="bundle-card"]',
    content: (
      <div dir="rtl" className="text-right">
        <div className="flex items-center gap-2 mb-2">
          <IconPackage size={24} className="text-indigo-500" />
          <h3 className="text-lg font-bold">بطاقة الباقة</h3>
        </div>
        <p className="text-gray-600">
          كل بطاقة تعرض صورة المنتج، الاسم، السعر، والحالة. انقر عليها لتعديل
          الباقة.
        </p>
      </div>
    ),
    placement: "top",
  },
  {
    target: '[data-tour="bundle-status"]',
    content: (
      <div dir="rtl" className="text-right">
        <div className="flex items-center gap-2 mb-2">
          <IconCircleCheck size={24} className="text-green-500" />
          <h3 className="text-lg font-bold">حالة الباقة</h3>
        </div>
        <p className="text-gray-600">
          شاهد حالة الباقة: مفعّلة (ظاهرة للعملاء)، معطّلة، أو مسودة.
        </p>
      </div>
    ),
    placement: "top",
  },
  {
    target: '[data-tour="bundle-actions"]',
    content: (
      <div dir="rtl" className="text-right">
        <div className="flex items-center gap-2 mb-2">
          <IconDots size={24} className="text-gray-500" />
          <h3 className="text-lg font-bold">إجراءات الباقة</h3>
        </div>
        <p className="text-gray-600">
          تعديل، نسخ، أو حذف الباقة من قائمة الإجراءات.
        </p>
      </div>
    ),
    placement: "left",
  },
];
