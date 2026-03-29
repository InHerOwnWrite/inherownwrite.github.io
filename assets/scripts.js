$(function () {
  $('[data-toggle="tooltip"]').tooltip();

  // Dark mode toggle
  var $toggle = $('#dark-mode-toggle');
  var $icon = $toggle.find('.dark-toggle-icon');

  function applyTheme(dark) {
    if (dark) {
      $('html').attr('data-theme', 'dark');
      $icon.text('☀');
    } else {
      $('html').removeAttr('data-theme');
      $icon.text('☽');
    }
  }

  // Restore saved preference
  var saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    applyTheme(true);
  } else if (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    applyTheme(true);
  }

  $toggle.on('click', function () {
    var isDark = $('html').attr('data-theme') === 'dark';
    applyTheme(!isDark);
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
  });
});
