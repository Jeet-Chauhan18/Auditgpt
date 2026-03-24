import { useMemo } from 'react'
import './AnomalyMap.css'

function zToColor(z) {
  if (z === null || z === undefined) return '#1a1f2e'
  const abs = Math.abs(z)
  if (abs < 1) return '#0a3d24'     // green — normal
  if (abs < 2) return '#3d3a0a'     // yellow — watch
  if (abs < 3) return '#5c1a1a'     // red — anomaly
  return '#8b0000'                   // dark red — severe
}

function zToLabel(z) {
  if (z === null || z === undefined) return 'N/A'
  return z.toFixed(1)
}

export default function AnomalyMap({ anomaly_map, satyamOverlay, maxYear }) {
  const { ratios, years } = useMemo(() => {
    if (!anomaly_map) return { ratios: [], years: [] }

    const allYears = new Set()
    for (const yearScores of Object.values(anomaly_map)) {
      Object.keys(yearScores).forEach(y => allYears.add(y))
    }
    let sortedYears = [...allYears].sort()
    if (maxYear) {
      sortedYears = sortedYears.filter(y => y <= String(maxYear))
    }

    return {
      ratios: Object.keys(anomaly_map),
      years: sortedYears,
    }
  }, [anomaly_map, maxYear])

  if (!anomaly_map || ratios.length === 0) {
    return <div className="anomaly-map empty">No anomaly data available</div>
  }

  return (
    <div className="anomaly-map">
      <h3 className="component-label">ANOMALY MAP — Industry-Adjusted Z-Scores</h3>
      <div className="legend">
        <span className="legend-item"><span className="legend-swatch" style={{ background: '#0a3d24' }} /> |z| &lt; 1 Normal</span>
        <span className="legend-item"><span className="legend-swatch" style={{ background: '#3d3a0a' }} /> 1-2 Watch</span>
        <span className="legend-item"><span className="legend-swatch" style={{ background: '#5c1a1a' }} /> 2-3 Anomaly</span>
        <span className="legend-item"><span className="legend-swatch" style={{ background: '#8b0000' }} /> &gt; 3 Severe</span>
      </div>
      <div className="heatmap-scroll">
        <table className="heatmap-table">
          <thead>
            <tr>
              <th className="ratio-header">Ratio</th>
              {years.map(y => (
                <th key={y} className="year-header mono">{y}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ratios.map(ratio => (
              <tr key={ratio}>
                <td className="ratio-name">{ratio}</td>
                {years.map(y => {
                  const z = anomaly_map[ratio]?.[y]
                  return (
                    <td
                      key={y}
                      className="heatmap-cell"
                      style={{
                        background: zToColor(z),
                        transition: 'background 0.5s ease',
                      }}
                      title={`${ratio} ${y}: z=${zToLabel(z)}`}
                    >
                      <span className="cell-value mono">{zToLabel(z)}</span>
                      {satyamOverlay && satyamOverlay[ratio]?.[y] != null && (
                        <span className="satyam-dot" title={`Satyam: ${satyamOverlay[ratio][y]}`}>
                          ◆
                        </span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
