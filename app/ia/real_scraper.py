"""Scraper profesional para Quiniela Nacional Buenos Aires.
Intenta múltiples fuentes y formatos, con reintentos y logging.
"""

import os
import sys
import json
import logging
from datetime import datetime, timedelta
from typing import Optional, List, Dict

import requests
from bs4 import BeautifulSoup
from supabase import create_client

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error('Faltan credenciales de Supabase')
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# URLs de ejemplo (reemplaza con fuentes reales)
SOURCES = [
    'https://www.quiniela.gov.ar/resultados/ultimo',
    'https://loterianacional.com.ar/api/latest',
]

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}
MAX_RETRIES = 3
TIMEOUT = 10


def validate_numbers(nums: List[int]) -> bool:
    """Valida que los números sean válidos (0-9999)."""
    return all(isinstance(n, int) and 0 <= n <= 9999 for n in nums)


def parse_json_response(text: str) -> Optional[Dict]:
    """Intenta parsear respuesta JSON."""
    try:
        data = json.loads(text)
        # esperamos estructura como {"date": "...", "numbers": [...], "turno": "..."}
        if 'date' in data and 'numbers' in data:
            return data
    except json.JSONDecodeError:
        pass
    return None


def parse_html_response(text: str) -> Optional[Dict]:
    """Intenta parsear respuesta HTML."""
    try:
        soup = BeautifulSoup(text, 'html.parser')
        # Ajusta los selectores según la estructura real
        date_elem = soup.select_one('[data-date], .fecha, h2')
        nums_elem = soup.select_one('[data-numbers], .numeros, .resultados')
        turno_elem = soup.select_one('[data-turno], .turno')

        if not (date_elem and nums_elem):
            return None

        date_str = date_elem.get_text(strip=True)
        nums_raw = nums_elem.get_text(strip=True)
        turno = turno_elem.get_text(strip=True) if turno_elem else 'Mañana'

        # Extrae números del texto ("12 34 56 78" o "12,34,56,78")
        nums = []
        for word in nums_raw.replace(',', ' ').split():
            try:
                n = int(word)
                if 0 <= n <= 9999:
                    nums.append(n)
            except ValueError:
                pass

        if len(nums) >= 4:  # esperamos al menos 4 números
            return {'date': date_str, 'numbers': nums, 'turno': turno}
    except Exception as e:
        logger.debug(f'Error parseando HTML: {e}')
    return None


def fetch_from_source(url: str) -> Optional[Dict]:
    """Intenta obtener datos de una fuente con reintentos."""
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            logger.info(f'Intento {attempt}/{MAX_RETRIES} en {url}')
            resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
            resp.raise_for_status()

            # Intenta JSON primero
            result = parse_json_response(resp.text)
            if result:
                logger.info(f'Parseado JSON de {url}')
                return result

            # Luego HTML
            result = parse_html_response(resp.text)
            if result:
                logger.info(f'Parseado HTML de {url}')
                return result
        except requests.RequestException as e:
            logger.warning(f'Intento {attempt} falló: {e}')
            if attempt < MAX_RETRIES:
                import time
                time.sleep(2 ** attempt)  # backoff exponencial
    return None


def get_draw_data() -> Optional[Dict]:
    """Intenta obtener datos del sorteo de múltiples fuentes."""
    for source in SOURCES:
        data = fetch_from_source(source)
        if data and validate_numbers(data.get('numbers', [])):
            return data
    logger.error('No se pudo obtener datos de ninguna fuente')
    return None


def save_to_supabase(draw: Dict) -> bool:
    """Guarda el sorteo en Supabase si no existe."""
    try:
        # Convierte la fecha a ISO format si es necesario
        try:
            date_obj = datetime.fromisoformat(draw['date'])
            date_iso = date_obj.date().isoformat()
        except (ValueError, TypeError):
            date_iso = draw['date']

        # Comprueba si ya existe
        existing = supabase.table('draws').select('id').eq('date', date_iso).execute()
        if existing.data and len(existing.data) > 0:
            logger.info(f'Sorteo {date_iso} ya existe')
            return False

        # Inserta el nuevo sorteo
        result = supabase.table('draws').insert({
            'date': date_iso,
            'numbers': draw['numbers'],
            'lottery': 'Nacional',
            'turno': draw.get('turno', 'Mañana'),
        }).execute()

        if result.data:
            logger.info(f'Sorteo {date_iso} insertado exitosamente')
            return True
        else:
            logger.error(f'Error insertando: {result.error}')
            return False
    except Exception as e:
        logger.error(f'Error en save_to_supabase: {e}')
        return False


def main():
    """Función principal."""
    logger.info('Iniciando scraper de Quiniela Nacional')
    draw = get_draw_data()
    if draw:
        if save_to_supabase(draw):
            logger.info('✓ Proceso completado exitosamente')
            return 0
    logger.error('✗ No se pudo completar el proceso')
    return 1


if __name__ == '__main__':
    sys.exit(main())
