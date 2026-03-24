import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './FraudRadar.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function FraudRadar() {
  const [sectors, setSectors] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${API}/api/sectors`)
      .then(r => r.json())
      .then(data => { setSectors(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return }
    const timer = setTimeout(() => {
      fetch(`${API}/api/search?q=${encodeURIComponent(searchQuery)}`)
        .then(r => r.json())
        .then(setSearchResults)
        .catch(() => setSearchResults([]))
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const riskColor = (level) => {
    const colors = { Low: '#00ff88', Medium: '#ffa500', High: '#ff4444', Critical: '#ff4444' }
    return colors[level] || '#6b7280'
  }

  return (
    <div className="fraud-radar">
      <header className="radar-header">
        <h1 className="radar-title">
          <span className="title-accent">AUDIT</span>GPT
        </h1>
        <p className="radar-subtitle">Financial Statement Forensics Engine</p>
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search any NSE-listed company..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchResults.length > 0 && (
            <div className="search-dropdown">
              {searchResults.map(r => (
                <div
                  key={r.company_id}
                  className="search-result"
                  onClick={() => navigate(`/report/${r.company_id}`)}
                >
                  <span className="result-name">{r.company_name}</span>
                  <span className="result-sector">{r.sector}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      <section className="sector-grid">
        <h2 className="section-title">FRAUD RADAR — Sector Risk Overview</h2>
        {loading ? (
          <div className="loading">Scanning sectors...</div>
        ) : (
          <div className="grid">
            {sectors.map(s => (
              <div
                key={s.sector_name}
                className="sector-card"
                style={{ borderColor: riskColor(s.risk_level) }}
                onClick={() => navigate(`/?sector=${s.sector_name}`)}
              >
                <div className="sector-name">{s.sector_name}</div>
                <div className="sector-score mono" style={{ color: riskColor(s.risk_level) }}>
                  {s.avg_risk_score.toFixed(1)}
                </div>
                <div className="sector-meta">
                  <span className={`badge badge-${s.risk_level.toLowerCase()}`}>{s.risk_level}</span>
                  <span className="company-count">{s.company_count} companies</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
