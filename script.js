/* NOVA Dental Studio — static, multilingual front-end.
   Update CLINIC_CONFIG below before publishing the clinic's real website. */
const CLINIC_CONFIG = {
  whatsapp: "", // International format, digits only. Example: 213555123456
  clinicName: "NOVA Dental Studio"
};

const translations = {
  ar: {
    announcement:"رعاية دقيقة. تجربة أكثر هدوءاً. ابتسامة بثقة.",announcementLink:"احجز موعدك",brandSub:"DENTAL STUDIO",navServices:"خدماتنا",navApproach:"نهجنا",navTeam:"فريقنا",navFaq:"أسئلة شائعة",navContact:"اتصل بنا",bookNow:"احجز موعداً",
    heroEyebrow:"طب أسنان معاصر، برؤية إنسانية",heroTitle:"ابتسامتك تستحق<br><em>عناية استثنائية.</em>",heroText:"نمنحك تجربة علاجية تجمع بين الدقة الطبية والراحة والاهتمام بالتفاصيل — من أول زيارة وحتى اكتمال ابتسامتك.",heroCta:"ابدأ رحلتك معنا",exploreServices:"اكتشف خدماتنا",heroProofStrong:"اهتمام يبدأ بالاستماع",heroProofSmall:"خطة علاج واضحة، مصممة لاحتياجاتك.",heroImageNote:"مساحة صُممت لراحتك",floatingTitle:"رعاية تتمحور حولك",floatingText:"كل ابتسامة لها قصتها.",heroIndex:"العناية تبدأ هنا",heroBottomLeft:"طب أسنان شامل · تجميلي · وقائي",scroll:"مرّر للاستكشاف",
    trust1:"استماع قبل العلاج",trust2:"خطة واضحة وشفافة",trust3:"عناية تراعي راحتك",trust4:"متابعة تهتم بالتفاصيل",
    servicesEyebrow:"رعاية متكاملة",servicesTitle:"كل ما تحتاجه<br><em>ابتسامتك، في مكان واحد.</em>",servicesIntro:"من الفحص الدوري إلى العلاجات المتقدمة، نساعدك على اختيار الحل الأنسب لصحة فمك وأهدافك.",discussTreatment:"ناقش احتياجك معنا",service1Title:"طب الأسنان العام والوقائي",service1Text:"فحوصات دورية، تنظيف احترافي، وعلاجات تحفظ صحة أسنانك على المدى الطويل.",service2Title:"تجميل الأسنان والابتسامة",service2Text:"حلول تجميلية مدروسة لتحسين تناسق الابتسامة ومظهر الأسنان بشكل طبيعي.",service3Title:"تقويم الأسنان",service3Text:"تقييم وخيارات لتصحيح اصطفاف الأسنان وتحسين الإطباق ووظيفة الفم.",service4Title:"الترميم وزراعة الأسنان",service4Text:"استعادة الوظيفة والمظهر بخيارات علاجية يحددها تقييم طبي دقيق.",service5Title:"طب أسنان الأطفال",service5Text:"زيارات لطيفة وتوجيه وقائي يساعد الصغار على بناء علاقة إيجابية مع العناية بأسنانهم.",service6Title:"رعاية الحالات المستعجلة",service6Text:"استجابة أولية وتوجيه للحالات التي تتطلب تقييماً سريعاً حسب المواعيد المتاحة.",learnMore:"اكتشف الخدمة",
    approachCaption:"الإنصات هو بداية كل خطة ناجحة",approachEyebrow:"أكثر من مجرد علاج",approachTitle:"نؤمن أن أفضل<br>علاج يبدأ بـ <em>الثقة.</em>",approachText:"نشرح لك الخيارات بلغة بسيطة، نستمع إلى مخاوفك، ونضع معك خطة تناسب احتياجاتك. لا خطوات غامضة ولا قرارات مستعجلة — فقط رعاية واضحة تحترمك.",point1Title:"تواصل واضح",point1Text:"تفهم ما سيحدث ولماذا قبل بدء العلاج.",point2Title:"خطة تناسبك",point2Text:"نراعي حالتك وأولوياتك والخيارات المتاحة.",point3Title:"اهتمام مستمر",point3Text:"نتابع معك ونجيب عن أسئلتك في كل مرحلة.",meetUs:"تعرّف علينا",
    teamEyebrow:"العناية تبدأ بالفريق",teamTitle:"خبرة مهنية،<br><em>ولمسة إنسانية.</em>",teamText:"نضع الكفاءة الطبية والتواصل الإنساني في قلب كل زيارة. تعرّف على الطبيب أو الفريق الذي سيهتم بابتسامتك.",askTeam:"اسأل عن فريقنا",teamCardTitle:"رعاية شخصية في كل زيارة",teamCardText:"فريق يستمع، يشرح، ويهتم.",
    journeyEyebrow:"خطوات بسيطة وواضحة",journeyTitle:"رحلتك معنا، <em>بكل راحة.</em>",journeyText:"نرافقك في كل خطوة، من أول تواصل إلى المتابعة بعد العلاج.",step1Title:"تواصل معنا",step1Text:"اختر طريقة التواصل المناسبة وحدد الوقت الذي يناسبك.",step2Title:"استشارة وفحص",step2Text:"نستمع إليك ونقيّم احتياجاتك قبل اقتراح أي علاج.",step3Title:"خطة واضحة",step3Text:"نشرح الخيارات والخطوات والتكلفة المتوقعة بوضوح.",step4Title:"عناية ومتابعة",step4Text:"نبدأ العلاج المتفق عليه ونبقى إلى جانبك في المتابعة.",quote:"الابتسامة الواثقة لا تبدأ من المرآة، بل من شعورك بأنك في أيدٍ أمينة.",
    faqEyebrow:"قبل زيارتك",faqTitle:"أسئلة قد<br><em>تدور في بالك.</em>",faqText:"لم تجد إجابة سؤالك؟ تواصل معنا وسيسعد فريقنا بمساعدتك.",contactUs:"تواصل مع العيادة",faq1Q:"كيف يمكنني حجز موعد؟",faq1A:"يمكنك إرسال طلب عبر نموذج الحجز في هذه الصفحة. سيفتح واتساب برسالة جاهزة بعد إضافة رقم العيادة في إعدادات الموقع.",faq2Q:"هل أحتاج إلى فحص قبل اختيار العلاج؟",faq2A:"نعم، يبدأ اختيار العلاج المناسب بفحص وتقييم للحالة. المعلومات الموجودة على الموقع عامة ولا تُعد تشخيصاً طبياً.",faq3Q:"هل يمكنني معرفة التكلفة قبل الزيارة؟",faq3A:"تختلف التكلفة حسب الحالة والخطة العلاجية. يمكن للفريق توضيح الرسوم بعد فهم احتياجك وإجراء التقييم اللازم.",faq4Q:"هل تستقبلون الأطفال؟",faq4A:"نعم، يمكن طلب موعد للأطفال، ويُفضّل ذكر عمر الطفل وسبب الزيارة عند التواصل لتوجيهك بشكل مناسب.",faq5Q:"ماذا أفعل في حالة ألم الأسنان المفاجئ؟",faq5A:"اتصل بالعيادة لطلب توجيه وموعد متاح. إذا كان هناك تورم شديد أو صعوبة في التنفس أو البلع، اطلب المساعدة الطبية الطارئة فوراً.",
    contactEyebrow:"خطوتك الأولى تبدأ هنا",contactTitle:"جاهز للاهتمام<br><em>بابتسامتك؟</em>",contactText:"أرسل طلب موعدك، وسنتواصل معك لتأكيد الوقت المناسب والإجابة عن استفساراتك.",addressLabel:"العنوان",addressValue:"أضف عنوان العيادة، الجزائر",hoursLabel:"ساعات العمل",hoursValue:"أضف أيام وساعات العمل",phoneLabel:"الهاتف",phoneValue:"أضف رقم الهاتف",formEyebrow:"طلب موعد",formTitle:"لنبدأ بالتعارف.",formText:"املأ المعلومات الأساسية وسنعاود الاتصال بك.",nameLabel:"الاسم الكامل",namePlaceholder:"الاسم واللقب",mobileLabel:"رقم الهاتف",phonePlaceholder:"05 XX XX XX XX",serviceLabel:"الخدمة المطلوبة",selectPlaceholder:"اختر الخدمة",optionGeneral:"طب الأسنان العام",optionCosmetic:"تجميل الأسنان",optionOrtho:"تقويم الأسنان",optionImplants:"الترميم والزراعة",optionChildren:"طب أسنان الأطفال",optionUrgent:"حالة مستعجلة",optionOther:"استفسار آخر",dateLabel:"التاريخ المفضّل (اختياري)",submitBooking:"إرسال طلب الموعد",formNote:"لن يتم حفظ بياناتك على هذا الموقع. سيتم تجهيز رسالة واتساب لإرسال طلبك إلى العيادة.",formMissingNumber:"أضف رقم واتساب العيادة في script.js لتفعيل إرسال الطلبات. لم يتم إرسال أي بيانات.",formSuccess:"تم تجهيز رسالة الحجز. أكمل الإرسال في واتساب.",formError:"يرجى إدخال الاسم ورقم الهاتف واختيار الخدمة.",floatingContact:"احجز الآن",footerTag:"ابتسامة صحية. ثقة تدوم.",backTop:"العودة إلى الأعلى",rights:"جميع الحقوق محفوظة.",footerNote:"محتوى الموقع تعريفي ولا يغني عن الاستشارة الطبية."
  },
  fr: {
    announcement:"Des soins précis. Une expérience plus sereine. Un sourire en confiance.",announcementLink:"Prendre rendez-vous",brandSub:"DENTAL STUDIO",navServices:"Nos soins",navApproach:"Notre approche",navTeam:"L’équipe",navFaq:"FAQ",navContact:"Contact",bookNow:"Prendre rendez-vous",
    heroEyebrow:"La dentisterie contemporaine, avec une approche humaine",heroTitle:"Votre sourire mérite<br><em>une attention rare.</em>",heroText:"Une expérience de soin qui associe précision clinique, confort et attention aux détails — de votre première visite jusqu’à votre nouveau sourire.",heroCta:"Commencer avec nous",exploreServices:"Découvrir nos soins",heroProofStrong:"L’écoute avant tout",heroProofSmall:"Un plan de soin clair, pensé pour vous.",heroImageNote:"Un lieu pensé pour votre confort",floatingTitle:"Des soins centrés sur vous",floatingText:"Chaque sourire a son histoire.",heroIndex:"Le soin commence ici",heroBottomLeft:"Soins généraux · Esthétique · Prévention",scroll:"Défiler pour découvrir",
    trust1:"L’écoute avant le soin",trust2:"Un plan clair et transparent",trust3:"Votre confort compte",trust4:"Un suivi attentif aux détails",
    servicesEyebrow:"Une prise en charge complète",servicesTitle:"Tout ce dont<br><em>votre sourire a besoin.</em>",servicesIntro:"Du contrôle régulier aux traitements avancés, nous vous aidons à choisir la solution adaptée à votre santé bucco-dentaire et à vos objectifs.",discussTreatment:"Parlons de vos besoins",service1Title:"Dentisterie générale & prévention",service1Text:"Bilans réguliers, détartrage et soins pour préserver la santé de vos dents durablement.",service2Title:"Esthétique du sourire",service2Text:"Des solutions réfléchies pour améliorer l’harmonie et l’apparence naturelle de votre sourire.",service3Title:"Orthodontie",service3Text:"Évaluation et options pour corriger l’alignement des dents et améliorer l’occlusion.",service4Title:"Restauration & implants",service4Text:"Retrouver fonction et esthétique grâce à des options définies après une évaluation clinique.",service5Title:"Dentisterie pédiatrique",service5Text:"Des visites bienveillantes et des conseils préventifs pour créer de bonnes habitudes dès l’enfance.",service6Title:"Soins urgents",service6Text:"Une première orientation pour les situations nécessitant une évaluation rapide, selon les disponibilités.",learnMore:"En savoir plus",
    approachCaption:"L’écoute est le début de tout bon plan de soin",approachEyebrow:"Bien plus qu’un traitement",approachTitle:"Nous croyons que le meilleur<br>des soins commence par <em>la confiance.</em>",approachText:"Nous expliquons les options simplement, prenons le temps d’écouter vos préoccupations et construisons avec vous un plan adapté. Pas de zones d’ombre ni de décisions précipitées — des soins clairs et respectueux.",point1Title:"Une communication claire",point1Text:"Vous comprenez chaque étape et sa raison avant de commencer.",point2Title:"Un plan adapté à vos besoins",point2Text:"Votre situation, vos priorités et les options disponibles sont prises en compte.",point3Title:"Une attention continue",point3Text:"Nous restons à vos côtés et répondons à vos questions à chaque étape.",meetUs:"Mieux nous connaître",
    teamEyebrow:"Le soin commence avec l’équipe",teamTitle:"Une expertise professionnelle,<br><em>une présence humaine.</em>",teamText:"La compétence clinique et la qualité de la relation sont au cœur de chaque visite. Découvrez le praticien ou l’équipe qui prendra soin de votre sourire.",askTeam:"En savoir plus sur l’équipe",teamCardTitle:"Une attention personnelle à chaque visite",teamCardText:"Une équipe qui écoute, explique et accompagne.",
    journeyEyebrow:"Des étapes simples et claires",journeyTitle:"Votre parcours, <em>en toute sérénité.</em>",journeyText:"Nous vous accompagnons de votre premier contact jusqu’au suivi après les soins.",step1Title:"Prenez contact",step1Text:"Choisissez votre moyen de contact et le moment qui vous convient.",step2Title:"Consultation & bilan",step2Text:"Nous vous écoutons et évaluons vos besoins avant de proposer un soin.",step3Title:"Un plan clair",step3Text:"Nous expliquons les options, les étapes et les coûts estimés en toute clarté.",step4Title:"Soins & suivi",step4Text:"Nous réalisons les soins convenus et assurons le suivi avec vous.",quote:"Un sourire confiant ne commence pas devant le miroir, mais par le sentiment d’être entre de bonnes mains.",
    faqEyebrow:"Avant votre visite",faqTitle:"Quelques questions<br><em>que vous vous posez.</em>",faqText:"Vous ne trouvez pas votre réponse ? Contactez-nous, notre équipe sera ravie de vous aider.",contactUs:"Contacter le cabinet",faq1Q:"Comment prendre rendez-vous ?",faq1A:"Envoyez une demande via le formulaire de cette page. WhatsApp s’ouvrira avec un message prérempli lorsque le numéro du cabinet sera ajouté aux paramètres du site.",faq2Q:"Un examen est-il nécessaire avant de choisir un soin ?",faq2A:"Oui. Le choix d’un soin adapté commence par un examen et une évaluation clinique. Les informations du site sont générales et ne constituent pas un diagnostic.",faq3Q:"Puis-je connaître le tarif avant ma visite ?",faq3A:"Le coût dépend de votre situation et du plan de traitement. L’équipe pourra préciser les honoraires après avoir compris votre besoin et réalisé l’évaluation nécessaire.",faq4Q:"Recevez-vous les enfants ?",faq4A:"Oui, vous pouvez demander un rendez-vous pour un enfant. Indiquez son âge et le motif de la visite lors de votre prise de contact.",faq5Q:"Que faire en cas de douleur dentaire soudaine ?",faq5A:"Appelez le cabinet pour demander conseil et connaître les disponibilités. En cas de gonflement important ou de difficulté à respirer ou à avaler, contactez immédiatement les services d’urgence.",
    contactEyebrow:"Votre première étape commence ici",contactTitle:"Prêt à prendre soin<br><em>de votre sourire ?</em>",contactText:"Envoyez votre demande de rendez-vous. Nous vous recontacterons pour confirmer un créneau et répondre à vos questions.",addressLabel:"Adresse",addressValue:"Ajoutez l’adresse du cabinet, Algérie",hoursLabel:"Horaires",hoursValue:"Ajoutez les jours et heures d’ouverture",phoneLabel:"Téléphone",phoneValue:"Ajoutez le numéro de téléphone",formEyebrow:"Demande de rendez-vous",formTitle:"Faisons connaissance.",formText:"Renseignez les informations essentielles et nous vous recontacterons.",nameLabel:"Nom complet",namePlaceholder:"Nom et prénom",mobileLabel:"Téléphone",phonePlaceholder:"05 XX XX XX XX",serviceLabel:"Soin souhaité",selectPlaceholder:"Choisir un soin",optionGeneral:"Dentisterie générale",optionCosmetic:"Esthétique dentaire",optionOrtho:"Orthodontie",optionImplants:"Restauration & implants",optionChildren:"Dentisterie pédiatrique",optionUrgent:"Urgence dentaire",optionOther:"Autre demande",dateLabel:"Date souhaitée (facultatif)",submitBooking:"Envoyer la demande",formNote:"Vos données ne sont pas enregistrées sur ce site. Un message WhatsApp sera préparé pour le cabinet.",formMissingNumber:"Ajoutez le numéro WhatsApp du cabinet dans script.js pour activer les demandes. Aucune donnée n’a été envoyée.",formSuccess:"Votre demande est prête. Terminez l’envoi dans WhatsApp.",formError:"Veuillez saisir votre nom, votre téléphone et choisir un soin.",floatingContact:"Prendre RDV",footerTag:"Un sourire sain. Une confiance durable.",backTop:"Retour en haut",rights:"Tous droits réservés.",footerNote:"Ce site est informatif et ne remplace pas une consultation médicale."
  },
  en: {
    announcement:"Thoughtful care. A calmer experience. A smile with confidence.",announcementLink:"Book a visit",brandSub:"DENTAL STUDIO",navServices:"Treatments",navApproach:"Our approach",navTeam:"Our team",navFaq:"FAQs",navContact:"Contact",bookNow:"Book an appointment",
    heroEyebrow:"Modern dentistry, with a human touch",heroTitle:"Your smile deserves<br><em>exceptional care.</em>",heroText:"A dental experience shaped around clinical precision, comfort and thoughtful details — from your first visit to the smile you feel good about.",heroCta:"Start your journey",exploreServices:"Explore our treatments",heroProofStrong:"Care begins with listening",heroProofSmall:"A clear treatment plan, shaped around you.",heroImageNote:"A space designed for your comfort",floatingTitle:"Care centered around you",floatingText:"Every smile has a story.",heroIndex:"Care starts here",heroBottomLeft:"General · Cosmetic · Preventive dentistry",scroll:"Scroll to explore",
    trust1:"Listening before treatment",trust2:"Clear, transparent planning",trust3:"Your comfort matters",trust4:"Thoughtful follow-up",
    servicesEyebrow:"Complete dental care",servicesTitle:"Everything your<br><em>smile needs, in one place.</em>",servicesIntro:"From routine check-ups to advanced treatments, we help you explore the right options for your oral health and personal goals.",discussTreatment:"Talk through your needs",service1Title:"General & preventive dentistry",service1Text:"Regular examinations, professional cleaning and care to help protect your long-term oral health.",service2Title:"Cosmetic dentistry",service2Text:"Considered options to improve the harmony and natural appearance of your smile.",service3Title:"Orthodontics",service3Text:"Assessment and options to improve tooth alignment, bite and oral function.",service4Title:"Restorative care & implants",service4Text:"Restore function and appearance with options guided by a careful clinical assessment.",service5Title:"Children’s dentistry",service5Text:"Gentle visits and preventive guidance that help children build positive dental habits.",service6Title:"Urgent dental care",service6Text:"Initial guidance for concerns that need prompt assessment, subject to appointment availability.",learnMore:"Explore treatment",
    approachCaption:"Listening is where every good care plan begins",approachEyebrow:"More than a treatment",approachTitle:"We believe great care<br>begins with <em>trust.</em>",approachText:"We explain your options in plain language, listen to your concerns and build a plan with you. No uncertainty or rushed decisions — just clear, considerate care.",point1Title:"Clear communication",point1Text:"Understand what will happen and why before treatment begins.",point2Title:"A plan shaped around you",point2Text:"Your needs, priorities and available options guide the plan.",point3Title:"Ongoing attention",point3Text:"We stay in touch and answer your questions at every stage.",meetUs:"Get to know us",
    teamEyebrow:"Care starts with the team",teamTitle:"Professional expertise,<br><em>a human touch.</em>",teamText:"Clinical skill and human connection are at the heart of every visit. Meet the practitioner or team who will care for your smile.",askTeam:"Ask about our team",teamCardTitle:"Personal attention at every visit",teamCardText:"A team that listens, explains and cares.",
    journeyEyebrow:"Simple, clear steps",journeyTitle:"Your journey, <em>made comfortable.</em>",journeyText:"We are with you from your first enquiry through to follow-up after treatment.",step1Title:"Get in touch",step1Text:"Choose how to contact us and a time that works for you.",step2Title:"Consultation & exam",step2Text:"We listen and assess your needs before recommending treatment.",step3Title:"A clear plan",step3Text:"We explain the options, steps and expected costs clearly.",step4Title:"Care & follow-up",step4Text:"We carry out the agreed treatment and support you afterwards.",quote:"A confident smile does not begin in the mirror. It begins with feeling you are in safe hands.",
    faqEyebrow:"Before your visit",faqTitle:"A few questions<br><em>you may have.</em>",faqText:"Can’t find the answer you need? Contact us — our team will be happy to help.",contactUs:"Contact the clinic",faq1Q:"How can I book an appointment?",faq1A:"Send a request through the booking form on this page. WhatsApp will open with a prepared message once the clinic’s number is added to the site settings.",faq2Q:"Do I need an examination before choosing treatment?",faq2A:"Yes. Choosing appropriate care starts with an examination and assessment. Website information is general and is not a medical diagnosis.",faq3Q:"Can I find out the cost before my visit?",faq3A:"Costs depend on your needs and treatment plan. The team can explain fees after understanding your concern and completing any necessary assessment.",faq4Q:"Do you see children?",faq4A:"Yes, you can request an appointment for a child. Please mention their age and the reason for the visit when you contact us.",faq5Q:"What should I do if I have sudden tooth pain?",faq5A:"Call the clinic for guidance and appointment availability. For significant swelling or difficulty breathing or swallowing, seek emergency medical help immediately.",
    contactEyebrow:"Your first step starts here",contactTitle:"Ready to care<br><em>for your smile?</em>",contactText:"Send an appointment request and we’ll contact you to confirm a suitable time and answer your questions.",addressLabel:"Address",addressValue:"Add the clinic address, Algeria",hoursLabel:"Opening hours",hoursValue:"Add opening days and hours",phoneLabel:"Phone",phoneValue:"Add phone number",formEyebrow:"Appointment request",formTitle:"Let’s get acquainted.",formText:"Share a few details and our team will get back to you.",nameLabel:"Full name",namePlaceholder:"Your full name",mobileLabel:"Phone number",phonePlaceholder:"+213 …",serviceLabel:"Treatment of interest",selectPlaceholder:"Choose a service",optionGeneral:"General dentistry",optionCosmetic:"Cosmetic dentistry",optionOrtho:"Orthodontics",optionImplants:"Restorative care & implants",optionChildren:"Children’s dentistry",optionUrgent:"Urgent dental concern",optionOther:"Other enquiry",dateLabel:"Preferred date (optional)",submitBooking:"Send appointment request",formNote:"Your details are not stored on this website. A WhatsApp message will be prepared for the clinic.",formMissingNumber:"Add the clinic’s WhatsApp number in script.js to enable requests. No information has been sent.",formSuccess:"Your request is ready. Complete the message in WhatsApp.",formError:"Please enter your name and phone number, then choose a service.",floatingContact:"Book now",footerTag:"A healthy smile. Confidence that lasts.",backTop:"Back to top",rights:"All rights reserved.",footerNote:"This website is informational and does not replace medical advice."
  }
};

