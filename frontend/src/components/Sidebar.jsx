import React, { useState } from 'react';

const navItems = [
  { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
  { id: 'scans', icon: '🫁', label: 'Scans Upload' },
  { id: 'patients', icon: '👤', label: 'Patients' },
  { id: 'reports', icon: '📊', label: 'Reports' },
];

export default function Sidebar({ active, setActive }) {
  const [expanded, setExpanded] = useState(false);

  const NavBtn = ({ id, icon, label, bottom }) => (
    <button onClick={() => setActive(id)} title={label} style={{
      width: expanded ? '80%' : 44, height: 44, borderRadius: 10, border: 'none', cursor: 'pointer',
      background: active === id ? 'rgba(79,124,255,0.15)' : 'transparent',
      color: active === id ? 'var(--accent-blue)' : 'var(--text-muted)',
      fontSize: 18, display: 'flex', alignItems: 'center',
      justifyContent: expanded ? 'flex-start' : 'center',
      transition: 'all 0.2s',
      borderLeft: active === id ? '2px solid var(--accent-blue)' : '2px solid transparent',
      margin: expanded ? '2px 10%' : '2px auto',
      padding: expanded ? '0 12px' : 0, gap: 10
    }}
      onMouseEnter={e => { if (active !== id) e.currentTarget.style.background = 'var(--bg-hover)'; }}
      onMouseLeave={e => { if (active !== id) e.currentTarget.style.background = 'transparent'; }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      {expanded && <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', color: active === id ? 'var(--accent-blue)' : 'var(--text-secondary)' }}>{label}</span>}
    </button>
  );

  return (
    <aside style={{
      width: expanded ? 200 : 64,
      background: 'var(--bg-card)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '20px 0', position: 'fixed', top: 0, left: 0, height: '100vh',
      zIndex: 100, transition: 'width 0.3s ease', overflow: 'hidden',
      boxShadow: 'var(--shadow)'
    }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', marginBottom: 28, width: '100%', justifyContent: expanded ? 'flex-start' : 'center' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #4f7cff, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff', flexShrink: 0 }}>P</div>
        {expanded && <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'nowrap', lineHeight: 1.2 }}>PneumoScan<br /><span style={{ fontSize: 10, color: 'var(--accent-blue)', fontWeight: 500 }}>AI Detection</span></div>}
      </div>

      {/* Main Nav */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flex: 1 }}>
        {navItems.map(item => <NavBtn key={item.id} {...item} />)}
      </div>

      {/* Divider */}
      <div style={{ width: expanded ? '80%' : 36, height: 1, background: 'var(--border)', margin: '8px auto' }} />

      {/* Bottom Nav */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, paddingBottom: 8 }}>
        <NavBtn id="settings" icon="⚙️" label="Settings" />
      </div>
    </aside>
  );
}
