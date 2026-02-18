#!/usr/bin/env python3
"""Quick HTML -> JSON extractor.

Usage:
  python scripts/html_to_json.py https://example.com > out.json

This script fetches the URL, extracts page title, all headings, and any
HTML tables (rows/cells). Output is JSON to stdout.
"""
import sys
import json
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup


def extract_tables(soup):
    tables = []
    for table in soup.find_all('table'):
        headers = []
        thead = table.find('thead')
        if thead:
            headers = [th.get_text(strip=True) for th in thead.find_all('th')]
        rows = []
        for tr in table.find_all('tr'):
            cells = [td.get_text(strip=True) for td in tr.find_all(['td','th'])]
            if cells:
                rows.append(cells)
        tables.append({'headers': headers, 'rows': rows})
    return tables


def extract_text_lists(soup):
    # common patterns for lottery results: lists, divs, spans with numbers
    lists = []
    for ul in soup.find_all('ul'):
        items = [li.get_text(strip=True) for li in ul.find_all('li')]
        if items:
            lists.append(items)
    return lists


def main():
    if len(sys.argv) < 2:
        print('Usage: html_to_json.py <url>', file=sys.stderr)
        sys.exit(2)

    url = sys.argv[1]
    # allow insecure TLS if requested (useful for sites with hostname/cert issues)
    insecure = '--insecure' in sys.argv
    resp = requests.get(url, timeout=15, verify=not insecure)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, 'html.parser')

    output = {
        'url': url,
        'domain': urlparse(url).netloc,
        'title': soup.title.string.strip() if soup.title and soup.title.string else None,
        'headings': [h.get_text(strip=True) for h in soup.find_all(['h1','h2','h3'])],
        'tables': extract_tables(soup),
        'lists': extract_text_lists(soup),
        'raw': None,
    }

    # Optionally include a small portion of raw HTML for debugging
    output['raw'] = soup.body.get_text(separator=' ', strip=True)[:2000] if soup.body else None

    json.dump(output, sys.stdout, ensure_ascii=False, indent=2)


if __name__ == '__main__':
    main()
