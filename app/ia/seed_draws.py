#!/usr/bin/env python3
"""
Script para poblar la tabla 'draws' con datos históricos de ejemplo
Uso: python app/ia/seed_draws.py
"""

import os
import sys
from datetime import datetime, timedelta
import random
from supabase import create_client

# Credenciales
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def generate_numbers(count=5):
    """Genera números aleatorios para un sorteo"""
    return sorted([random.randint(0, 99) for _ in range(count)])

def seed_draws(days_back=90):
    """
    Inserta datos históricos de últimos 'days_back' días
    (un sorteo por día, por provincia y turno)
    """
    provinces = ['Nacional', 'Buenos Aires', 'Córdoba', 'Santa Fe']
    turnos = ['Mañana', 'Tarde', 'Noche']
    
    today = datetime.now()
    count = 0
    duplicates = 0
    
    for i in range(days_back):
        draw_date = (today - timedelta(days=i)).date()
        
        for province in provinces:
            for turno in turnos:
                # Generar números aleatorios
                numbers = generate_numbers(5)
                
                try:
                    # Intentar insertar
                    response = supabase.table('draws').insert({
                        'date': str(draw_date),
                        'numbers': numbers,
                        'province': province,
                        'turno': turno,
                        'source': 'seed_script'
                    }).execute()
                    count += 1
                    
                except Exception as e:
                    # Si ya existe (UNIQUE constraint), ignorar
                    if 'unique' in str(e).lower() or 'duplicate' in str(e).lower():
                        duplicates += 1
                    else:
                        print(f"⚠️  Error en {draw_date} {province} {turno}: {e}")
    
    print(f"\n✅ Seed completado:")
    print(f"  - Registros insertados: {count}")
    print(f"  - Duplicados saltados: {duplicates}")
    print(f"\n📊 Total esperado: {days_back * len(provinces) * len(turnos)}")

if __name__ == '__main__':
    print("🌱 Iniciando seed de draws...")
    seed_draws(days_back=90)  # Últimos 90 días
    print("✨ ¡Listo!")
