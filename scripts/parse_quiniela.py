#!/usr/bin/env python3
"""Parse Quiniela pages and extract results by turno.

Usage:
  python scripts/parse_quiniela.py <url> [--insecure]

Output: JSON with keys for PREVIA, PRIMERA, MATUTINA, VESPERTINA, NOCTURNA
Each turno contains an array of 'positions' where each position is {pos: '1º', number: '1234'}
"""
import sys
import re
import json
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup

TURNOS = ["PREVIA", "PRIMERA", "MATUTINA", "VESPERTINA", "NOCTURNA", "PRIMERANO", "MATUTINANO", "VESPERTINANO", "NOCTURNANO"]

NUMBER_RE = re.compile(r"\b(\d{2,4})\b")


def find_turno_headers(soup):
    matches = []
    # look at headings and strong/bold texts
    candidates = soup.find_all(['h1','h2','h3','h4','h5','strong','b','p','div','span'])
    for el in candidates:
        text = (el.get_text(' ', strip=True) or '').upper()
        for turno in TURNOS:
            if turno in text and ('QUINIELA' in text or 'GANADOR' in text or 'QUINIELA' in text.split()[:2]):
                matches.append((turno, el))
                break
        else:
            # also match lines like 'QUINIELA BUENOS AIRES PRIMERA'
            for turno in TURNOS:
                if re.search(rf"QUINIELA.*{turno}", text):
                    matches.append((turno, el))
                    break
    return matches


def extract_from_element(el):
    """Given an element, try to extract positions and numbers from nearby content."""
    results = []
    # look for nearest table
    table = None
    # check siblings and children
    if el.find_next('table'):
        table = el.find_next('table')
    elif el.find_next_sibling('table'):
        table = el.find_next_sibling('table')

    if table:
        # iterate rows
        for tr in table.find_all('tr'):
            cells = [c.get_text(' ', strip=True) for c in tr.find_all(['td','th'])]
            if not cells:
                continue
            # try to find position and number in the row
            pos = None
            number = None
            for c in cells:
                if re.match(r'^\d+º$', c) or re.match(r'^[0-9]+º$', c):
                    pos = c
                else:
                    m = NUMBER_RE.search(c)
                    if m:
                        number = m.group(1)
            if number:
                results.append({'pos': pos or cells[0], 'number': number})
        if results:
            return results

    # fallback: search following text blocks for numbered lines
    text_block = ''
    for sib in el.find_next_siblings(limit=8):
        text_block += ' ' + sib.get_text(' ', strip=True)
    # also include children text
    text_block = el.get_text(' ', strip=True) + ' ' + text_block

    # find sequences like '1º 1234 2º 5678 3º 9012'
    tokens = re.findall(r"(\d+º)\s*([0-9]{2,4})", text_block)
    if tokens:
        for pos, num in tokens:
            results.append({'pos': pos, 'number': num})
        return results

    # last resort: find any 2-4 digit numbers in block and enumerate
    nums = NUMBER_RE.findall(text_block)
    for i, n in enumerate(nums[:20]):
        results.append({'pos': f"{i+1}º", 'number': n})
    return results


def parse(url, insecure=False):
    resp = requests.get(url, timeout=15, verify=not insecure)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, 'html.parser')

    turno_map = {t: [] for t in ['PREVIA','PRIMERA','MATUTINA','VESPERTINA','NOCTURNA']}

    headers = find_turno_headers(soup)
    used = set()
    for raw_turno, el in headers:
        # normalize to main turno names
        key = None
        if 'PREVIA' in raw_turno:
            key = 'PREVIA'
        elif 'PRIMER' in raw_turno:
            key = 'PRIMERA'
        elif 'MATUT' in raw_turno:
            key = 'MATUTINA'
        elif 'VESPERT' in raw_turno:
            key = 'VESPERTINA'
        elif 'NOCTUR' in raw_turno:
            key = 'NOCTURNA'
        else:
            continue

        if key in used:
            continue
        used.add(key)

        results = extract_from_element(el)
        turno_map[key] = results

    # If nothing found for keys, attempt heuristic: search for tables that contain '1º' and take nearest heading text
    if not any(turno_map.values()):
        for table in soup.find_all('table'):
            tbl_text = table.get_text(' ', strip=True).upper()
            for key in turno_map.keys():
                if key in tbl_text:
                    # find heading above
                    heading = table.find_previous(['h1','h2','h3','h4','strong','b','p'])
                    results = extract_from_element(heading or table)
                    turno_map[key] = results

    return turno_map


def main():
    if len(sys.argv) < 2:
        print('Usage: parse_quiniela.py <url> [--insecure]', file=sys.stderr)
        sys.exit(2)
    url = sys.argv[1]
    insecure = '--insecure' in sys.argv
    out = parse(url, insecure=insecure)
    print(json.dumps(out, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
