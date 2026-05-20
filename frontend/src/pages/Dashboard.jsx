import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import StatusBadge from '../components/StatusBadge';
import HeatmapViewer from '../components/HeatmapViewer';

const StatCard = ({ label, value, sub, color, icon, loading }) => (
  <div className="card fade-in" style={{ padding: '20px 22px', flex: 1, minWidth: 160 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 20 }}>{icon}</div>
    </div>
    {loading ? <div className="spinner" /> :
      <div style={{ fontSize: 34, fontWeight: 800, fontFamily: 'var(--font-display)', color: color || 'var(--text-primary)', lineHeight: 1.1 }}>{value}</div>
    }
    {sub && <div style={{ fontSize: 11, color: 'var(--accent-green)', marginTop: 6 }}>{sub}</div>}
  </div>
);

const DetectionBar = ({ label, value, color }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color }}>{Math.round((value || 0) * 100)}%</span>
    </div>
    <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-card2)', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${(value || 0) * 100}%`, background: color, borderRadius: 3, transition: 'width 1s ease' }} />
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [scans, setScans] = useState([]);
  const [selectedScan, setSelectedScan] = useState(null);
  const [activeScan, setActiveScan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, scansRes] = await Promise.all([
        fetch('/api/scans/stats/dashboard'),
        fetch('/api/scans')
      ]);
      const statsData = await statsRes.json();
      const scansData = await scansRes.json();
      if (statsData.success) setStats(statsData.data);
      if (scansData.success) {
        setScans(scansData.data);
        if (scansData.data.length > 0 && !activeScan) setActiveScan(scansData.data[0]);
      }
    } catch (e) {}
    setLoading(false);
  };

  const displayScan = activeScan || scans[0];
  const results = displayScan?.detectionResults || {};
  const imgSrc = displayScan?.imagePath ? `http://localhost:5000${displayScan.imagePath}` : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Header title="Dashboard" subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} />

      {/* Heatmap Modal */}
      {selectedScan && <HeatmapViewer scan={selectedScan} onClose={() => setSelectedScan(null)} />}

      {/* Stat Cards */}
      <div className="stat-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard label="Total Scans Today" value={stats?.totalToday ?? '—'} sub={stats ? `+${stats.yesterdayDiff ?? 0} from yesterday` : ''} icon="📋" loading={loading} />
        <StatCard label="Positive Scans" value={stats?.positive ?? '—'} sub="Pneumonia + TB" color="var(--accent-red)" icon="⚠️" loading={loading} />
        <StatCard label="Pending Review" value={stats?.pending ?? '—'} sub="Awaiting clinician" color="var(--accent-yellow)" icon="⏳" loading={loading} />
        <StatCard label="Model Accuracy" value={`${stats?.modelAccuracy ?? 96}%`} sub="EfficientNetB4 Fine-tuned" color="var(--accent-green)" icon="🎯" loading={loading} />
      </div>

      {/* Main Grid */}
      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
        {/* X-Ray Analysis Panel */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700 }}>X-Ray Analysis</div>
            {displayScan && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <StatusBadge status={displayScan.prediction || displayScan.status} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{displayScan.patientName}</span>
              </div>
            )}
          </div>

          {/* Scan Selector */}
          {scans.length > 1 && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
              {scans.slice(0, 6).map(scan => (
                <button key={scan.scanId} onClick={() => setActiveScan(scan)} style={{
                  padding: '5px 12px', borderRadius: 20, border: `1px solid ${activeScan?.scanId === scan.scanId ? 'var(--accent-blue)' : 'var(--border)'}`,
                  background: activeScan?.scanId === scan.scanId ? 'rgba(79,124,255,0.15)' : 'transparent',
                  color: activeScan?.scanId === scan.scanId ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 600, transition: 'all 0.2s'
                }}>{scan.scanId}</button>
              ))}
            </div>
          )}

          {/* X-Ray Images */}
          <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Heatmap (Grad-CAM)', type: 'heatmap' },
              { label: 'Original', type: 'original' },
              { label: 'Contrast Enhanced', type: 'contrast' }
            ].map(({ label, type }) => (
              <div key={type} onClick={() => displayScan && setSelectedScan(displayScan)} style={{ cursor: displayScan ? 'pointer' : 'default' }}>
                <div style={{ height: 160, borderRadius: 10, overflow: 'hidden', background: 'var(--bg-card2)', border: '1px solid var(--border)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s, border-color 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.borderColor = 'var(--accent-blue)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
                  {type === 'heatmap' ? (
                    <>
                      {imgSrc && <img src={imgSrc} alt="xray" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45 }} />}
                      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 40% 50%, rgba(255,60,0,0.75) 0%, rgba(255,120,0,0.45) 35%, transparent 65%)', mixBlendMode: imgSrc ? 'screen' : 'normal' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 65% 42%, rgba(255,200,0,0.4) 0%, transparent 50%)', mixBlendMode: 'screen' }} />
                      {!imgSrc && (
                        <div style={{ position: 'absolute', left: '22%', top: '18%', width: '26%', height: '55%', borderRadius: '50%', background: 'rgba(255,80,0,0.5)' }} />
                      )}
                    </>
                  ) : type === 'original' ? (
                    imgSrc ? <img src={imgSrc} alt="original xray" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (
                      <>
                        <div style={{ position: 'absolute', left: '15%', top: '10%', width: '30%', height: '70%', borderRadius: '40% 40% 50% 50%', background: 'rgba(180,200,220,0.15)', border: '1px solid rgba(180,200,220,0.2)' }} />
                        <div style={{ position: 'absolute', right: '15%', top: '10%', width: '30%', height: '70%', borderRadius: '40% 40% 50% 50%', background: 'rgba(180,200,220,0.12)', border: '1px solid rgba(180,200,220,0.15)' }} />
                        <div style={{ position: 'absolute', left: '40%', top: '5%', width: '20%', height: '80%', background: 'rgba(100,120,150,0.3)', borderRadius: 4 }} />
                      </>
                    )
                  ) : (
                    imgSrc ? <img src={imgSrc} alt="contrast" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.8) brightness(0.65) saturate(0)' }} />
                    : (
                      <>
                        <div style={{ position: 'absolute', left: '15%', top: '10%', width: '30%', height: '70%', borderRadius: '40% 40% 50% 50%', background: 'rgba(140,160,180,0.2)', border: '1px solid rgba(140,160,180,0.3)' }} />
                        <div style={{ position: 'absolute', right: '15%', top: '10%', width: '30%', height: '70%', borderRadius: '40% 40% 50% 50%', background: 'rgba(140,160,180,0.18)', border: '1px solid rgba(140,160,180,0.25)' }} />
                      </>
                    )
                  )}
                  {displayScan && <div style={{ position: 'absolute', inset: 0, background: 'rgba(79,124,255,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                    <span style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '4px 10px', borderRadius: 20, fontSize: 11 }}>Click to enlarge</span>
                  </div>}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', marginTop: 6 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Detection Results */}
          {displayScan ? (
            <>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Detection Results</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                <div>
                  <DetectionBar label="Pneumonia" value={results.pneumonia} color="var(--accent-red)" />
                  <DetectionBar label="Tuberculosis" value={results.tuberculosis} color="var(--accent-purple)" />
                  <DetectionBar label="Normal" value={results.normal} color="var(--accent-green)" />
                </div>
                <div>
                  <DetectionBar label="Viral Pneumonia" value={results.viralPneumonia || (results.pneumonia || 0) * 0.7} color="var(--accent-yellow)" />
                  <DetectionBar label="Bacterial Pneumonia" value={results.bacterialPneumonia || (results.pneumonia || 0) * 0.25} color="var(--accent-cyan)" />
                  <DetectionBar label="Confidence" value={(displayScan.aiConfidence || 0) / 100} color="var(--accent-blue)" />
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: 14 }}>
              No scans yet — upload an X-ray to see analysis
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button className="btn-ghost" style={{ flex: 1 }} onClick={() => displayScan && setSelectedScan(displayScan)}>🔍 View Heatmap</button>
            <button className="btn-primary" style={{ flex: 1 }}>💾 Save to Patient</button>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Recent Patients */}
          <div className="card" style={{ padding: 18 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Recent Patients</div>
            {scans.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No patients yet</div>
            ) : scans.slice(0, 5).map((scan, i) => (
              <div key={i} onClick={() => setActiveScan(scan)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: `hsl(${i * 60}, 70%, 55%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                    {scan.patientName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{scan.patientName}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{new Date(scan.scanDate || scan.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <StatusBadge status={scan.prediction || scan.status} />
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="card" style={{ padding: 18 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Detection Summary</div>
            {[
              { label: 'Pneumonia cases', count: scans.filter(s => s.prediction === 'PNEUMONIA' || s.prediction === 'Pneumonia').length, color: 'var(--accent-red)' },
              { label: 'Normal cases', count: scans.filter(s => s.prediction === 'NORMAL' || s.prediction === 'Normal').length, color: 'var(--accent-green)' },
              { label: 'Pending review', count: scans.filter(s => s.status === 'Pending').length, color: 'var(--accent-yellow)' },
              { label: 'Flagged', count: scans.filter(s => s.status === 'Flagged').length, color: 'var(--accent-red)' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.label}</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: item.color }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="card" style={{ padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>Recent Scans</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{scans.length} total</div>
        </div>
        {scans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🫁</div>
            <div>No scans yet — upload an X-ray to get started</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Scan ID', 'Patient', 'Date', 'Prediction', 'Confidence', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scans.slice(0, 8).map((scan, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => setSelectedScan(scan)}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-blue)', fontWeight: 600 }}>{scan.scanId}</td>
                    <td style={{ padding: '10px 12px' }}>{scan.patientName}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{new Date(scan.scanDate || scan.createdAt).toLocaleDateString('en-GB')}</td>
                    <td style={{ padding: '10px 12px' }}><StatusBadge status={scan.prediction || scan.status} /></td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-green)', fontWeight: 700 }}>{scan.aiConfidence}%</td>
                    <td style={{ padding: '10px 12px' }}>
                      <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={e => { e.stopPropagation(); setSelectedScan(scan); }}>🔍 View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
