import os
import requests
from supabase import create_client

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Placeholder scrape function: replace with actual endpoint

def fetch_latest_draw():
    # Example structure returned; real site parsing required
    # This is a stub that returns a fixed set of numbers
    return {
        'date': '2026-02-17',
        'numbers': [12, 34, 56, 78]
    }


def main():
    draw = fetch_latest_draw()
    # insert if not exists
    existing = supabase.table('draws').select('id').eq('date', draw['date']).execute()
    if existing.data and len(existing.data) > 0:
        print('already have draw', draw['date'])
        return
    res = supabase.table('draws').insert({'date': draw['date'], 'numbers': draw['numbers'], 'lottery': 'nacional'}).execute()
    print('inserted', res)


if __name__ == '__main__':
    main()
