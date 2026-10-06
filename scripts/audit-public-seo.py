"""Read-only live audit; reports observed markup without treating heuristics as errors."""
import concurrent.futures
import json
import sys
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path

BASE = 'https://www.cognivitilabs.com'

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = ''
        self.headings = []
        self.images = []
        self.links = []
        self.canonical = None
        self.capture = None
        self.text = ''
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'title' or tag in ('h1', 'h2', 'h3', 'h4', 'h5', 'h6'):
            self.capture = tag
            self.text = ''
        if tag == 'img': self.images.append(a)
        if tag == 'a' and a.get('href'): self.links.append(a['href'])
        if tag == 'link' and a.get('rel') == 'canonical': self.canonical = a.get('href')
    def handle_data(self, data):
        if self.capture: self.text += data
    def handle_endtag(self, tag):
        if tag == self.capture:
            if tag == 'title': self.title = self.text.strip()
            else: self.headings.append([tag, self.text.strip()])
            self.capture = None

def fetch(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'CogniWeb-SEO-Audit/1.0'}), timeout=25) as r:
        return r.read().decode(), dict(r.headers)

def audit(url):
    try:
        html, headers = fetch(url)
        p = Page()
        p.feed(html)
        return dict(url=url, title=p.title, canonical=p.canonical, headings=p.headings,
                    images=p.images, links=p.links, headers=headers)
    except Exception as e: return dict(url=url, error=str(e))

if __name__ == '__main__':
    xml, _ = fetch(BASE + '/sitemap.xml')
    urls = [e.text for e in ET.fromstring(xml).iter() if e.tag.endswith('}loc')]
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(audit, urls))
        extra = {urllib.parse.urljoin(BASE, link) for p in results for link in p.get('links', [])
                 if link.startswith(('/blog/', '/work/', '/careers/')) and '?' not in link and '#' not in link}
        results += list(pool.map(audit, sorted(extra - set(urls))))
    Path('docs/live-seo-audit.json').write_text(json.dumps(results, indent=2), encoding='utf-8')
    for p in results:
        issues = {'url': p['url'], 'title': p.get('title'), 'canonical': p.get('canonical'),
                  'heading_order': [h[0] for h in p.get('headings', [])],
                  'long_headings': [h for h in p.get('headings', []) if len(h[1]) > 70],
                  'images_without_size': [i.get('src') for i in p.get('images', []) if not i.get('width') or not i.get('height')],
                  'long_alt': [i.get('alt') for i in p.get('images', []) if len(i.get('alt', '')) > 100]}
        if p.get('error'): issues['error'] = p['error']
        print(json.dumps(issues))
    if '--resources' in sys.argv:
        external = {link for p in results for link in p.get('links', [])
                    if link.startswith('https://') and '?' not in link
                    and 'cognivitilabs.com' not in link and 'linkedin.com' not in link}
        images = {urllib.parse.urljoin(BASE, i['src']) for p in results for i in p.get('images', []) if i.get('src')}
        def resource(url):
            try:
                with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=15) as r:
                    size = len(r.read()) if url in images else None
                    return dict(url=url, status=r.status, bytes=size)
            except Exception as e: return dict(url=url, error=str(e))
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
            resources = list(pool.map(resource, sorted(images | external)))
        Path('docs/live-seo-resources.json').write_text(json.dumps(resources, indent=2), encoding='utf-8')
        for r in resources:
            if r.get('error') or (r.get('bytes') or 0) > 100000: print(json.dumps(r))
