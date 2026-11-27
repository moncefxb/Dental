/* NOVA Dental admin layout — essential clinic features with a refined, responsive workspace. */
(() => {
  const $ = (id) => document.getElementById(id);
  const dashboard = $('dashboardSection');
  if (!dashboard) return;

  const css = `
    :root{--nova-ink:#182f35;--nova-muted:#718187;--nova-line:#e5eceb;--nova-bg:#f5f8f7;--nova-teal:#176d70;--nova-teal-dark:#124f54;--nova-mint:#e7f2ef;--nova-gold:#c5a56a;--nova-card:#fff}
    body{background:var(--nova-bg);color:var(--nova-ink);font-family:"Noto Sans Arabic","Segoe UI",system-ui,sans-serif}
    .topbar{background:rgba(255,255,255,.94);border-bottom:1px solid var(--nova-line);box-shadow:0 3px 18px rgba(20,55,58,.035)}
    .topbar-inner{max-width:1600px;min-height:76px;padding:12px clamp(16px,3vw,42px)}
    .brand{font-size:21px;letter-spacing:.025em;color:var(--nova-ink)}.brand span{color:var(--nova-teal)}
    .subtitle{color:var(--nova-muted);font-size:11px}
    main{max-width:1600px;margin:0 auto;padding:24px clamp(12px,2.8vw,40px) 50px}
    #dashboardSection{min-width:0}
    .nova-shell{display:grid;grid-template-columns:248px minmax(0,1fr);gap:24px;align-items:start;direction:rtl}
    .nova-sidebar{position:sticky;top:96px;min-height:calc(100vh - 120px);padding:20px 14px;background:linear-gradient(165deg,#174e52,#123d43);border-radius:22px;color:#eff8f6;box-shadow:0 18px 42px rgba(17,65,69,.14)}
    .nova-side-brand{padding:5px 12px 22px;border-bottom:1px solid rgba(255,255,255,.13);margin-bottom:18px}
    .nova-side-brand strong{display:block;font-size:20px;letter-spacing:.06em}.nova-side-brand strong span{color:#d6bd8b}
    .nova-side-brand small{display:block;margin-top:5px;color:#b7d0ce;font-size:9px;letter-spacing:.16em;direction:ltr;text-align:right}
    .nova-nav-label{padding:8px 12px;color:#9dbfbc;font-size:10px;font-weight:800;letter-spacing:.08em}
    .nova-nav{display:grid;gap:5px}
    .nova-nav button{width:100%;display:flex;align-items:center;gap:12px;border:0;border-radius:12px;background:transparent;color:#d8e9e7;text-align:right;padding:12px 13px;font:600 13px inherit;cursor:pointer;transition:background .18s,color .18s,transform .18s}
    .nova-nav button:hover{background:rgba(255,255,255,.09);color:#fff;transform:translateX(-2px)}
    .nova-nav button.active{background:#f4f8f5;color:#174f53;box-shadow:0 7px 18px rgba(0,0,0,.09)}
    .nova-nav-icon{width:27px;height:27px;display:grid;place-items:center;border-radius:9px;background:rgba(255,255,255,.1);font-size:14px;flex:0 0 27px}
    .nova-nav button.active .nova-nav-icon{background:var(--nova-mint);color:var(--nova-teal)}
    .nova-sidebar-foot{position:absolute;inset:auto 22px 20px;color:#a8c6c3;font-size:10px;line-height:1.8}
    .nova-workspace{min-width:0}
    .nova-toolbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:0 0 22px;padding:4px 2px 20px;border-bottom:1px solid var(--nova-line)}
    .nova-toolbar h1{margin:0;color:var(--nova-ink);font-size:clamp(23px,2.5vw,31px);font-weight:800;letter-spacing:-.04em}
    .nova-toolbar p{margin:6px 0 0;color:var(--nova-muted);font-size:12px}
    .nova-toolbar .admin-eyebrow{display:block;color:#9b8253;font-size:9px;font-weight:800;letter-spacing:.16em;margin-bottom:7px;direction:ltr;text-align:right}
    .nova-toolbar-actions{display:flex;gap:8px;align-items:center}
    .nova-toolbar-actions .btn{min-height:41px;border-radius:11px;padding-inline:15px}
    .btn{background:var(--nova-teal);border-radius:11px;box-shadow:none;transition:background .18s,transform .18s,box-shadow .18s}
    .btn:hover{background:var(--nova-teal-dark);transform:translateY(-1px);box-shadow:0 7px 16px rgba(23,109,112,.14)}
    .btn-light{background:#edf4f2;color:#28565a}.btn-light:hover{background:#e1eeeb;color:#174f53}
    .btn-green{background:#278064}.btn-red{background:#b75d55}
    .nova-overview{display:grid;gap:18px}
    .nova-welcome{position:relative;overflow:hidden;display:flex;justify-content:space-between;align-items:center;gap:20px;padding:25px 28px;border-radius:20px;background:linear-gradient(112deg,#174e52,#216f70);color:#fff;box-shadow:0 14px 30px rgba(23,91,94,.13)}
    .nova-welcome:after{content:"";position:absolute;width:250px;height:250px;border:1px solid rgba(255,255,255,.11);border-radius:50%;left:-85px;top:-150px;box-shadow:0 0 0 26px rgba(255,255,255,.025),0 0 0 54px rgba(255,255,255,.02)}
    .nova-welcome small{display:block;color:#c2dbd7;font-size:10px;letter-spacing:.12em;direction:ltr;text-align:right}
    .nova-welcome h2{margin:8px 0 5px;font-size:23px;color:#fff}.nova-welcome p{margin:0;color:#d2e4e1;font-size:12px}
    .nova-welcome-date{z-index:1;white-space:nowrap;padding:10px 13px;border:1px solid rgba(255,255,255,.2);border-radius:12px;color:#e5efed;font-size:11px}
    .stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:13px;margin:0}
    .stat{position:relative;overflow:hidden;padding:20px 19px;background:var(--nova-card);border:1px solid var(--nova-line);border-radius:17px;box-shadow:0 7px 22px rgba(21,57,60,.035)}
    .stat:after{content:"";position:absolute;left:-23px;bottom:-35px;width:95px;height:95px;border:1px solid #e8f0ed;border-radius:50%}
    .stat strong{display:block;margin-bottom:7px;color:var(--nova-ink);font-size:30px;font-weight:800;line-height:1.2}
    .stat span{color:var(--nova-muted);font-size:11px}
    .stat.today,.stat.pending,.stat.confirmed,.stat.unscheduled{border-top:1px solid var(--nova-line);border-inline-start:3px solid var(--nova-teal)}
    .stat.pending{border-inline-start-color:#c69a50}.stat.confirmed{border-inline-start-color:#39866c}.stat.unscheduled{border-inline-start-color:#8b9ca0}
    .nova-overview-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:15px}
    .nova-card{min-width:0;padding:21px;background:#fff;border:1px solid var(--nova-line);border-radius:17px;box-shadow:0 7px 22px rgba(21,57,60,.03)}
    .nova-card-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:15px}
    .nova-card h2{margin:0;font-size:15px;color:var(--nova-ink)}
    .nova-card-head small{color:var(--nova-muted);font-size:10px}
    .nova-shortcuts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
    .nova-shortcut{display:flex;align-items:center;gap:11px;padding:13px;border:1px solid var(--nova-line);border-radius:13px;background:#fbfdfc;color:var(--nova-ink);text-align:right;font:600 12px inherit;cursor:pointer;transition:border-color .18s,background .18s,transform .18s}
    .nova-shortcut:hover{border-color:#a9cbc5;background:#f2f8f6;transform:translateY(-1px)}
    .nova-shortcut i{width:34px;height:34px;display:grid;place-items:center;border-radius:10px;background:var(--nova-mint);color:var(--nova-teal);font-style:normal;font-size:15px}
    .nova-info-list{display:grid;gap:0}.nova-info-row{display:flex;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid #edf1ef;font-size:12px}.nova-info-row:last-child{border-bottom:0}.nova-info-row span{color:var(--nova-muted)}.nova-info-row strong{font-weight:700;color:var(--nova-ink)}
    .section-panel,.manual-form,.appointment,.record-card{background:#fff;border:1px solid var(--nova-line);border-radius:17px;box-shadow:0 7px 22px rgba(21,57,60,.03)}
    .section-panel{padding:21px;margin-top:0;margin-bottom:15px}.manual-form{padding:21px;margin:0 0 17px}.appointment{padding:19px}.patient-row{border:1px solid var(--nova-line);border-radius:13px;background:#fff}.patient-detail,.schedule-box,.notes,.report-stat{background:#f3f8f6}
    input,select,textarea{border-color:#dce7e4;background:#fff;border-radius:11px;min-height:45px}input:focus,select:focus,textarea:focus{border-color:#5c9b91;box-shadow:0 0 0 3px rgba(42,125,119,.12)}
    .views{padding:5px;border:1px solid var(--nova-line);border-radius:13px;background:#f7faf9;width:max-content;max-width:100%}.view-btn{border:0;border-radius:9px;background:transparent;padding:9px 14px;color:var(--nova-muted)}.view-btn.active{background:var(--nova-teal);color:#fff}
    .filters{gap:10px}.date-tools{max-width:270px}.view-heading{margin-top:19px}
    .status{border-radius:8px}.empty{border-color:#dbe7e3;background:#fff;border-radius:14px}
    .footer-note{padding:18px 0;color:#9aa8a7}
    #insightsPanel,.insights-panel{display:none!important}
    .nova-mobile-caption{display:none}
    @media(max-width:1100px){.nova-shell{grid-template-columns:210px minmax(0,1fr);gap:16px}.stats{grid-template-columns:repeat(2,minmax(0,1fr))}.nova-overview-grid{grid-template-columns:1fr}}
    @media(max-width:760px){main{padding:15px 12px 35px}.nova-shell{grid-template-columns:1fr;gap:13px}.nova-sidebar{position:static;min-height:0;padding:10px;border-radius:15px}.nova-side-brand,.nova-nav-label,.nova-sidebar-foot{display:none}.nova-nav{display:flex;overflow-x:auto;gap:5px;scrollbar-width:thin}.nova-nav button{flex:0 0 auto;width:auto;white-space:nowrap;padding:10px 12px}.nova-nav button:hover{transform:none}.nova-nav-icon{width:24px;height:24px;flex-basis:24px}.nova-toolbar{align-items:flex-start;margin-bottom:15px;padding-bottom:15px}.nova-welcome{padding:20px}.nova-toolbar-actions{flex-shrink:0}}
    @media(max-width:520px){.topbar-inner{min-height:65px}.brand{font-size:18px}.nova-toolbar{display:block}.nova-toolbar-actions{margin-top:13px}.nova-toolbar-actions .btn{flex:1}.nova-welcome{display:block}.nova-welcome h2{font-size:20px}.nova-welcome-date{display:inline-block;margin-top:14px}.stats{gap:9px}.stat{padding:15px}.stat strong{font-size:25px}.nova-shortcuts{grid-template-columns:1fr}.section-panel,.manual-form{padding:15px}.filters{grid-template-columns:1fr 1fr}.filters input{grid-column:1/-1}.details{grid-template-columns:repeat(2,minmax(0,1fr))}}
  `;
  const style = document.createElement('style');
  style.id = 'nova-admin-design-system';
  style.textContent = css;
  document.head.append(style);

  const oldToolbar = dashboard.querySelector('.nova-admin-toolbar');
  const oldNav = dashboard.querySelector('.views[role="tablist"]');
  const appointmentSection = $('appointmentsSection');
  const stats = appointmentSection?.querySelector('.stats');
  const insights = appointmentSection?.querySelector('.insights-panel');
  if (oldNav) oldNav.remove();
  if (insights) insights.remove();

  const shell = document.createElement('div'); shell.className = 'nova-shell';
  const sidebar = document.createElement('aside'); sidebar.className = 'nova-sidebar';
  sidebar.innerHTML = `
    <div class="nova-side-brand"><strong>NOVA <span>Dental</span></strong><small>STUDIO MANAGEMENT</small></div>
    <div class="nova-nav-label">القائمة الرئيسية</div>
    <nav class="nova-nav" aria-label="التنقل الرئيسي"></nav>
    <div class="nova-sidebar-foot">NOVA Dental Studio<br>إدارة العيادة اليومية</div>`;
  const nav = sidebar.querySelector('.nova-nav');
  const workspace = document.createElement('div'); workspace.className = 'nova-workspace';
  const overview = document.createElement('section'); overview.className = 'nova-overview'; overview.id = 'nova-overview';
  overview.innerHTML = `
    <div class="nova-welcome"><div><small>NOVA DENTAL STUDIO / OVERVIEW</small><h2>مرحباً بك في لوحة العيادة</h2><p>نظرة سريعة على سير العمل اليومي وإدارة المرضى والمواعيد.</p></div><div class="nova-welcome-date" id="nova-today-date"></div></div>
    <div class="nova-overview-grid">
      <div class="nova-card"><div class="nova-card-head"><h2>الوصول السريع</h2><small>المهام الأساسية</small></div><div class="nova-shortcuts">
        <button class="nova-shortcut" data-nova-go="appointmentsSection"><i>▦</i><span>إدارة المواعيد</span></button>
        <button class="nova-shortcut" data-nova-go="patientsSection"><i>♙</i><span>ملفات المرضى</span></button>
        <button class="nova-shortcut" data-nova-go="reportsSection"><i>▤</i><span>عرض التقارير</span></button>
        <button class="nova-shortcut" data-nova-go="setupSection"><i>⚙</i><span>إعداد العيادة</span></button>
      </div></div>
      <div class="nova-card"><div class="nova-card-head"><h2>ملخص العمل</h2><small>من بيانات النظام</small></div><div class="nova-info-list">
        <div class="nova-info-row"><span>حالات بانتظار التأكيد</span><strong id="nova-pending-summary">—</strong></div>
        <div class="nova-info-row"><span>حجوزات مؤكدة</span><strong id="nova-confirmed-summary">—</strong></div>
        <div class="nova-info-row"><span>حجوزات دون موعد</span><strong id="nova-unscheduled-summary">—</strong></div>
      </div></div>
    </div>`;

  const header = document.createElement('div'); header.className = 'nova-toolbar';
  const heading = document.createElement('div'); heading.innerHTML = `<span class="admin-eyebrow">NOVA DENTAL STUDIO / WORKSPACE</span><h1 id="nova-page-title">نظرة عامة</h1><p id="nova-page-description">ملخص العيادة والمهام اليومية.</p>`;
  const actions = document.createElement('div'); actions.className = 'nova-toolbar-actions';
  const refresh = $('refreshBtn');
  if (refresh) { refresh.textContent = 'تحديث البيانات'; refresh.classList.add('btn-light'); actions.append(refresh); }
  header.append(heading, actions);

  const navItems = [
    ['overview','⌂','نظرة عامة','ملخص العيادة والمهام اليومية.'],
    ['appointmentsSection','▦','المواعيد','تنظيم الحجوزات ومتابعة حالاتها.'],
    ['patientsSection','♙','المرضى','إدارة ملفات المرضى وسجل الزيارات.'],
    ['reportsSection','▤','التقارير','ملخص النشاط خلال فترة محددة.'],
    ['setupSection','⚙','الإعدادات','بيانات العيادة والأطباء وساعات العمل.']
  ];
  const buttons = new Map();
  navItems.forEach(([id,icon,label]) => {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.novaPage = id;
    b.innerHTML = `<span class="nova-nav-icon" aria-hidden="true">${icon}</span><span>${label}</span>`;
    b.addEventListener('click', () => showPage(id)); nav.append(b); buttons.set(id,b);
  });

  // Put the original functional sections into the new visual workspace.
  const content = document.createElement('div'); content.className = 'nova-page-content';
  if (stats) overview.insertBefore(stats, overview.querySelector('.nova-overview-grid'));
  if (appointmentSection) appointmentSection.insertBefore(overview, appointmentSection.firstChild);
  if (oldToolbar) oldToolbar.remove();
  const sections = ['appointmentsSection','patientsSection','reportsSection','setupSection'].map($).filter(Boolean);
  sections.forEach(section => { content.append(section); });
  // Overview is the landing page; the appointment section remains the source of the original KPI elements.
  content.prepend(overview);
  workspace.append(header, content);
  shell.append(sidebar, workspace);
  dashboard.replaceChildren(shell);

  const titles = Object.fromEntries(navItems.map(([id,,label,description]) => [id,{label,description}]));
  const originalShowSection = window.showSection;
  function showPage(id) {
    overview.hidden = id !== 'overview';
    sections.forEach(section => { section.hidden = section.id !== id; });
    buttons.forEach((button,key) => button.classList.toggle('active', key === id));
    const meta = titles[id] || titles.overview;
    $('nova-page-title').textContent = meta.label;
    $('nova-page-description').textContent = meta.description;
    if (id !== 'overview' && typeof originalShowSection === 'function') originalShowSection(id);
    if (id === 'overview') syncSummary();
    if (id === 'appointmentsSection') $('selectedDate')?.dispatchEvent(new Event('change'));
  }
  window.showSection = (id) => showPage(id);
  window.novaShowAdminPage = showPage;
  document.querySelectorAll('[data-nova-go]').forEach(button => button.addEventListener('click', () => showPage(button.dataset.novaGo)));

  function syncSummary() {
    $('nova-pending-summary').textContent = $('pendingCount')?.textContent || '0';
    $('nova-confirmed-summary').textContent = $('confirmedCount')?.textContent || '0';
    $('nova-unscheduled-summary').textContent = $('unscheduledCount')?.textContent || '0';
  }
  const date = new Intl.DateTimeFormat('ar-DZ',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date());
  $('nova-today-date').textContent = date;
  const observer = new MutationObserver(syncSummary);
  ['pendingCount','confirmedCount','unscheduledCount'].forEach(id => { const el = $(id); if (el) observer.observe(el,{childList:true,characterData:true,subtree:true}); });
  showPage('overview');
})();
