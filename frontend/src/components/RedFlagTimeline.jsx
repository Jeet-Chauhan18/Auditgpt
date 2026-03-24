import './RedFlagTimeline.css'

const SEVERITY_COLORS = {
  Critical: '#ff4444',
  High: '#ff4444',
  Medium: '#ffa500',
  Low: '#00ff88',
}

export default function RedFlagTimeline({ red_flags, maxYear }) {
  if (!red_flags || red_flags.length === 0) {
    return (
      <div className="red-flag-timeline empty">
        <h3 className="component-label">RED FLAG TIMELINE</h3>
        <p>No red flags detected — financial metrics within normal ranges.</p>
      </div>
    )
  }

  const filtered = maxYear
    ? red_flags.filter(f => f.first_appeared <= maxYear)
    : red_flags

  // Group by year
  const byYear = {}
  for (const flag of filtered) {
    const year = flag.first_appeared || 'Unknown'
    if (!byYear[year]) byYear[year] = []
    byYear[year].push(flag)
  }

  const sortedYears = Object.keys(byYear).sort()

  return (
    <div className="red-flag-timeline">
      <h3 className="component-label">RED FLAG TIMELINE — {filtered.length} flags detected</h3>
      <div className="timeline">
        {sortedYears.map(year => (
          <div key={year} className="timeline-year">
            <div className="year-marker">
              <div className="year-dot" />
              <span className="year-label mono">{year}</span>
            </div>
            <div className="year-flags">
              {byYear[year].map((flag, i) => (
                <div
                  key={i}
                  className="flag-card"
                  style={{ borderLeftColor: SEVERITY_COLORS[flag.severity] || '#6b7280' }}
                >
                  <div className="flag-header">
                    <span className={`badge badge-${flag.severity.toLowerCase()}`}>{flag.severity}</span>
                    <span className="flag-type">{flag.flag_type}</span>
                  </div>
                  {flag.industry_context && (
                    <p className="flag-context">{flag.industry_context}</p>
                  )}
                  {flag.evolution?.[0] && (
                    <p className="flag-evolution mono">{flag.evolution[0]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
