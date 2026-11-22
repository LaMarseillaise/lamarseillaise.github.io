# Andur Carr

This repository is the source for my personal site, [andurcarr.com](http://andurcarr.com).

## Implementation preference

Keep the site buildless: HTML, CSS, and plain JavaScript with native ES modules.
Use native Web Components where encapsulation helps. Do not add a framework or
runtime dependency for ordinary page interactions.

## Local preview

Serve the repository over HTTP (ES modules require it):

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

- `/calculator/`: native `<andur-calculator>` component, adapted from the original React project.
- `/latin/`: Latin reading drafts and user-authored word connections, saved only in the browser.

See each project's README for provenance, behavior, and checks. Publishing is
through the existing GitHub Pages repository; no separate hosting service is needed.
