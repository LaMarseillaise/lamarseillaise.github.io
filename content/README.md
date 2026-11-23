# Editing Projects and Musings

`catalog.json` supplies project metadata and article order. Article dates use ISO calendar dates. The newest date is featured on the homepage; entries with the same date keep their catalog order. The first two essays were adapted with AI assistance from Andur's own remarks in conversations about reviewable code receipts and the difference between receiving information and understanding it. They omit unrelated personal material and do not publish conversation transcripts or private chat links.

To add a musing:

1. Add an HTML body to `articles/<slug>.html` and an entry in `catalog.json`.
2. Run `python3 scripts/render-content.py` from the repository root.
3. Review the generated article, Musings index, and homepage feature.
4. Run `python3 scripts/check-site.py` and preview in a browser before publishing.

The renderer uses only Python's standard library. It is an optional authoring helper: the checked-in HTML is ready for GitHub Pages with no runtime generation. It updates only the marked collection regions on the homepage, the Projects and Musings indexes, and cataloged article pages. Edit article bodies here, not in generated pages. Removing an article from the catalog does not delete its existing URL; removal of a published page should be deliberate.

Project metadata feeds both the carousel and full directory. Preview drawings are lightweight SVGs in `assets/images/projects/`; original project artwork stays with its project and keeps its existing attribution.
