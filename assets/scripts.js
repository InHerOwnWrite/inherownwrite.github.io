$(function () {
  $('[data-toggle="tooltip"]').tooltip();
});

// Dark mode toggle — plain JS, no jQuery dependency
(function () {
  var toggle = document.getElementById('dark-mode-toggle');
  if (!toggle) return;
  var icon = toggle.querySelector('.dark-toggle-icon');

  function applyTheme(dark) {
    if (dark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (icon) icon.textContent = '☀';
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (icon) icon.textContent = '☽';
    }
  }

  // Restore saved preference
  var saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    applyTheme(true);
  } else if (!saved && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    applyTheme(true);
  }

  toggle.addEventListener('click', function () {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    applyTheme(!isDark);
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
  });
})();
