#!/usr/bin/env python3
"""Ingest parsed Quiniela results into Supabase `draws` table.

Usage:
  python scripts/ingest_ruta1000.py <url> [--insecure] [--province "Buenos Aires"]

Requires `SUPABASE_SERVICE_ROLE_KEY` and `NEXT_PUBLIC_SUPABASE_URL` in .env.local
"""
import sys
import json
import os
from datetime import date

import requests
import sqlite3
from pathlib import Path

from bs4 import BeautifulSoup

# import parse function from our parser script
from parse_quiniela import parse

# local storage paths
DATA_DIR = Path('data')
DATA_DIR.mkdir(exist_ok=True)
PENDING_JSONL = DATA_DIR / 'pending_draws.jsonl'
SQLITE_DB = DATA_DIR / 'draws.db'


def ensure_sqlite():
        conn = sqlite3.connect(SQLITE_DB)
        cur = conn.cursor()
        cur.execute('''
        CREATE TABLE IF NOT EXISTS draws (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            numbers TEXT,
            province TEXT,
            turno TEXT,
            source TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        conn.commit()
        return conn


def load_env(path='.env.local'):
    vars = {}
    if not os.path.exists(path):
        return vars
    with open(path, 'r', encoding='utf8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if '=' in line:
                k, v = line.split('=', 1)
                vars[k.strip()] = v.strip().strip('"')
    return vars


def normalize_numbers(entries):
    # entries: list of {'pos': '1º', 'number': '1234'}
    nums = []
    for e in entries:
        n = e.get('number')
        if not n:
            continue
        # keep only digits, take last up to 4 digits
        digits = ''.join(ch for ch in str(n) if ch.isdigit())
        if not digits:
            continue
        # convert to int
        try:
            val = int(digits)
        except ValueError:
            continue
        nums.append(val)
    return nums


def insert_draw(supabase_url, service_key, payload):
    url = supabase_url.rstrip('/') + '/rest/v1/draws'
    headers = {
        'Content-Type': 'application/json',
        'apikey': service_key,
        'Authorization': f'Bearer {service_key}',
        'Prefer': 'return=representation'
    }
    r = requests.post(url, headers=headers, json=payload, timeout=15)
    return r


def main():
    if len(sys.argv) < 2:
        print('Usage: ingest_ruta1000.py <url> [--insecure] [--province "Buenos Aires"]')
        sys.exit(2)

    url = sys.argv[1]
    insecure = '--insecure' in sys.argv
    # optional province arg
    province = 'Buenos Aires'
    if '--province' in sys.argv:
        i = sys.argv.index('--province')
        if i + 1 < len(sys.argv):
            province = sys.argv[i+1]

    env = load_env()
    SUPABASE_URL = env.get('NEXT_PUBLIC_SUPABASE_URL')
    SERVICE_KEY = env.get('SUPABASE_SERVICE_ROLE_KEY')
    if not SUPABASE_URL or not SERVICE_KEY:
        print('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
        sys.exit(1)

    # parse page
    parsed = parse(url, insecure=insecure)

    results = []
    for turno, entries in parsed.items():
        if not entries:
            continue
        numbers = normalize_numbers(entries)
        if not numbers:
            continue
        payload = {
            'date': str(date.today()),
            'numbers': numbers,
            'province': province,
            'turno': turno.capitalize(),
            'source': 'ruta1000'
        }
        print('Inserting:', turno, payload)
        r = insert_draw(SUPABASE_URL, SERVICE_KEY, payload)
        if r.status_code in (200, 201):
            print('Inserted:', r.json())
        else:
            print('Insert failed:', r.status_code, r.text)
            # fallback: append to JSONL and insert into local sqlite
            with open(PENDING_JSONL, 'a', encoding='utf8') as f:
                f.write(json.dumps(payload, ensure_ascii=False) + '\n')
            conn = ensure_sqlite()
            cur = conn.cursor()
            cur.execute('INSERT INTO draws (date, numbers, province, turno, source) VALUES (?, ?, ?, ?, ?)', (
                payload['date'], json.dumps(payload['numbers']), payload['province'], payload['turno'], payload['source']
            ))
            conn.commit()
            conn.close()
            print('Saved to', PENDING_JSONL, 'and local sqlite DB at', SQLITE_DB)


if __name__ == '__main__':
    main()
