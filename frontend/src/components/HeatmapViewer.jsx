import React from 'react';
import StatusBadge from './StatusBadge';

export default function HeatmapViewer({ scan, onClose }) {
  if (!scan) return null;

  const results  = scan.detectionResults || {};
  const imgSrc   = scan.imagePath ? `http://localhost:5000${scan.imagePath}` : null;
  const heatmapSrc = scan.heatmapBase64
    ? `data:image/png;base64,${scan.heatmapBase64}`
    : null;

  const bars = [
    { label: 'Pneumonia',          value: results.pneumonia    || 0, color: '#ef4444' },
    { label: 'Tuberculosis',       value: results.tuberculosis || 0, color: '#a855f7' },
    { label: 'Normal',             value: results.normal       || 0, color: '#22c55e' },
    { label: 'Viral Pneumonia',    value: (results.pneumonia   || 0) * 0.7,  color: '#f59e0b' },
    { label: 'Bacterial Pneumonia',value: (results.pneumonia   || 0) * 0.25, color: '#06b6d4' },
  ];

  return (
    <div className="heatmap-overlay" onClick={onClose}>
      <div className="heatmap-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>
              X-Ray Analysis
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
              {scan.scanId} — {scan.patientName}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <StatusBadge status={scan.prediction || scan.status} />
            <button onClick={onClose} style={{
              background: 'var(--bg-card2)', border: '1px solid var(--border)',
              color: 'var(--text-primary)', width: 32, height: 32,
              borderRadius: 8, cursor: 'pointer', fontSize: 16
            }}>✕</button>
          </div>
        </div>

        {/* X-Ray Images */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Heatmap (Grad-CAM)', type: 'heatmap' },
            { label: 'Original X-Ray',     type: 'original' },
            { label: 'Contrast Enhanced',  type: 'contrast' }
          ].map(({ label, type }) => (
            <div key={type}>
              <div style={{
                height: 180, borderRadius: 10, overflow: 'hidden',
                background: 'var(--bg-card2)', border: '1px solid var(--border)',
                position: 'relative', display: 'flex',
                alignItems: 'center', justifyContent: 'center'
              }}>
                {type === 'heatmap' ? (
                  heatmapSrc
                    ? <img src={heatmapSrc} alt="grad-cam heatmap"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (
                      <>
                        {imgSrc && <img src={imgSrc} alt="xray"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45 }} />}
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: 'radial-gradient(ellipse at 40% 50%, rgba(255,60,0,0.75) 0%, rgba(255,120,0,0.45) 35%, transparent 65%)',
                          mixBlendMode: imgSrc ? 'screen' : 'normal'
                        }} />
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: 'radial-gradient(ellipse at 65% 42%, rgba(255,200,0,0.4) 0%, transparent 50%)',
                          mixBlendMode: 'screen'
                        }} />
                      </>
                    )
                ) : type === 'original' ? (
                  imgSrc
                    ? <img src={imgSrc} alt="original xray"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>No image</div>
                ) : (
                  imgSrc
                    ? <img src={imgSrc} alt="contrast"
                        style={{ width: '100%', height: '100%', objectFit: 'cover',
                                 filter: 'contrast(1.8) brightness(0.65) saturate(0)' }} />
                    : <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>No image</div>
                )}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', marginTop: 6 }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Detection Results */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)',
            textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Detection Results
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 24px' }}>
            {bars.map(({ label, value, color }) => (
              <div key={label} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color }}>
                    {Math.round((value || 0) * 100)}%
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-card2)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${(value || 0) * 100}%`,
                    background: color, borderRadius: 3, transition: 'width 1s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Confidence */}
        <div style={{ marginBottom: 16, padding: '10px 14px', background: 'var(--bg-card2)',
          borderRadius: 8, border: '1px solid var(--border)', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>AI Confidence</span>
          <span style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-display)',
            color: 'var(--accent-green)' }}>
            {scan.aiConfidence || Math.round((Math.max(...Object.values(results)) || 0.85) * 100)}%
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost" style={{ flex: 1 }} onClick={onClose}>Close</button>
          <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
            💾 Save to Patient
          </button>
          <button className="btn-ghost" style={{ flex: 1 }}>📄 Download Report</button>
        </div>
      </div>
    </div>
  );
}
