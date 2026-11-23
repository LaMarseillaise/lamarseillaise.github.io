const template = document.createElement('template');
template.innerHTML = `
<style>
:host{display:block;min-width:0;height:100%;color:var(--ink,#16313d)}
article{height:100%;box-sizing:border-box;background:var(--card-background,#fff);border:1px solid var(--rule,#bfd6df);border-radius:12px;overflow:hidden;display:flex;flex-direction:column}
.preview{background:#16313d;aspect-ratio:2/1;overflow:hidden}
::slotted(img){display:block;width:100%;height:100%;object-fit:cover}
.copy{padding:1.5rem;display:flex;flex-direction:column;flex:1;gap:.85rem}
::slotted(*){margin:0}
::slotted([slot=category]){font:600 .8rem/1.5 system-ui;letter-spacing:.08em;text-transform:uppercase;color:var(--accent,#14657b)}
::slotted([slot=heading]){font:500 1.65rem/1.2 Georgia,serif}
::slotted([slot=description]){font:400 1rem/1.6 system-ui;color:var(--muted,#425f6b)}
.meta{margin-top:auto;padding-top:.5rem}
::slotted([slot=meta]){font:400 .875rem/1.6 system-ui;color:var(--muted,#425f6b)}
::slotted([slot=link]){display:block;padding:.7rem 0;font:600 1rem/1.5 system-ui;color:var(--accent,#14657b);text-underline-offset:.25em}
</style><article><div class="preview"><slot name="preview"></slot></div><div class="copy"><slot name="category"></slot><slot name="heading"></slot><slot name="description"></slot><div class="meta"><slot name="meta"></slot></div><slot name="link"></slot></div></article>`;

/** Presentation only. Content and links remain in the document for no-JS readers. */
export class ProjectCard extends HTMLElement {
  constructor() { super(); this.attachShadow({mode:'open'}).append(template.content.cloneNode(true)); }
}
if (!customElements.get('project-card')) customElements.define('project-card', ProjectCard);
