/* NOVA admin settings: keep exactly two user-facing preferences. */
(() => {
  const $ = (id) => document.getElementById(id);
  const section = document.createElement('section');
  section.id = 'setupSection';
  section.hidden = true;
  section.className = 'section-panel nova-settings-panel';
  section.innerHTML = `
    <div class="section-title">
      <div><h2>الإعدادات</h2><p class="muted">خصص لغة واجهة الإدارة ومظهرها.</p></div>
    </div>
    <div class="nova-settings-grid">
      <label class="nova-setting-card" for="novaLanguageSelect">
        <span class="nova-setting-icon" aria-hidden="true">文</span>
        <span class="nova-setting-copy"><strong>لغة النظام</strong><small>اختر العربية أو الفرنسية أو الإنجليزية.</small></span>
        <select id="novaLanguageSelect" data-nova-language aria-label="لغة النظام">
          <option value="system">لغة النظام (افتراضي)</option>
          <option value="ar">العربية</option>
          <option value="fr">Français</option>
          <option value="en">English</option>
        </select>
      </label>
      <label class="nova-setting-card" for="novaThemeSelect">
        <span class="nova-setting-icon" aria-hidden="true">◐</span>
        <span class="nova-setting-copy"><strong>مظهر النظام</strong><small>اختر الوضع الفاتح أو الداكن أو حسب الجهاز.</small></span>
        <select id="novaThemeSelect" data-nova-theme aria-label="مظهر النظام">
          <option value="system">حسب إعداد الجهاز</option>
          <option value="light">فاتح</option>
          <option value="dark">داكن</option>
        </select>
      </label>
    </div>
    <p class="nova-settings-hint">يتم تطبيق التغييرات على كامل لوحة الإدارة وحفظها تلقائياً.</p>`;
  const reports = $('reportsSection');
  if (reports) reports.after(section);
  document.querySelectorAll('[data-nova-language]').forEach((control) => {
    control.addEventListener('change', () => {
      localStorage.setItem('nova-admin-language', control.value);
      window.NOVAAdminPreferences?.apply();
    });
  });
  document.querySelectorAll('[data-nova-theme]').forEach((control) => {
    control.addEventListener('change', () => {
      localStorage.setItem('nova-admin-theme', control.value);
      window.NOVAAdminPreferences?.apply();
    });
  });
  window.loadSetup = () => window.NOVAAdminPreferences?.apply();
})();
