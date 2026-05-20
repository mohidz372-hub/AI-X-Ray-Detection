import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Header from '../components/Header';
import StatusBadge from '../components/StatusBadge';
import HeatmapViewer from '../components/HeatmapViewer';

export default function ScansManagement() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanType, setScanType] = useState('Chest X-ray');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [scans, setScans] = useState([]);
  const [selectedScan, setSelectedScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [patientName, setPatientName] = useState('');

  useEffect(() => { fetchScans(); }, []);

  const fetchScans = async () => {
    try {
      const res = await fetch('/api/scans');
      const data = await res.json();
      if (data.success) setScans(data.data);
    } catch (e) {}
    setLoading(false);
  };

  const onDrop = useCallback(accepted => setFiles(prev => [...prev, ...accepted]), []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.bmp'] }, multiple: true
  });

  const handleUpload = async () => {
    if (!files.length) return;
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    files.forEach(f => formData.append('images', f));
    formData.append('patientName', patientName || 'Unknown Patient');
    formData.append('scanType', scanType);

    try {
      const prog = setInterval(() => setProgress(p => Math.min(p + 8, 90)), 200);
      await fetch('/api/scans/upload', { method: 'POST', body: formData });
      clearInterval(prog);
      setProgress(100);
      setTimeout(async () => {
        await fetchScans();
        setUploading(false);
        setFiles([]);
        setProgress(0);
        setPatientName('');
      }, 500);
    } catch (e) {
      setUploading(false);
      alert('Upload failed. Check backend is running.');
    }
  };

  const handleDelete = async (scanId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this scan?')) return;
    try {
      await fetch(`/api/scans/${scanId}`, { method: 'DELETE' });
      setScans(prev => prev.filter(s => s.scanId !== scanId));
    } catch (e) {}
  };

  const filtered = scans.filter(s => {
    const matchStatus = statusFilter === 'All' || s.status === statusFilter || s.prediction === statusFilter;
    const matchSearch = !search || s.patientName?.toLowerCase().includes(search.toLowerCase()) || s.scanId?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Header title="Scans Management & Upload" />
      {selectedScan && <HeatmapViewer scan={selectedScan} onClose={() => setSelectedScan(null)} />}

      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Upload Card */}
          <div className="card" style={{ padding: 22 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Upload X-Ray</div>

            {/* Patient Name */}
            <div style={{ marginBottom: 12 }}>
              <input className="input-field" placeholder="Patient name (optional)" value={patientName} onChange={e => setPatientName(e.target.value)} />
            </div>

            {/* Dropzone */}
            <div {...getRootProps()} style={{
              border: `2px dashed ${isDragActive ? 'var(--accent-blue)' : 'var(--border)'}`,
              borderRadius: 12, padding: '36px 20px', textAlign: 'center', cursor: 'pointer',
              background: isDragActive ? 'rgba(79,124,255,0.05)' : 'var(--bg-card2)',
              transition: 'all 0.2s', marginBottom: 14
            }}>
              <input {...getInputProps()} />
              <div style={{ fontSize: 36, marginBottom: 10 }}>🫁</div>
              <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 15 }}>
                {isDragActive ? 'Drop X-Rays here...' : 'Drag & Drop X-Rays'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Supports JPG, PNG, BMP — up to 20MB each</div>
            </div>

            {/* Progress */}
            {uploading && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                  <span>Uploading & analyzing...</span><span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>{progress}%</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-purple))', borderRadius: 4, transition: 'width 0.2s' }} />
                </div>
              </div>
            )}

            {/* File List */}
            {files.map((f, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-card2)', borderRadius: 8, marginBottom: 8, fontSize: 12, border: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>📄 {f.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{(f.size / 1024).toFixed(1)} KB</span>
                  <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontSize: 14 }}>✕</button>
                </div>
              </div>
            ))}

            {files.length > 0 && (
              <button className="btn-primary" onClick={handleUpload} disabled={uploading} style={{ width: '100%', marginTop: 4, justifyContent: 'center', opacity: uploading ? 0.7 : 1 }}>
                {uploading ? '⏳ Processing...' : `🚀 Upload ${files.length} Scan(s)`}
              </button>
            )}
          </div>

          {/* Recent Uploads Table */}
          <div className="card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>Recent Uploads</div>
              <input className="input-field" placeholder="🔍 Search patient or scan..." value={search}
                onChange={e => setSearch(e.target.value)} style={{ width: 220 }} />
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                <div>No scans found</div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Scan ID', 'Patient', 'Date', 'Status', 'Confidence', 'Actions'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((scan, i) => (
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
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={e => { e.stopPropagation(); setSelectedScan(scan); }}>🔍</button>
                            <button style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontSize: 15 }} onClick={e => handleDelete(scan.scanId, e)}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right', marginTop: 12 }}>{filtered.length} scans</div>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 18 }}>
            <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 14 }}>Filters</div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>Scan Type</div>
              {['Chest X-ray', 'CT'].map(t => (
                <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, cursor: 'pointer', fontSize: 13 }}>
                  <input type="radio" name="scanType" checked={scanType === t} onChange={() => setScanType(t)} style={{ accentColor: 'var(--accent-blue)' }} />
                  {t}
                </label>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>Status</div>
              {['All', 'Analyzed', 'Pending', 'Flagged', 'Normal'].map(s => (
                <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, cursor: 'pointer', fontSize: 13 }}>
                  <input type="radio" name="status" checked={statusFilter === s} onChange={() => setStatusFilter(s)} style={{ accentColor: 'var(--accent-blue)' }} />
                  {s}
                </label>
              ))}
            </div>
          </div>

          {/* Stats Card */}
          <div className="card" style={{ padding: 18 }}>
            <div style={{ fontWeight: 600, marginBottom: 14, fontSize: 14 }}>Summary</div>
            {[
              { label: 'Total Scans', value: scans.length, color: 'var(--accent-blue)' },
              { label: 'Analyzed', value: scans.filter(s => s.status === 'Analyzed' || s.status === 'Normal').length, color: 'var(--accent-green)' },
              { label: 'Pending', value: scans.filter(s => s.status === 'Pending').length, color: 'var(--accent-yellow)' },
              { label: 'Flagged', value: scans.filter(s => s.status === 'Flagged').length, color: 'var(--accent-red)' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.label}</span>
                <span style={{ fontWeight: 700, color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
