const template = document.createElement('template');
template.innerHTML = `
<style>
:host{display:block;color:var(--ink,#16313d)}
article{border-top:1px solid var(--rule,#bfd6df);padding:2rem 0}
::slotted(*){margin:0 0 1rem}
::slotted([slot=meta]){font:400 .875rem/1.5 system-ui;color:var(--muted,#425f6b)}
::slotted([slot=heading]){font:500 clamp(1.75rem,3vw,2.5rem)/1.2 Georgia,serif;letter-spacing:-.025em}
::slotted([slot=description]){font:400 1.1rem/1.7 system-ui;max-width:44rem;color:var(--muted,#425f6b)}
::slotted([slot=link]){display:inline-block;padding:.6rem 0;font:600 1rem/1.5 system-ui;color:var(--accent,#14657b);text-underline-offset:.25em}
:host([featured]) article{border:0;padding:0}
</style><article><slot name="meta"></slot><slot name="heading"></slot><slot name="description"></slot><slot name="link"></slot></article>`;
export class MusingCard extends HTMLElement {
  constructor(){super();this.attachShadow({mode:'open'}).append(template.content.cloneNode(true));}
}
if (!customElements.get('musing-card')) customElements.define('musing-card',MusingCard);
