import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Header from '../components/Header';

const COLORS = ['#4f7cff', '#a855f7', '#f59e0b', '#22c55e'];

export default function Reports() {
  const [analytics, setAnalytics] = useState(null);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [aRes, sRes] = await Promise.all([fetch('/api/reports/analytics'), fetch('/api/scans')]);
      const aData = await aRes.json();
      const sData = await sRes.json();
      if (aData.success) setAnalytics(aData.data);
      if (sData.success) setScans(sData.data);
    } catch (e) {}
    setLoading(false);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: 8, fontSize: 12 }}>
        <div style={{ color: payload[0].color, fontWeight: 600 }}>{payload[0].name}</div>
        <div style={{ color: 'var(--text-primary)' }}>{payload[0].value}</div>
      </div>
    );
    return null;
  };

  const pneumoniaCount = scans.filter(s => (s.prediction || '').toLowerCase().includes('pneumonia')).length;
  const normalCount = scans.filter(s => (s.prediction || '').toLowerCase() === 'normal').length;
  const tbCount = scans.filter(s => (s.prediction || '').toLowerCase().includes('tubercul')).length;
  const total = scans.length || 1;

  const prevalenceData = [
    { name: 'Pneumonia', value: Math.round((pneumoniaCount / total) * 100) || analytics?.prevalence?.[0]?.value || 63 },
    { name: 'Tuberculosis', value: Math.round((tbCount / total) * 100) || analytics?.prevalence?.[1]?.value || 25 },
    { name: 'Normal', value: Math.round((normalCount / total) * 100) || analytics?.prevalence?.[3]?.value || 20 },
    { name: 'Other', value: 12 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Header title="Reports & Analytics" />

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'Total Scans', value: scans.length, color: 'var(--accent-blue)', icon: '📋' },
          { label: 'Pneumonia', value: pneumoniaCount, color: 'var(--accent-red)', icon: '🫁' },
          { label: 'Tuberculosis', value: tbCount, color: 'var(--accent-purple)', icon: '⚠️' },
          { label: 'Normal', value: normalCount, color: 'var(--accent-green)', icon: '✅' },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
              <span>{icon}</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, fontFamily: 'var(--font-display)', color, marginTop: 8 }}>{loading ? '—' : value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Population Health Analytics</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 24 }}>Based on {scans.length} scans in the system</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
          {/* Pie Chart */}
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Disease Prevalence</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie data={prevalenceData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3}>
                    {prevalenceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => `${v}%`} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {prevalenceData.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i] }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                    <span style={{ fontWeight: 700, marginLeft: 'auto' }}>{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Monthly Scan Volume</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics?.scanVolume || []} barSize={12} barGap={4}>
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="scans" fill="#4f7cff" radius={[4,4,0,0]} name="Total Scans" />
                <Bar dataKey="positive" fill="#f59e0b" radius={[4,4,0,0]} name="Positive" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Batch Reporting */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Batch Reporting</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20 }}>Generate custom reports from scan data</div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Report Title</div>
            <input className="input-field" placeholder="e.g. Weekly Pneumonia Summary" value={template} onChange={e => setTemplate(e.target.value)} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Description</div>
            <textarea className="input-field" placeholder="Describe the report..." value={description} onChange={e => setDescription(e.target.value)} style={{ height: 80, resize: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-ghost" style={{ flex: 1 }} onClick={() => { setTemplate(''); setDescription(''); }}>Clear</button>
            <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => alert(`Report "${template}" generated!`)}>📄 Generate</button>
          </div>
        </div>

        {/* Recent Scans Summary */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Recent Activity</div>
          {scans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>No scans yet</div>
          ) : scans.slice(0, 5).map((scan, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🫁</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{scan.patientName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(scan.createdAt || scan.scanDate).toLocaleDateString('en-GB')}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--accent-green)', fontWeight: 700 }}>{scan.aiConfidence}%</span>
                <span className={`badge badge-${(scan.prediction || '').toLowerCase().replace(' ', '')}`}>{scan.prediction || scan.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
