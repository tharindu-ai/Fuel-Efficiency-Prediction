# Fuel Efficiency Prediction App

This folder contains:
- A React frontend (Vite) in `src/`
- A Flask backend API in `app.py`
- Trained model file `model (1).pkl`

## 1) Start Backend API

Open terminal in this folder and run:

```bash
pip install -r requirements.txt
python app.py
```

Backend runs at `http://127.0.0.1:5000`.

Health check:

```bash
curl http://127.0.0.1:5000/health
```

## 2) Start Frontend

In another terminal:

```bash
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and sends API calls to `/api/predict`.
Vite proxy forwards `/api` to `http://127.0.0.1:5000`.

## 3) Common Error Fix

If you see:

"Could not reach /api/predict" or connection errors,
it means backend is not running yet. Start `python app.py` first.

## API Payload

`POST /predict` accepts any of these formats:

```json
{
	"cylinders": 4,
	"displacement": 120,
	"horsepower": 95,
	"weight": 2500,
	"acceleration": 15,
	"model_year": 80,
	"origin": 1
}
```

or

```json
{ "features": [4, 120, 95, 2500, 15, 80, 1] }
```

or

```json
{ "input": [4, 120, 95, 2500, 15, 80, 1] }
```
