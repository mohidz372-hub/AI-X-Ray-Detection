import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import StatusBadge from '../components/StatusBadge';

const Modal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({ name: '', contact: '', age: '', gender: 'Male', ageGroup: '30-39' });
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="card" style={{ padding: 28, width: 420, maxWidth: '90vw' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Add New Patient</div>
        {[['Full Name', 'name', 'text'], ['Contact', 'contact', 'text'], ['Age', 'age', 'number']].map(([label, key, type]) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</div>
            <input className="input-field" type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
          </div>
        ))}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Gender</div>
          <select className="input-field" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
            {['Male', 'Female', 'Other'].map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Age Group</div>
          <select className="input-field" value={form.ageGroup} onChange={e => setForm({ ...form, ageGroup: e.target.value })}>
            {['0-18', '18-29', '30-39', '40-49', '50-60+'].map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
          <button className="btn-primary" onClick={() => { onSave(form); onClose(); }} style={{ flex: 1, justifyContent: 'center' }}>Save Patient</button>
        </div>
      </div>
    </div>
  );
};

export default function PatientRecords() {
  const [patients, setPatients] = useState([]);
  const [scans, setScans] = useState([]);
  const [search, setSearch] = useState('');
  const [filterBy, setFilterBy] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, sRes] = await Promise.all([fetch('/api/patients'), fetch('/api/scans')]);
      const pData = await pRes.json();
      const sData = await sRes.json();
      if (pData.success) setPatients(pData.data);
      if (sData.success) setScans(sData.data);
    } catch (e) {}
    setLoading(false);
  };

  const getLastScan = (patientId) => scans.filter(s => s.patientId === patientId).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

  const handleAdd = async (data) => {
    try {
      const res = await fetch('/api/patients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const result = await res.json();
      if (result.success) setPatients(prev => [result.data, ...prev]);
    } catch (e) {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this patient?')) return;
    try {
      await fetch(`/api/patients/${id}`, { method: 'DELETE' });
      setPatients(prev => prev.filter(p => p.patientId !== id));
    } catch (e) {}
  };

  const filtered = patients.filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.patientId?.includes(search));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {showModal && <Modal onClose={() => setShowModal(false)} onSave={handleAdd} />}
      <Header title="Patient Records" />

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20 }}>
        {/* Sidebar Filters */}
        <div className="card" style={{ padding: 18, height: 'fit-content' }}>
          <div style={{ fontWeight: 600, marginBottom: 16 }}>Filters</div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase' }}>Status</div>
            {['All', 'Analyzed', 'Flagged', 'Pending'].map(s => (
              <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, cursor: 'pointer', fontSize: 13 }}>
                <input type="radio" name="filterStatus" checked={filterBy === s} onChange={() => setFilterBy(s)} style={{ accentColor: 'var(--accent-blue)' }} />
                {s}
              </label>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: '12px 0', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total patients</div>
            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent-blue)' }}>{patients.length}</div>
          </div>
        </div>

        {/* Patient Table */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>Patient List</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input className="input-field" placeholder="🔍 Search patients..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 200 }} />
              <button className="btn-primary" onClick={() => setShowModal(true)}>+ Add Patient</button>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
          ) : paginated.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>👤</div>
              <div>No patients found</div>
            </div>
          ) : (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Patient ID', 'Name', 'Contact', 'Age', 'Last Scan', 'Last Status', 'Actions'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((p, i) => {
                    const lastScan = getLastScan(p.patientId);
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '11px 12px', fontWeight: 600, color: 'var(--accent-blue)' }}>{p.patientId}</td>
                        <td style={{ padding: '11px 12px', fontWeight: 500 }}>{p.name}</td>
                        <td style={{ padding: '11px 12px', color: 'var(--text-secondary)' }}>{p.contact || '—'}</td>
                        <td style={{ padding: '11px 12px', color: 'var(--text-secondary)' }}>{p.age || '—'}</td>
                        <td style={{ padding: '11px 12px', color: 'var(--text-secondary)' }}>{lastScan ? new Date(lastScan.createdAt).toLocaleDateString('en-GB') : '—'}</td>
                        <td style={{ padding: '11px 12px' }}>{lastScan ? <StatusBadge status={lastScan.prediction || lastScan.status} /> : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>No scans</span>}</td>
                        <td style={{ padding: '11px 12px' }}>
                          <button onClick={() => handleDelete(p.patientId)} style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontSize: 15 }}>🗑</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                <span>Showing {paginated.length} of {filtered.length}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} className="btn-ghost" style={{ padding: '4px 10px' }} disabled={page === 1}>‹</button>
                  <span style={{ background: 'var(--accent-blue)', color: '#fff', padding: '3px 10px', borderRadius: 6 }}>{page}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="btn-ghost" style={{ padding: '4px 10px' }} disabled={page === totalPages}>›</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
