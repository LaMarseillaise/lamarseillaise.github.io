const artworks = [...document.querySelectorAll('.artwork')];
const filters = [...document.querySelectorAll('[data-filter]')];
const search = document.querySelector('#search');
const dialog = document.querySelector('#viewer');
const normalize = value => value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase();
let category = 'All', current = null, opener = null;

function applyFilters() {
  const terms = normalize(search.value).trim().split(/\s+/).filter(Boolean);
  for (const artwork of artworks) {
    artwork.hidden = (category !== 'All' && artwork.dataset.category !== category)
      || !terms.every(term => normalize(artwork.dataset.search).includes(term));
  }
  for (const button of filters) button.setAttribute('aria-pressed',String(button.dataset.filter === category));
  const count = artworks.filter(artwork => !artwork.hidden).length;
  document.querySelector('#result-count').textContent = `${count} of ${artworks.length} illustrations`;
  document.querySelector('#empty').hidden = count !== 0;
}
for (const button of filters) button.addEventListener('click', () => {category = button.dataset.filter; applyFilters();});
search.addEventListener('input', applyFilters);
document.querySelector('#reset').addEventListener('click', () => {category='All';search.value='';applyFilters();});

function display(artwork) {
  current = artwork;
  const link = artwork.querySelector('.art-link');
  const image = artwork.querySelector('img');
  document.querySelector('#viewer-title').textContent = link.dataset.title;
  document.querySelector('#viewer-category').textContent = artwork.querySelector('.category').textContent;
  document.querySelector('#viewer-credit').textContent = artwork.dataset.credit;
  document.querySelector('#large-image').src = image.src;
  document.querySelector('#large-image').alt = image.alt;
  document.querySelector('#original').href = link.href;
  const visible = artworks.filter(item => !item.hidden), index = visible.indexOf(artwork);
  document.querySelector('#previous').disabled = index === 0;
  document.querySelector('#next').disabled = index === visible.length-1;
}
for (const artwork of artworks) {
  artwork.querySelector('.art-link').addEventListener('click', event => {
    // Preserve open-in-new-tab gestures and the direct SVG fallback.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || typeof dialog.showModal !== 'function') return;
    event.preventDefault(); opener = event.currentTarget; display(artwork); dialog.showModal();
  });
}
function step(direction) {
  const visible = artworks.filter(item => !item.hidden), index = visible.indexOf(current);
  if (visible[index+direction]) display(visible[index+direction]);
}
document.querySelector('#previous').addEventListener('click', () => step(-1));
document.querySelector('#next').addEventListener('click', () => step(1));
document.querySelector('#close').addEventListener('click', () => dialog.close());
dialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {event.preventDefault();step(event.key === 'ArrowLeft' ? -1 : 1);}
});
dialog.addEventListener('close', () => opener?.focus());
document.querySelector('#filters').hidden = false;
applyFilters();
