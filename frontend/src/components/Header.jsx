import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Header({ title, subtitle }) {
  const { theme, toggle } = useTheme();
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h1>
        {subtitle && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>{subtitle}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>{theme === 'dark' ? '🌙' : '☀️'}</span>
          <button className={`theme-toggle ${theme}`} onClick={toggle}>
            <div className="theme-toggle-knob" />
          </button>
        </div>
        <div style={{ width: 1, height: 24, background: 'var(--border)' }} />
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Dr. Mohad Imran</span>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #4f7cff, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>N</div>
      </div>
    </div>
  );
}
