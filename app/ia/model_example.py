"""Entrenamiento de modelo ML para predicciones de Quiniela.
Usamos scikit-learn RandomForest + features de frecuencia.
Guarda el modelo como joblib para usar en predicciones.
"""

import os
import sys
import pickle
import logging
from typing import List, Tuple

import numpy as np
from supabase import create_client

try:
    from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
    from sklearn.preprocessing import StandardScaler
    import joblib
except ImportError:
    print('Instala scikit-learn: pip install scikit-learn joblib')
    sys.exit(1)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error('Faltan credenciales')
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
MODEL_PATH = 'app/ia/models/quiniela_model.joblib'
SCALER_PATH = 'app/ia/models/scaler.joblib'
METADATA_PATH = 'app/ia/models/metadata.json'


def fetch_draws(limit=1000):
    """Carga draws históricos desde Supabase."""
    logger.info(f'Obteniendo últimos {limit} draws...')
    res = supabase.table('draws').select('numbers, date').order('date', desc=True).limit(limit).execute()
    return res.data or []


def generate_features(numbers: List[int], window_size: int = 10) -> np.ndarray:
    """Genera features a partir de los números.
    Features incluyen:
    - Frecuencia de cada 2-digito (00-99): 100 dim
    - Últimos N números vistos: window_size dim
    """
    # Feature 1: Frecuencia de 2-dígitos
    freq_2d = np.zeros(100)
    for n in numbers:
        if 0 <= n <= 99:
            freq_2d[n] += 1
        else:
            # Si es 3+ dígitos, toma últimas 2
            freq_2d[n % 100] += 1

    # Feature 2: Últimos vistos (padding si es necesario)
    recent = np.zeros(window_size)
    for i, n in enumerate(numbers[-window_size:]):
        recent[window_size - 1 - i] = n % 100  # normaliza a 2d

    # Combina
    features = np.concatenate([freq_2d / (len(numbers) + 1), recent / 100])
    return features


def build_dataset(draws: List[dict]) -> Tuple[np.ndarray, np.ndarray]:
    """Construye X (features) e y (targets) para entrenamiento."""
    X, y = [], []

    for draw in draws:
        numbers = draw.get('numbers', [])
        if not numbers:
            continue

        features = generate_features(numbers)
        # Target: cada número en el sorteo es una muestrapositiva
        for num in numbers:
            X.append(features)
            y.append(min(num, 99))  # normaliza a 2d

    if not X:
        logger.error('No hay datos válidos')
        return None, None

    return np.array(X), np.array(y)


def train_model(X: np.ndarray, y: np.ndarray) -> Tuple:
    """Entrena dos modelos: RandomForest y GradientBoosting."""
    logger.info(f'Entrenando con {len(X)} muestras...')

    # Normaliza features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # RandomForest
    logger.info('Entrenando RandomForest...')
    rf = RandomForestClassifier(
        n_estimators=100,
        max_depth=15,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1
    )
    rf.fit(X_scaled, y)
    rf_score = rf.score(X_scaled, y)
    logger.info(f'RandomForest accuracy: {rf_score:.3f}')

    # GradientBoosting
    logger.info('Entrenando GradientBoosting...')
    gb = GradientBoostingClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        random_state=42
    )
    gb.fit(X_scaled, y)
    gb_score = gb.score(X_scaled, y)
    logger.info(f'GradientBoosting accuracy: {gb_score:.3f}')

    return (rf, gb, scaler, rf_score, gb_score)


def save_models(models_tuple: Tuple):
    """Guarda los modelos entrenados."""
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)

    rf, gb, scaler, rf_score, gb_score = models_tuple

    joblib.dump(rf, MODEL_PATH)
    joblib.dump(gb, MODEL_PATH.replace('_model', '_gb_model'))
    joblib.dump(scaler, SCALER_PATH)

    # Metadata
    import json
    metadata = {
        'timestamp': str(__import__('datetime').datetime.now()),
        'rf_accuracy': float(rf_score),
        'gb_accuracy': float(gb_score),
        'feature_dim': 110,  # 100 freq + 10 recent
    }
    with open(METADATA_PATH, 'w') as f:
        json.dump(metadata, f, indent=2)

    logger.info(f'Modelos guardados en {MODEL_PATH}')


def main():
    logger.info('Iniciando pipeline de entrenamiento')
    draws = fetch_draws(1000)
    if not draws:
        logger.error('No hay draws para entrenar')
        return 1

    logger.info(f'Obtenidos {len(draws)} draws')
    X, y = build_dataset(draws)
    if X is None:
        return 1

    models = train_model(X, y)
    save_models(models)
    logger.info('✓ Entrenamiento completado')
    return 0


if __name__ == '__main__':
    sys.exit(main())