let currentLanguage = localStorage.getItem("nova-language") || "ar";
const langButtons = document.querySelectorAll(".lang-btn");

function applyLanguage(language) {
  const dictionary = translations[language] || translations.ar;
  currentLanguage = language;
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = dictionary[element.dataset.i18n];
    if (typeof value === "string") element.innerHTML = value;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const value = dictionary[element.dataset.i18nPlaceholder];
    if (typeof value === "string") element.placeholder = value;
  });
  langButtons.forEach((button) => {
    const active = button.dataset.lang === language;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  document.title = language === "ar" ? "NOVA Dental Studio | عناية تبدأ بالثقة" : language === "fr" ? "NOVA Dental Studio | Des soins en confiance" : "NOVA Dental Studio | Care begins with trust";
  const feedback = document.getElementById("form-feedback");
  if (feedback) feedback.textContent = "";
  localStorage.setItem("nova-language", language);
}

langButtons.forEach((button) => button.addEventListener("click", () => applyLanguage(button.dataset.lang)));

const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");
menuToggle.addEventListener("click", () => {
  const expanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!expanded));
  mobileMenu.hidden = expanded;
  menuToggle.setAttribute("aria-label", expanded ? "Open menu" : "Close menu");
});
mobileMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  mobileMenu.hidden = true;
  menuToggle.setAttribute("aria-expanded", "false");
}));

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const bookingForm = document.getElementById("booking-form");
bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(bookingForm);
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const service = bookingForm.querySelector("#treatment");
  const date = String(formData.get("date") || "").trim();
  const feedback = document.getElementById("form-feedback");
  const dictionary = translations[currentLanguage];
  if (!name || !phone || !service.value) {
    feedback.textContent = dictionary.formError;
    return;
  }
  if (!/^\d{8,15}$/.test(CLINIC_CONFIG.whatsapp)) {
    feedback.textContent = dictionary.formMissingNumber;
    return;
  }
  const selectedService = service.options[service.selectedIndex].text;
  const labels = {
    ar: `طلب موعد جديد — ${CLINIC_CONFIG.clinicName}\nالاسم: ${name}\nالهاتف: ${phone}\nالخدمة: ${selectedService}\nالتاريخ المفضل: ${date || "غير محدد"}`,
    fr: `Demande de rendez-vous — ${CLINIC_CONFIG.clinicName}\nNom : ${name}\nTéléphone : ${phone}\nSoin : ${selectedService}\nDate souhaitée : ${date || "Non précisée"}`,
    en: `New appointment request — ${CLINIC_CONFIG.clinicName}\nName: ${name}\nPhone: ${phone}\nService: ${selectedService}\nPreferred date: ${date || "Not specified"}`
  };
  const url = `https://wa.me/${CLINIC_CONFIG.whatsapp}?text=${encodeURIComponent(labels[currentLanguage])}`;
  feedback.textContent = dictionary.formSuccess;
  window.open(url, "_blank", "noopener,noreferrer");
});

document.getElementById("year").textContent = new Date().getFullYear();
applyLanguage(currentLanguage);
