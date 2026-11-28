/* NOVA admin preferences: complete Arabic/French/English localization and coherent light/dark themes. */
(() => {
  const root = document.documentElement;
  const translations = {
    en: {
      "لوحة إدارة NOVA":"NOVA Admin Dashboard","لوحة الإدارة الداخلية":"Internal Admin Dashboard","إدارة العيادة اليومية":"Daily Clinic Management","التنقل الرئيسي":"Main Navigation","تصدير المواعيد CSV":"Export Appointments CSV","دخول السكرتيرة":"Staff Sign In","تسجيل الدخول للوصول إلى لوحة إدارة العيادة.":"Sign in to access the clinic dashboard.","اسم المستخدم":"Username","كلمة المرور":"Password","تسجيل الدخول":"Sign in","تسجيل الخروج":"Sign out","الحجوزات والتقارير وإدارة العيادة":"Bookings, reports and clinic operations",
      "القائمة الرئيسية":"Main Menu","نظرة عامة":"Overview","المواعيد":"Appointments","الحجوزات":"Bookings","تنظيم الحجوزات ومتابعة حالاتها.":"Organize bookings and track their status.","ملخص النشاط خلال فترة محددة.":"Activity summary for a selected period.","مرحباً بك في لوحة العيادة":"Welcome to your clinic dashboard","نظرة سريعة على سير العمل اليومي والحجوزات.":"A clear view of daily clinic operations and bookings.","الوصول السريع":"Quick Access","المهام الأساسية":"Essential Tasks","إدارة المواعيد":"Manage Appointments","عرض التقارير":"View Reports","الإعدادات":"Settings","تغيير لغة النظام ومظهره.":"Change the system language and appearance.","ملخص العمل":"Activity Summary","من بيانات النظام":"Live system data","حالات بانتظار التأكيد":"Awaiting Confirmation","حجوزات مؤكدة":"Confirmed Bookings","حجوزات دون موعد":"Unscheduled Bookings","ملخص العيادة والمهام اليومية.":"Clinic overview and daily tasks.",
      "تحديث البيانات":"Refresh Data","جارٍ تحديث البيانات":"Refreshing data","تم التحديث":"Updated","تعذّر التحديث":"Refresh failed","إضافة حجز يدوي":"Add Manual Booking","للحجوزات القادمة عبر الهاتف أو واتساب أو الحضور المباشر.":"For bookings received by phone, WhatsApp or walk-in.","اسم المريض":"Patient Name","رقم الهاتف":"Phone Number","الخدمة":"Service","مصدر الحجز":"Booking Source","تسجيل الحجز":"Create Booking","مواعيد اليوم":"Today's Appointments","طلبات الانتظار":"Pending Requests","حجوزات مؤكدة":"Confirmed Bookings","دون موعد محدد":"Unscheduled","دون موعد":"Unscheduled","كل الحجوزات":"All Bookings","عرض مواعيد تاريخ":"Show appointments for","كل الحالات":"All Statuses","بانتظار التأكيد":"Awaiting Confirmation","مؤكد":"Confirmed","مرفوض":"Rejected","ملغي":"Cancelled","كل المصادر":"All Sources","ابحث بالاسم أو الهاتف":"Search by name or phone","الموقع الإلكتروني":"Website","الهاتف":"Phone","واتساب":"WhatsApp","حضور مباشر":"Walk-in",
      "الطلبات خلال 7 أيام":"Requests over 7 days","توزيع الحالات":"Status Breakdown","الطلب حسب الخدمة":"Bookings by Service","مصادر الطلب":"Booking Sources","آخر تحديث":"Last updated","لا توجد بيانات كافية بعد.":"Not enough data yet.","الفحص والوقاية":"Examination & Prevention","تجميل الأسنان":"Cosmetic Dentistry","تقويم الأسنان":"Orthodontics","ترميم الأسنان":"Restorative Dentistry","زراعة الأسنان":"Dental Implants","أسنان الأطفال":"Pediatric Dentistry","أخرى":"Other","علاج عام":"General Dentistry","طب أسنان الأطفال":"Pediatric Dentistry","خدمة أخرى":"Other Service","المصدر":"Source","الحالة":"Status","لم يتم تحديد موعد":"No appointment scheduled","تاريخ الطلب":"Request Date","ملاحظات:":"Notes:","الموعد":"Appointment","الطبيب":"Dentist","البريد الإلكتروني":"Email","ملاحظات":"Notes","التاريخ والساعة":"Date & Time","حفظ الموعد":"Save Appointment","تأكيد الحجز":"Confirm Booking","رفض الطلب":"Reject Request","إلغاء الحجز":"Cancel Booking","هل تريد تأكيد هذا الحجز؟":"Confirm this booking?","هل تريد رفض الطلب؟":"Reject this request?","هل تريد إلغاء الحجز؟":"Cancel this booking?","هذا الموعد يتعارض مع حجز آخر.":"This time conflicts with another booking.","الموعد يتعارض مع حجز آخر.":"This time conflicts with another booking.","تعذر تحميل الحجوزات.":"Could not load bookings.","تعذر الاتصال بالخادم.":"Could not connect to the server.","جارٍ تحميل الحجوزات...":"Loading bookings...","لا توجد حجوزات مطابقة.":"No matching bookings.","تم حفظ الموعد.":"Appointment saved.","تم تحديث حالة الحجز.":"Booking status updated.","لم يتم تحديث الحالة.":"The status was not updated.","تعذر حفظ الموعد.":"Could not save the appointment.","تحقق من الاسم ورقم الهاتف والخدمة.":"Check the name, phone number and service.","تعذر تسجيل الحجز.":"Could not create the booking.","تم تسجيل الحجز اليدوي.":"Manual booking created.","لا توجد بيانات كافية بعد.":"Not enough data yet.",
      "التقارير والإحصائيات":"Reports & Statistics","التقارير":"Reports","من تاريخ":"From Date","إلى تاريخ":"To Date","عرض التقرير":"Generate Report","تصدير CSV":"Export CSV","تصدير المواعيد CSV":"Export Appointments CSV","المرضى الجدد":"New Patients","إجمالي الزيارات":"Total Visits","إجمالي الحجوزات":"Total Bookings","الحجوزات حسب الحالة":"Bookings by Status","الزيارات حسب الخدمة":"Visits by Service","الزيارات حسب اليوم":"Visits by Day","تحقق من فترة التقرير.":"Check the report date range.","جارٍ إعداد التقرير...":"Preparing report...","تعذر تحميل التقرير.":"Could not load the report.","تم تحديث التقرير.":"Report updated.","لا توجد بيانات خلال هذه الفترة.":"No data for this period.","القسم":"Section","البند":"Item","القيمة":"Value","ملخص":"Summary","نتيجة":"results","الزيارات":"Visits","غير محدد":"Not specified","مريض":"Patient",
      "الإعدادات":"Settings","خصص لغة واجهة الإدارة ومظهرها.":"Personalize the dashboard language and appearance.","لغة النظام":"System Language","اختر العربية أو الفرنسية أو الإنجليزية.":"Choose Arabic, French or English.","مظهر النظام":"System Theme","اختر الوضع الفاتح أو الداكن أو حسب الجهاز.":"Choose light, dark or follow device settings.","لغة النظام (افتراضي)":"System language (default)","حسب إعداد الجهاز":"Follow device","العربية":"Arabic","فاتح":"Light","داكن":"Dark","يتم تطبيق التغييرات على كامل لوحة الإدارة وحفظها تلقائياً.":"Changes apply across the entire dashboard and are saved automatically.","لغة الواجهة":"Interface Language","مظهر لوحة الإدارة":"Dashboard Theme",
      "جارٍ التحقق...":"Signing in...","تم إيقاف المحاولات مؤقتاً. حاول لاحقاً.":"Sign-in temporarily blocked. Try again later.","إعداد حساب الإدارة غير مكتمل.":"Admin account setup is incomplete.","اسم المستخدم أو كلمة المرور غير صحيحة.":"Incorrect username or password.","انتهت جلسة الدخول. يرجى تسجيل الدخول مجدداً.":"Your session expired. Please sign in again.","تم تسجيل الخروج.":"You have signed out.","تعذر الاتصال بالخادم.":"Could not connect to the server.","الاسم":"Name","عدد الزيارات":"Visit Count","NOVA Dental Studio · لوحة إدارة داخلية":"NOVA Dental Studio · Internal Administration"
    },
    fr: {
      "لوحة إدارة NOVA":"Tableau de bord NOVA","لوحة الإدارة الداخلية":"Administration interne","إدارة العيادة اليومية":"Gestion quotidienne du cabinet","التنقل الرئيسي":"Navigation principale","تصدير المواعيد CSV":"Exporter les rendez-vous CSV","دخول السكرتيرة":"Connexion du personnel","تسجيل الدخول للوصول إلى لوحة إدارة العيادة.":"Connectez-vous pour accéder au tableau de bord du cabinet.","اسم المستخدم":"Nom d’utilisateur","كلمة المرور":"Mot de passe","تسجيل الدخول":"Se connecter","تسجيل الخروج":"Se déconnecter","الحجوزات والتقارير وإدارة العيادة":"Réservations, rapports et gestion du cabinet",
      "القائمة الرئيسية":"Menu principal","نظرة عامة":"Vue d’ensemble","المواعيد":"Rendez-vous","الحجوزات":"Réservations","تنظيم الحجوزات ومتابعة حالاتها.":"Organiser les réservations et suivre leur statut.","ملخص النشاط خلال فترة محددة.":"Résumé de l’activité sur une période donnée.","مرحباً بك في لوحة العيادة":"Bienvenue dans votre tableau de bord","نظرة سريعة على سير العمل اليومي والحجوزات.":"Une vue claire des activités quotidiennes et des réservations.","الوصول السريع":"Accès rapide","المهام الأساسية":"Actions essentielles","إدارة المواعيد":"Gérer les rendez-vous","عرض التقارير":"Voir les rapports","الإعدادات":"Paramètres","تغيير لغة النظام ومظهره.":"Modifier la langue et l’apparence du système.","ملخص العمل":"Résumé de l’activité","من بيانات النظام":"Données du système","حالات بانتظار التأكيد":"En attente de confirmation","حجوزات مؤكدة":"Réservations confirmées","حجوزات دون موعد":"Réservations sans horaire","ملخص العيادة والمهام اليومية.":"Vue d’ensemble du cabinet et tâches quotidiennes.",
      "تحديث البيانات":"Actualiser les données","جارٍ تحديث البيانات":"Actualisation en cours","تم التحديث":"Mis à jour","تعذّر التحديث":"Échec de l’actualisation","إضافة حجز يدوي":"Ajouter une réservation","للحجوزات القادمة عبر الهاتف أو واتساب أو الحضور المباشر.":"Pour les demandes reçues par téléphone, WhatsApp ou sur place.","اسم المريض":"Nom du patient","رقم الهاتف":"Téléphone","الخدمة":"Service","مصدر الحجز":"Source de réservation","تسجيل الحجز":"Créer la réservation","مواعيد اليوم":"Rendez-vous du jour","طلبات الانتظار":"Demandes en attente","حجوزات مؤكدة":"Réservations confirmées","دون موعد محدد":"Sans horaire","دون موعد":"Sans horaire","كل الحجوزات":"Toutes les réservations","عرض مواعيد تاريخ":"Afficher les rendez-vous du","كل الحالات":"Tous les statuts","بانتظار التأكيد":"En attente de confirmation","مؤكد":"Confirmé","مرفوض":"Refusé","ملغي":"Annulé","كل المصادر":"Toutes les sources","ابحث بالاسم أو الهاتف":"Rechercher par nom ou téléphone","الموقع الإلكتروني":"Site web","الهاتف":"Téléphone","واتساب":"WhatsApp","حضور مباشر":"Sans rendez-vous",
      "الطلبات خلال 7 أيام":"Demandes sur 7 jours","توزيع الحالات":"Répartition des statuts","الطلب حسب الخدمة":"Demandes par service","مصادر الطلب":"Sources des demandes","آخر تحديث":"Dernière mise à jour","لا توجد بيانات كافية بعد.":"Pas encore assez de données.","الفحص والوقاية":"Examen et prévention","تجميل الأسنان":"Dentisterie esthétique","تقويم الأسنان":"Orthodontie","ترميم الأسنان":"Soins restaurateurs","زراعة الأسنان":"Implants dentaires","أسنان الأطفال":"Dentisterie pédiatrique","أخرى":"Autre","علاج عام":"Soins généraux","طب أسنان الأطفال":"Dentisterie pédiatrique","خدمة أخرى":"Autre service","المصدر":"Source","الحالة":"Statut","لم يتم تحديد موعد":"Aucun rendez-vous planifié","تاريخ الطلب":"Date de demande","ملاحظات:":"Notes :","الموعد":"Rendez-vous","الطبيب":"Dentiste","البريد الإلكتروني":"E-mail","ملاحظات":"Notes","التاريخ والساعة":"Date et heure","حفظ الموعد":"Enregistrer le rendez-vous","تأكيد الحجز":"Confirmer la réservation","رفض الطلب":"Refuser la demande","إلغاء الحجز":"Annuler la réservation","هل تريد تأكيد هذا الحجز؟":"Confirmer cette réservation ?","هل تريد رفض الطلب؟":"Refuser cette demande ?","هل تريد إلغاء الحجز؟":"Annuler cette réservation ?","هذا الموعد يتعارض مع حجز آخر.":"Ce créneau chevauche une autre réservation.","الموعد يتعارض مع حجز آخر.":"Ce créneau chevauche une autre réservation.","تعذر تحميل الحجوزات.":"Impossible de charger les réservations.","تعذر الاتصال بالخادم.":"Impossible de contacter le serveur.","جارٍ تحميل الحجوزات...":"Chargement des réservations...","لا توجد حجوزات مطابقة.":"Aucune réservation correspondante.","تم حفظ الموعد.":"Rendez-vous enregistré.","تم تحديث حالة الحجز.":"Statut de réservation mis à jour.","لم يتم تحديث الحالة.":"Le statut n’a pas été modifié.","تعذر حفظ الموعد.":"Impossible d’enregistrer le rendez-vous.","تحقق من الاسم ورقم الهاتف والخدمة.":"Vérifiez le nom, le téléphone et le service.","تعذر تسجيل الحجز.":"Impossible de créer la réservation.","تم تسجيل الحجز اليدوي.":"Réservation manuelle créée.",
      "التقارير والإحصائيات":"Rapports et statistiques","التقارير":"Rapports","من تاريخ":"Du","إلى تاريخ":"Au","عرض التقرير":"Générer le rapport","تصدير CSV":"Exporter CSV","تصدير المواعيد CSV":"Exporter les rendez-vous CSV","المرضى الجدد":"Nouveaux patients","إجمالي الزيارات":"Nombre total de visites","إجمالي الحجوزات":"Nombre total de réservations","الحجوزات حسب الحالة":"Réservations par statut","الزيارات حسب الخدمة":"Visites par service","الزيارات حسب اليوم":"Visites par jour","تحقق من فترة التقرير.":"Vérifiez la période du rapport.","جارٍ إعداد التقرير...":"Préparation du rapport...","تعذر تحميل التقرير.":"Impossible de charger le rapport.","تم تحديث التقرير.":"Rapport mis à jour.","لا توجد بيانات خلال هذه الفترة.":"Aucune donnée pour cette période.","القسم":"Section","البند":"Élément","القيمة":"Valeur","ملخص":"Résumé","نتيجة":"résultats","الزيارات":"Visites","غير محدد":"Non spécifié","مريض":"Patient",
      "الإعدادات":"Paramètres","خصص لغة واجهة الإدارة ومظهرها.":"Personnalisez la langue et l’apparence du tableau de bord.","لغة النظام":"Langue du système","اختر العربية أو الفرنسية أو الإنجليزية.":"Choisissez l’arabe, le français ou l’anglais.","مظهر النظام":"Thème du système","اختر الوضع الفاتح أو الداكن أو حسب الجهاز.":"Choisissez le mode clair, sombre ou celui de l’appareil.","لغة النظام (افتراضي)":"Langue du système (par défaut)","حسب إعداد الجهاز":"Selon l’appareil","العربية":"Arabe","فاتح":"Clair","داكن":"Sombre","يتم تطبيق التغييرات على كامل لوحة الإدارة وحفظها تلقائياً.":"Les changements s’appliquent à tout le tableau de bord et sont enregistrés automatiquement.","لغة الواجهة":"Langue de l’interface","مظهر لوحة الإدارة":"Thème du tableau de bord",
      "جارٍ التحقق...":"Connexion en cours...","تم إيقاف المحاولات مؤقتاً. حاول لاحقاً.":"Connexion temporairement bloquée. Réessayez plus tard.","إعداد حساب الإدارة غير مكتمل.":"La configuration du compte administrateur est incomplète.","اسم المستخدم أو كلمة المرور غير صحيحة.":"Nom d’utilisateur ou mot de passe incorrect.","انتهت جلسة الدخول. يرجى تسجيل الدخول مجدداً.":"Votre session a expiré. Veuillez vous reconnecter.","تم تسجيل الخروج.":"Vous êtes déconnecté.","الاسم":"Nom","عدد الزيارات":"Nombre de visites","NOVA Dental Studio · لوحة إدارة داخلية":"NOVA Dental Studio · Administration interne"
    }
  };

  const originalText = new WeakMap();
  const originalAttrs = new WeakMap();
  const reverseTranslations = Object.entries(translations).flatMap(([lang, dict]) =>
    Object.entries(dict).map(([source, translated]) => [translated, source, lang])
  ).sort((a, b) => String(b[0]).length - String(a[0]).length);
  function normalizeSource(value) {
    let result = String(value ?? '');
    for (const [translated, source] of reverseTranslations) {
      if (!translated || translated === source) continue;
      if (result === translated) return source;
    }
    for (const [translated, source] of reverseTranslations) {
      if (translated && translated !== source && result.includes(translated)) {
        result = result.split(translated).join(source);
      }
    }
    return result;
  }
  const systemLanguage = () => {
    const l = (navigator.languages?.[0] || navigator.language || 'ar').toLowerCase();
    return l.startsWith('fr') ? 'fr' : l.startsWith('en') ? 'en' : 'ar';
  };
  const selectedLanguage = () => localStorage.getItem('nova-admin-language') || 'system';
  const language = () => { const v = selectedLanguage(); return v === 'system' ? systemLanguage() : v; };
  const selectedTheme = () => localStorage.getItem('nova-admin-theme') || 'system';
  const theme = () => { const v = selectedTheme(); return v === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : v; };

  function translateValue(value, lang) {
    const dict = translations[lang] || {};
    const clean = String(value ?? '').trim();
    if (!clean || lang === 'ar') return value;
    if (dict[clean]) return String(value).replace(clean, dict[clean]);
    // Translate mixed UI strings while leaving patient-generated content intact.
    let result = String(value);
    for (const key of Object.keys(dict).sort((a, b) => b.length - a.length)) {
      if (key.length < 3 || !result.includes(key)) continue;
      result = result.split(key).join(dict[key]);
    }
    return result;
  }

  function translateTree(node, lang) {
    if (!node) return;
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    let textNode;
    while ((textNode = walker.nextNode())) {
      if (!originalText.has(textNode)) originalText.set(textNode, normalizeSource(textNode.nodeValue));
      const original = normalizeSource(originalText.get(textNode));
      originalText.set(textNode, original);
      if (!original?.trim()) continue;
      textNode.nodeValue = translateValue(original, lang);
    }
    const elements = node.nodeType === 1 ? [node, ...node.querySelectorAll('[placeholder],[aria-label],[title]')] : [...(node.querySelectorAll?.('[placeholder],[aria-label],[title]') || [])];
    const dict = translations[lang] || {};
    for (const el of elements) {
      for (const attr of ['placeholder', 'aria-label', 'title']) {
        if (!el.hasAttribute?.(attr)) continue;
        let saved = originalAttrs.get(el);
        if (!saved) { saved = {}; originalAttrs.set(el, saved); }
        if (!(attr in saved)) saved[attr] = normalizeSource(el.getAttribute(attr));
        else saved[attr] = normalizeSource(saved[attr]);
        el.setAttribute(attr, translateValue(saved[attr], lang));
      }
    }
  }

  function apply() {
    const lang = language();
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    const activeTheme = theme();
    root.lang = lang;
    root.dir = dir;
    root.dataset.theme = activeTheme;
    document.body.dataset.theme = activeTheme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', activeTheme === 'dark' ? '#14211f' : '#f4f7f5');
    translateTree(document.body, lang);
    const title = { ar: 'NOVA | لوحة الإدارة', en: 'NOVA | Admin Dashboard', fr: 'NOVA | Administration' }[lang];
    document.title = title;
    document.querySelectorAll('[data-nova-language]').forEach(el => { el.value = selectedLanguage(); });
    document.querySelectorAll('[data-nova-theme]').forEach(el => { el.value = selectedTheme(); });
    window.dispatchEvent(new Event('nova:preferences-changed'));
  }

  window.NOVAAdminPreferences = {
    apply,
    translate: value => translateValue(value, language()),
    currentLanguage: language,
    currentTheme: theme
  };

  const styles = document.createElement('style');
  styles.id = 'nova-global-preferences-theme';
  styles.textContent = `
    :root[data-theme="light"]{color-scheme:light;--nova-ink:#203a35;--nova-muted:#71847d;--nova-line:#dfe9e4;--nova-bg:#f3f7f4;--nova-card:#ffffff;--nova-card-soft:#f7faf8;--nova-panel:#ffffff;--nova-input:#ffffff;--nova-teal:#226c61;--nova-teal-dark:#18564e;--nova-mint:#e7f2ed;--nova-text:#203a35}
    :root[data-theme="dark"]{color-scheme:dark;--nova-ink:#e6efeb;--nova-muted:#a0b4ac;--nova-line:#344b43;--nova-bg:#101a17;--nova-card:#1b2b25;--nova-card-soft:#22372f;--nova-panel:#1b2b25;--nova-input:#14231e;--nova-teal:#68b4a4;--nova-teal-dark:#4b9e8e;--nova-mint:#29463c;--nova-text:#e6efeb}
    :root[data-theme="light"] body{background:var(--nova-bg)!important;color:var(--nova-ink)!important}
    :root[data-theme="light"] .topbar{background:rgba(250,252,250,.96)!important;color:var(--nova-ink)!important;border-color:var(--nova-line)!important}
    :root[data-theme="light"] .nova-sidebar{background:linear-gradient(160deg,#e5f0ea,#dcebe3)!important;color:#24483d!important;box-shadow:0 16px 38px rgba(33,74,59,.08)}
    :root[data-theme="light"] .nova-side-brand strong,:root[data-theme="light"] .nova-nav button{color:#24483d!important}
    :root[data-theme="light"] .nova-side-brand small,:root[data-theme="light"] .nova-nav-label,:root[data-theme="light"] .nova-sidebar-foot{color:#668579!important}
    :root[data-theme="light"] .nova-nav button:hover{background:rgba(39,100,79,.08)!important}
    :root[data-theme="light"] .nova-nav button.active{background:#ffffff!important;color:#1d695b!important}
    :root[data-theme="light"] .nova-welcome{background:linear-gradient(112deg,#e4f0e9,#d3e8df)!important;color:#21463b!important;box-shadow:0 14px 30px rgba(42,93,71,.08)}
    :root[data-theme="light"] .nova-welcome h2,:root[data-theme="light"] .nova-welcome p,:root[data-theme="light"] .nova-welcome small,:root[data-theme="light"] .nova-welcome-date{color:#21463b!important}
    :root[data-theme="light"] .nova-welcome-date{border-color:rgba(33,70,59,.18)!important}
    :root[data-theme="light"] .nova-card,:root[data-theme="light"] .stat,:root[data-theme="light"] .section-panel,:root[data-theme="light"] .manual-form,:root[data-theme="light"] .appointment,:root[data-theme="light"] .panel,:root[data-theme="light"] .record-card,:root[data-theme="light"] .nova-shortcut,:root[data-theme="light"] .empty{background:var(--nova-card)!important;color:var(--nova-ink)!important;border-color:var(--nova-line)!important}
    :root[data-theme="light"] .nova-shortcut{background:var(--nova-card-soft)!important}
    :root[data-theme="light"] .nova-shortcut:hover{background:#edf6f1!important}
    :root[data-theme="light"] .nova-card h2,:root[data-theme="light"] .nova-toolbar h1,:root[data-theme="light"] .nova-info-row strong,:root[data-theme="light"] .stat strong{color:var(--nova-ink)!important}
    :root[data-theme="light"] .nova-info-row{border-color:var(--nova-line)!important}
    :root[data-theme="light"] input,:root[data-theme="light"] select,:root[data-theme="light"] textarea{background:var(--nova-input)!important;color:var(--nova-ink)!important;border-color:var(--nova-line)!important}
    :root[data-theme="light"] .views,:root[data-theme="light"] .patient-detail,:root[data-theme="light"] .schedule-box,:root[data-theme="light"] .notes,:root[data-theme="light"] .report-stat{background:var(--nova-card-soft)!important;color:var(--nova-ink)!important;border-color:var(--nova-line)!important}
    :root[data-theme="light"] .view-btn{color:var(--nova-muted)!important}:root[data-theme="light"] .view-btn.active{background:var(--nova-teal)!important;color:#fff!important}
    :root[data-theme="light"] .btn-light{background:#eaf2ed!important;color:#28584b!important}
    :root[data-theme="light"] option{background:#fff!important;color:var(--nova-ink)!important}
    :root[data-theme="light"] .status{background:#f7efdf!important;color:#86632c!important}
    :root[data-theme="light"] .status.confirmed{background:#e5f2e9!important;color:#267052!important}
    :root[data-theme="light"] .status.rejected,:root[data-theme="light"] .status.cancelled{background:#f8e9e7!important;color:#a34d45!important}
    :root[data-theme="dark"] body{background:radial-gradient(circle at 88% 0%,#1b332a 0,transparent 28%),var(--nova-bg)!important;color:var(--nova-ink)!important}
    :root[data-theme="dark"] .topbar{background:rgba(20,34,29,.97)!important;color:var(--nova-ink)!important;border-color:var(--nova-line)!important}
    :root[data-theme="dark"] .nova-sidebar{background:linear-gradient(165deg,#182f27,#13251f)!important;color:var(--nova-ink)!important;border:1px solid var(--nova-line)}
    :root[data-theme="dark"] .nova-side-brand strong,:root[data-theme="dark"] .nova-nav button{color:#dceae4!important}
    :root[data-theme="dark"] .nova-side-brand small,:root[data-theme="dark"] .nova-nav-label,:root[data-theme="dark"] .nova-sidebar-foot{color:#8da99b!important}
    :root[data-theme="dark"] .nova-nav button:hover{background:#294239!important;color:#fff!important}
    :root[data-theme="dark"] .nova-nav button.active{background:#2b493e!important;color:#b9e4d2!important;box-shadow:none}
    :root[data-theme="dark"] .nova-welcome{background:linear-gradient(112deg,#1c3930,#23483b)!important;color:#e6efeb!important;box-shadow:0 14px 32px rgba(0,0,0,.18)}
    :root[data-theme="dark"] .nova-welcome h2,:root[data-theme="dark"] .nova-welcome p,:root[data-theme="dark"] .nova-welcome small,:root[data-theme="dark"] .nova-welcome-date{color:#e6efeb!important}
    :root[data-theme="dark"] .nova-welcome p{color:#bfd0c7!important}
    :root[data-theme="dark"] .nova-welcome-date{border-color:#506b5e!important}
    :root[data-theme="dark"] .nova-card,:root[data-theme="dark"] .stat,:root[data-theme="dark"] .section-panel,:root[data-theme="dark"] .manual-form,:root[data-theme="dark"] .appointment,:root[data-theme="dark"] .panel,:root[data-theme="dark"] .record-card,:root[data-theme="dark"] .nova-shortcut,:root[data-theme="dark"] .empty{background:var(--nova-card)!important;color:var(--nova-ink)!important;border-color:var(--nova-line)!important;box-shadow:0 10px 28px rgba(0,0,0,.13)}
    :root[data-theme="dark"] .nova-shortcut{background:var(--nova-card-soft)!important;color:var(--nova-ink)!important}
    :root[data-theme="dark"] .nova-shortcut:hover{background:#2a4439!important;border-color:#547465!important}
    :root[data-theme="dark"] .nova-shortcut i{background:#29483d!important;color:#9bd0ba!important}
    :root[data-theme="dark"] .nova-card h2,:root[data-theme="dark"] .nova-toolbar h1,:root[data-theme="dark"] .nova-info-row strong,:root[data-theme="dark"] .stat strong,:root[data-theme="dark"] h1,:root[data-theme="dark"] h2{color:var(--nova-ink)!important}
    :root[data-theme="dark"] .nova-info-row{border-color:var(--nova-line)!important}
    :root[data-theme="dark"] .nova-info-row span,:root[data-theme="dark"] .nova-card-head small,:root[data-theme="dark"] .muted,:root[data-theme="dark"] .subtitle{color:var(--nova-muted)!important}
    :root[data-theme="dark"] input,:root[data-theme="dark"] select,:root[data-theme="dark"] textarea{background:var(--nova-input)!important;color:var(--nova-ink)!important;border-color:#3b5449!important;color-scheme:dark}
    :root[data-theme="dark"] input::placeholder,:root[data-theme="dark"] textarea::placeholder{color:#81978c!important}
    :root[data-theme="dark"] .views,:root[data-theme="dark"] .patient-detail,:root[data-theme="dark"] .schedule-box,:root[data-theme="dark"] .notes,:root[data-theme="dark"] .report-stat{background:var(--nova-card-soft)!important;color:var(--nova-ink)!important;border-color:var(--nova-line)!important}
    :root[data-theme="dark"] .view-btn{color:#bacbc2!important}:root[data-theme="dark"] .view-btn.active{background:#377a68!important;color:#fff!important}
    :root[data-theme="dark"] .btn-light{background:#2a4137!important;color:#d9e9e1!important;border:1px solid #40594d!important}
    :root[data-theme="dark"] .btn-light:hover{background:#365347!important}
    :root[data-theme="dark"] .status{background:#493c28!important;color:#e6c990!important}
    :root[data-theme="dark"] .status.confirmed{background:#244838!important;color:#9ad5b4!important}
    :root[data-theme="dark"] .status.rejected,:root[data-theme="dark"] .status.cancelled{background:#4b302e!important;color:#efaaa1!important}
    :root[data-theme="dark"] .stat::after{border-color:rgba(168,197,182,.09)!important}
    :root[data-theme="dark"] option{background:#14231e!important;color:#e6efeb!important}
    :root[data-theme="dark"] .actions{border-color:var(--nova-line)!important}
    :root[data-theme="dark"] .appointment-head{border-color:var(--nova-line)!important}
    :root[data-theme="dark"] .footer-note{color:#81978c!important}
    :root[data-theme="dark"] .refresh-action{background:#2a4137!important;color:#d9e9e1!important}
    :root[data-theme="dark"] .nova-setting-card{background:var(--nova-card-soft)!important;border-color:var(--nova-line)!important;color:var(--nova-ink)!important}
    :root[data-theme="light"] .nova-setting-card{background:var(--nova-card-soft)!important;border-color:var(--nova-line)!important;color:var(--nova-ink)!important}
    .nova-settings-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:18px}
    .nova-setting-card{display:grid;grid-template-columns:42px minmax(0,1fr);gap:12px;align-items:center;padding:17px;border:1px solid var(--nova-line);border-radius:15px;background:var(--nova-card-soft);color:var(--nova-ink);cursor:pointer}
    .nova-setting-icon{width:40px;height:40px;display:grid;place-items:center;border-radius:12px;background:var(--nova-mint);color:var(--nova-teal);font-size:18px;font-weight:800}
    .nova-setting-copy{display:grid;gap:4px}.nova-setting-copy strong{font-size:13px}.nova-setting-copy small{color:var(--nova-muted);font-size:11px;line-height:1.6}
    .nova-setting-card select{grid-column:1/-1;margin-top:4px}
    .nova-settings-hint{margin:16px 0 0;color:var(--nova-muted);font-size:11px}
    .refresh-action{display:inline-flex;align-items:center;justify-content:center;gap:9px;min-width:142px}
    .refresh-icon{display:inline-block;font-size:18px;line-height:1;transition:transform .35s ease}
    .refresh-action:hover .refresh-icon{transform:rotate(90deg)}
    .refresh-action.is-refreshing .refresh-icon{animation:nova-refresh-spin .8s linear infinite}
    .refresh-action.is-refreshing{opacity:.9;cursor:progress}
    @keyframes nova-refresh-spin{to{transform:rotate(360deg)}}
    :root[dir="ltr"] body{font-family:Inter,"Segoe UI",system-ui,sans-serif}
    :root[dir="ltr"] .nova-shell{direction:ltr}
    :root[dir="ltr"] .nova-nav button,:root[dir="ltr"] .nova-shortcut{text-align:left}
    :root[dir="ltr"] .nova-welcome small,:root[dir="ltr"] .nova-admin-toolbar .admin-eyebrow,:root[dir="ltr"] .nova-side-brand small{text-align:left}
    :root[dir="ltr"] .nova-info-row{flex-direction:row}
    :root[dir="ltr"] .patient-phone
    @media(max-width:650px){.nova-settings-grid{grid-template-columns:1fr}}
  `;
  document.head.append(styles);
  apply();

  const observer = new MutationObserver(records => {
    const lang = language();
    for (const record of records) {
      for (const added of record.addedNodes) {
        if (added.nodeType === 1 || added.nodeType === 3) translateTree(added, lang);
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => {
    if (selectedTheme() === 'system') apply();
  });
})();
