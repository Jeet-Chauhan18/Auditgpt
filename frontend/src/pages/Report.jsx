import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import FraudScore from '../components/FraudScore'
import AnomalyMap from '../components/AnomalyMap'
import PeerComparison from '../components/PeerComparison'
import RedFlagTimeline from '../components/RedFlagTimeline'
import SentimentTrend from '../components/SentimentTrend'
import NarrativePanel from '../components/NarrativePanel'
import SatyamReplay from '../components/SatyamReplay'
import './Report.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Report() {
  const { companyId } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [replayYear, setReplayYear] = useState(null)

  useEffect(() => {
    fetch(`${API}/api/report/${companyId}`)
      .then(r => {
        if (!r.ok) throw new Error(r.status === 404 ? 'Company not found' : 'Failed to load report')
        return r.json()
      })
      .then(data => { setReport(data); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [companyId])

  const handleReplayYear = useCallback((year) => {
    setReplayYear(year)
  }, [])

  if (loading) return <div className="report-loading">Analyzing financials...</div>
  if (error) return (
    <div className="report-error">
      <h2>{error}</h2>
      <button onClick={() => navigate('/')}>Back to Fraud Radar</button>
    </div>
  )
  if (!report) return null

  const isSatyam = companyId.toLowerCase().includes('satyam')
  const showOverlay = report.composite_score > 50

  return (
    <div className="report">
      <header className="report-header">
        <button className="back-btn" onClick={() => navigate('/')}>← FRAUD RADAR</button>
        <h1 className="company-name">{report.company_name}</h1>
        <span className="company-sector mono">{report.sector}</span>
      </header>

      {/* Satyam Replay controls */}
      {isSatyam && (
        <section className="report-section">
          <SatyamReplay onYearChange={handleReplayYear} />
        </section>
      )}

      {/* Hero section: FraudScore + AnomalyMap fill viewport */}
      <section className="hero-section">
        <div className="hero-grid">
          <div className="fraud-score-card">
            <FraudScore
              composite_score={report.composite_score}
              risk_level={report.risk_level}
              breakdown={report.breakdown}
              beneish={report.beneish}
              altman={report.altman}
            />
          </div>
          <div className="anomaly-map-card">
            <AnomalyMap
              anomaly_map={report.anomaly_map}
              maxYear={replayYear}
              satyamOverlay={showOverlay ? null : null /* TODO: load satyam.json */}
            />
          </div>
        </div>
      </section>

      {/* Scrollable detail sections */}
      <section className="detail-sections">
        <div className="report-section">
          <PeerComparison
            company_name={report.company_name}
            composite_score={report.composite_score}
            risk_level={report.risk_level}
            peer_companies={report.peer_companies}
          />
        </div>

        <div className="report-section">
          <RedFlagTimeline
            red_flags={report.red_flags}
            maxYear={replayYear}
          />
        </div>

        <div className="report-section">
          <SentimentTrend sentiment_trend={report.sentiment_trend} />
        </div>

        <div className="report-section">
          <NarrativePanel
            companyId={companyId}
            cachedNarrative={report.narrative}
          />
        </div>
      </section>
    </div>
  )
}
