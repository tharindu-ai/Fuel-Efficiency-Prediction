import csv
from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split

DATASET_PATH = Path('dataset.csv')
MODEL_PATH = Path('model (1).pkl')

# Keep feature order aligned with the API payload.
FEATURE_COLUMNS = [
    'cylinders',
    'displacement',
    'horsepower',
    'weight',
    'acceleration',
    'model year',
    'origin',
]
TARGET_COLUMN = 'mpg'


def load_dataset(path: Path) -> tuple[np.ndarray, np.ndarray]:
    features: list[list[float]] = []
    targets: list[float] = []

    with path.open('r', newline='', encoding='utf-8') as dataset_file:
        reader = csv.DictReader(dataset_file)

        for row in reader:
            try:
                x_row = [float(row[column]) for column in FEATURE_COLUMNS]
                y_value = float(row[TARGET_COLUMN])
            except (TypeError, ValueError):
                # Skip rows with missing/non-numeric values like '?'.
                continue

            features.append(x_row)
            targets.append(y_value)

    if not features:
        raise ValueError('No valid rows found in dataset.csv')

    return np.array(features, dtype=float), np.array(targets, dtype=float)


def main() -> None:
    x, y = load_dataset(DATASET_PATH)

    x_train, x_test, y_train, y_test = train_test_split(
        x,
        y,
        test_size=0.2,
        random_state=42,
    )

    model = RandomForestRegressor(
        n_estimators=300,
        random_state=42,
    )
    model.fit(x_train, y_train)

    y_pred = model.predict(x_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    joblib.dump(model, MODEL_PATH)

    print(f'Trained rows: {len(x)}')
    print(f'MAE: {mae:.4f}')
    print(f'R2: {r2:.4f}')
    print(f'Saved model: {MODEL_PATH}')


if __name__ == '__main__':
    main()
