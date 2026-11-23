"""Refresh static collection pages and homepage excerpts. No runtime dependencies."""
import json
from datetime import date
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
catalog = json.loads((ROOT / 'content/catalog.json').read_text())
projects = catalog['projects']
articles = sorted(catalog['articles'], key=lambda item: item['date'], reverse=True)
e = escape

def date_label(value):
    day = date.fromisoformat(value)
    return f'{day.strftime("%B")} {day.day}, {day.year}'

def page(title, description, path, body, current):
    nav = ''.join(f'<a href="/{slug}/"'+(' aria-current="page"' if slug == current else '')+f'>{label}</a>' for slug, label in [('projects','Projects'),('musings','Musings')])
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(title)} · Andur Carr</title><meta name="description" content="{e(description)}"><meta name="theme-color" content="#eefaff">
<link rel="canonical" href="https://andurcarr.com{path}">
<link rel="stylesheet" href="/assets/stylesheets/normalize.css"><link rel="stylesheet" href="/assets/stylesheets/main.css"><link rel="stylesheet" href="/assets/stylesheets/collections.css">
<script type="module" src="/components/index.js"></script></head><body>
<a class="skip-link" href="#main">Skip to content</a><header class="site-header page-width"><a class="wordmark" href="/" aria-label="Andur Carr, home">AC<span>.</span></a><nav aria-label="Main navigation">{nav}<a href="/#about">About</a><a href="/#contact">Contact</a></nav></header>
<main id="main" class="page-width" tabindex="-1">{body}</main>
<footer class="site-footer page-width"><p>Andur Carr · Eugene, Oregon</p><a href="/">Back to home</a></footer></body></html>
'''

def project_card(item, heading='h3'):
    return f'''<project-card>
<img slot="preview" src="/assets/images/projects/{e(item['slug'])}.svg" alt="" width="600" height="300" loading="lazy">
<p slot="category">{e(item['category'])}</p><{heading} slot="heading">{e(item['title'])}</{heading}>
<p slot="description">{e(item['description'])}</p><p slot="meta">{e(item['meta'])}</p>
<a slot="link" href="/projects/{e(item['slug'])}/">{e(item['link'])}</a></project-card>'''

def musing_card(item, featured=False):
    return f'''<musing-card{' featured' if featured else ''}>
<p slot="meta"><time datetime="{item['date']}">{date_label(item['date'])}</time> · {e(item['category'])}</p>
<h{'3' if featured else '2'} slot="heading">{e(item['title'])}</h{'3' if featured else '2'}>
<p slot="description">{e(item['description'])}</p><a slot="link" href="/musings/{item['slug']}/">Read {e(item['title'])}</a></musing-card>'''

cards = '\n'.join(map(project_card, projects))
directory_cards = '\n'.join(project_card(item,'h2') for item in projects)
project_body = f'''<section class="collection-hero" aria-labelledby="title"><p class="eyebrow">The workshop</p><h1 id="title">Projects.</h1><p class="lead">Ideas to play with, take apart, and follow somewhere new.</p><p class="collection-note">Games, visual explanations, and small tools. Browser implementations are built or adapted with AI assistance; each project describes its origins and checks.</p></section><section aria-label="All projects" class="project-grid">{directory_cards}</section>'''
(ROOT / 'projects/index.html').write_text(page('Projects','Browser games, visual explanations, and small tools by Andur Carr.','/projects/',project_body,'projects'))
musings_dir = ROOT / 'musings'
musings_dir.mkdir(exist_ok=True)
musings_body = '''<section class="collection-hero" aria-labelledby="title"><p class="eyebrow">A notebook of questions</p><h1 id="title">Musings.</h1><p class="lead">On making things, understanding them, and wondering what comes next.</p><p class="collection-note">Short essays adapted from my conversations, with AI assistance in drafting and editing. These are reflections to develop, rather than final answers.</p></section><section class="musings-list" aria-label="Articles">'''+ '\n'.join(map(musing_card, articles))+'</section>'
(musings_dir / 'index.html').write_text(page('Musings','Essays on software, responsibility, curiosity, and understanding by Andur Carr.','/musings/',musings_body,'musings'))
for item in articles:
    body = (ROOT / 'content/articles' / (item['slug']+'.html')).read_text()
    other = next((a for a in articles if a != item), None)
    related = f'<p>Another musing</p><a href="/musings/{other["slug"]}/">{e(other["title"])}</a>' if other else ''
    article = f'''<article><header class="article-header"><p class="eyebrow"><a href="/musings/">Musings</a> / {e(item['category'])}</p><h1>{e(item['title'])}</h1><p class="article-meta">Andur Carr · <time datetime="{item['date']}">{date_label(item['date'])}</time></p><p class="lead">{e(item['description'])}</p></header><div class="article-body">{body}<aside class="editorial-note" aria-label="Editorial note"><p>{e(item['origin'])} Drafted and edited with AI assistance. Direct quotations preserve my words; the surrounding essay develops the discussion.</p></aside></div></article><nav class="article-nav" aria-label="More writing">{related}<p><a href="/musings/">All Musings</a></p></nav>'''
    directory = musings_dir / item['slug']; directory.mkdir(exist_ok=True)
    (directory / 'index.html').write_text(page(item['title'],item['description'],f'/musings/{item["slug"]}/',article,'musings'))

home = ROOT / 'index.html'
source = home.read_text()
sections = {
    'PROJECTS': f'''<section id="projects" class="projects page-width section-space" aria-labelledby="projects-title"><div class="collection-heading"><div><p class="eyebrow">Projects</p><h2 id="projects-title">Ideas you can explore.</h2></div><a href="/projects/">Browse all {len(projects)} projects</a></div><project-carousel aria-label="Selected projects">{cards}</project-carousel></section>''',
    'LATEST_MUSING': f'''<section id="musings" class="latest-musing page-width section-space" aria-labelledby="musings-title"><div class="section-heading"><p class="eyebrow">Latest writing</p><h2 id="musings-title">Musings.</h2><a href="/musings/">All Musings</a></div>{musing_card(articles[0],True)}</section>'''
}
for marker, content in sections.items():
    start, end = f'<!-- {marker}:START -->', f'<!-- {marker}:END -->'
    before, rest = source.split(start,1); _, after = rest.split(end,1)
    source = before + start + '\n' + content + '\n      ' + end + after
home.write_text(source)
print(f'Rendered {len(projects)} project cards, {len(articles)} articles, collection indexes, and homepage excerpts.')
