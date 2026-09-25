/* Getex — News & Insights index: category filter + search.
 *
 * There are no articles at launch, so this does nothing visible yet. It is
 * written against `.article-card[data-category]` elements, so filtering and
 * search start working the moment cards are added to #article-grid.
 *
 * On the WordPress migration this is replaced by a server-side query.
 */
(function () {
  'use strict';

  var grid = document.getElementById('article-grid');
  var empty = document.getElementById('news-empty');
  var search = document.getElementById('news-search-input');
  var buttons = Array.prototype.slice.call(document.querySelectorAll('.news-filter'));
  if (!grid || !empty) return;

  var category = 'all';

  function cards() {
    return Array.prototype.slice.call(grid.querySelectorAll('.article-card'));
  }

  function apply() {
    var term = (search && search.value || '').trim().toLowerCase();
    var visible = 0;

    cards().forEach(function (card) {
      var inCategory = category === 'all' || card.dataset.category === category;
      var matches = !term || card.textContent.toLowerCase().indexOf(term) !== -1;
      var show = inCategory && matches;
      card.hidden = !show;
      if (show) visible++;
    });

    // The empty state doubles as the no-results state
    empty.hidden = visible > 0;
    grid.hidden = visible === 0;
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      category = btn.dataset.category || 'all';
      buttons.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      apply();
    });
    btn.setAttribute('aria-pressed', btn.classList.contains('is-active') ? 'true' : 'false');
  });

  if (search) search.addEventListener('input', apply);

  apply();
})();
