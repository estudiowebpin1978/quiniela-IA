import os
import random
from supabase import create_client

# simple frequency-based predictor using the same logic as the JS API

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def fetch_draws(limit=100):
    res = supabase.table('draws').select('numbers').order('date', desc=True).limit(limit).execute()
    return res.data or []


def compute(draws):
    freq = {}
    for d in draws:
        for n in d.get('numbers', []):
            s = str(n).zfill(2)
            freq[s] = freq.get(s, 0) + 1
    sorted_nums = sorted(freq.items(), key=lambda x: x[1], reverse=True)
    return [num for num,_ in sorted_nums[:10]]


def predict():
    draws = fetch_draws()
    if not draws:
        return [str(random.randint(0,99)).zfill(2) for _ in range(10)]
    return compute(draws)

if __name__ == '__main__':
    print(predict())
