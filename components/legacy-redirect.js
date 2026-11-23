// Preserve bookmarks into project sections, as well as query parameters.
const destination = document.querySelector('a[data-destination]');
if (destination) {
  const target = new URL(destination.getAttribute('href'), location.origin);
  target.search = location.search;
  target.hash = location.hash;
  destination.href = target.href;
  location.replace(target.href);
}
