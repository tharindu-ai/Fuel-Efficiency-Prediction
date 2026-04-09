import { useMemo, useState } from 'react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const initialForm = {
  cylinders: '4',
  displacement: '120',
  horsepower: '95',
  weight: '2500',
  acceleration: '15',
  model_year: '80',
  origin: '1',
}

const presets = {
  economy: {
    cylinders: '4',
    displacement: '98',
    horsepower: '68',
    weight: '2100',
    acceleration: '18',
    model_year: '82',
    origin: '2',
  },
  balanced: {
    cylinders: '6',
    displacement: '200',
    horsepower: '110',
    weight: '3100',
    acceleration: '15',
    model_year: '78',
    origin: '1',
  },
  heavy: {
    cylinders: '8',
    displacement: '350',
    horsepower: '165',
    weight: '4100',
    acceleration: '12',
    model_year: '73',
    origin: '1',
  },
}

function parsePrediction(payload) {
  const candidates = [
    payload?.prediction,
    payload?.predicted_mpg,
    payload?.mpg,
    payload?.result,
  ]
  const valid = candidates.find((value) => Number.isFinite(Number(value)))
  return valid === undefined ? null : Number(valid)
}

async function requestPrediction(url, features) {
  const featuresArray = [
    features.cylinders,
    features.displacement,
    features.horsepower,
    features.weight,
    features.acceleration,
    features.model_year,
    features.origin,
  ]

  const payloadOptions = [
    features,
    { features },
    { features: featuresArray },
    { input: featuresArray },
  ]

  let lastError = null

  for (const bodyPayload of payloadOptions) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
      })

      if (!response.ok) {
        lastError = new Error(`Server returned ${response.status}`)
        continue
      }

      const payload = await response.json()
      const mpg = parsePrediction(payload)
      if (mpg !== null) {
        return mpg
      }

      lastError = new Error('Unexpected response shape from API.')
    } catch (error) {
      lastError = error
    }
  }

  throw lastError || new Error('Prediction request failed.')
}

function App() {
  const [form, setForm] = useState(initialForm)
  const [isLoading, setIsLoading] = useState(false)
  const [prediction, setPrediction] = useState(null)
  const [error, setError] = useState('')

  const efficiencyLabel = useMemo(() => {
    if (prediction === null) {
      return ''
    }
    if (prediction >= 30) {
      return 'High efficiency'
    }
    if (prediction >= 20) {
      return 'Moderate efficiency'
    }
    return 'Low efficiency'
  }, [prediction])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const applyPreset = (name) => {
    setPrediction(null)
    setError('')
    setForm(presets[name])
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    setError('')

    const features = {
      cylinders: Number(form.cylinders),
      displacement: Number(form.displacement),
      horsepower: Number(form.horsepower),
      weight: Number(form.weight),
      acceleration: Number(form.acceleration),
      model_year: Number(form.model_year),
      origin: Number(form.origin),
    }

    const hasInvalidValue = Object.values(features).some(
      (value) => Number.isNaN(value) || !Number.isFinite(value),
    )

    if (hasInvalidValue) {
      setIsLoading(false)
      setPrediction(null)
      setError('Please enter valid numeric values for all fields.')
      return
    }

    try {
      const mpg = await requestPrediction(`${API_BASE_URL}/predict`, features)
      setPrediction(mpg)
    } catch (apiError) {
      setPrediction(null)

      const isNetworkError =
        apiError instanceof TypeError ||
        /fetch|network|failed/i.test(String(apiError?.message || ''))

      if (isNetworkError) {
        setError(
          `Could not reach ${API_BASE_URL}/predict. Start your ML API server before submitting the form.`,
        )
      } else {
        setError(
          `API responded but prediction failed (${apiError?.message || 'unknown error'}). Check backend payload/response format.`,
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="page">
      <section className="intro panel">
        <p className="eyebrow">Machine Learning Demo</p>
        <h1>Fuel Efficiency Predictor</h1>
        <p className="subtitle">
          Enter vehicle specs and estimate mileage in miles per gallon using your
          trained model.
        </p>

        <div className="presetRow" role="group" aria-label="Preset vehicle types">
          <button type="button" onClick={() => applyPreset('economy')}>
            Economy
          </button>
          <button type="button" onClick={() => applyPreset('balanced')}>
            Balanced
          </button>
          <button type="button" onClick={() => applyPreset('heavy')}>
            Heavy
          </button>
        </div>
      </section>

      <section className="grid">
        <form className="panel form" onSubmit={handleSubmit}>
          <h2>Vehicle Inputs</h2>

          <label>
            Cylinders
            <input
              name="cylinders"
              type="number"
              min="3"
              max="12"
              value={form.cylinders}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Displacement (cu in)
            <input
              name="displacement"
              type="number"
              step="0.1"
              value={form.displacement}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Horsepower
            <input
              name="horsepower"
              type="number"
              step="0.1"
              value={form.horsepower}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Weight (lbs)
            <input
              name="weight"
              type="number"
              step="0.1"
              value={form.weight}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Acceleration
            <input
              name="acceleration"
              type="number"
              step="0.1"
              value={form.acceleration}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Model Year
            <input
              name="model_year"
              type="number"
              min="70"
              max="95"
              value={form.model_year}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Origin (1=USA, 2=Europe, 3=Japan)
            <input
              name="origin"
              type="number"
              min="1"
              max="3"
              value={form.origin}
              onChange={handleChange}
              required
            />
          </label>

          <button className="predictBtn" type="submit" disabled={isLoading}>
            {isLoading ? 'Predicting...' : 'Predict MPG'}
          </button>
        </form>

        <aside className="panel result">
          <h2>Prediction Result</h2>

          {prediction !== null && !error ? (
            <>
              <p className="bigValue">{prediction.toFixed(2)} MPG</p>
              <p className="efficiencyTag">{efficiencyLabel}</p>
            </>
          ) : (
            <p className="placeholder">
              Submit the form to get an MPG prediction from your model API.
            </p>
          )}

          {error && <p className="errorMsg">{error}</p>}

          <div className="apiHint">
            <p>Endpoint:</p>
            <code>{API_BASE_URL}/predict</code>
          </div>
        </aside>
      </section>
    </main>
  )
}

export default App
