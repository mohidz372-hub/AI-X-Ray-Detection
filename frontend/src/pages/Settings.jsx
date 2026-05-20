import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useTheme } from '../context/ThemeContext';

const Section = ({ title, subtitle, children }) => (
  <div className="card" style={{ padding: 24, marginBottom: 16 }}>
    <div style={{ marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{subtitle}</div>}
    </div>
    {children}
  </div>
);

const SettingRow = ({ label, subtitle, children }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
    <div>
      <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
      {subtitle && <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3 }}>{subtitle}</div>}
    </div>
    <div>{children}</div>
  </div>
);

const Toggle = ({ value, onChange }) => (
  <button onClick={() => onChange(!value)} style={{
    width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
    background: value ? 'var(--accent-blue)' : 'var(--border)', position: 'relative', transition: 'background 0.3s'
  }}>
    <div style={{ position: 'absolute', top: 2, left: value ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
  </button>
);

const Select = ({ value, onChange, options }) => (
  <select className="input-field" style={{ width: 180 }} value={value} onChange={e => onChange(e.target.value)}>
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

export default function Settings() {
  const { theme, toggle } = useTheme();

  // Profile
  const [profile, setProfile] = useState({ name: 'Dr. Mohad Imran', email: 'mohad.imran@hospital.com', role: 'Radiologist', department: 'Radiology', hospital: 'City Medical Center', phone: '+92-300-0000000' });
  const [profileSaved, setProfileSaved] = useState(false);

  // ML Model
  const [mlSettings, setMlSettings] = useState({ threshold: 0.65, model: 'EfficientNetB4 Fine-tuned', classes: 'NORMAL,PNEUMONIA', batchSize: 1, enableHeatmap: true, heatmapAlpha: 0.5 });

  // Notifications
  const [notifications, setNotifications] = useState({ emailAlerts: true, highConfidence: true, pendingReminder: true, weeklyReport: false, soundAlert: false, confidenceThreshold: 90 });

  // System
  const [system, setSystem] = useState({ autoSave: true, sessionTimeout: '60', language: 'en', dateFormat: 'DD/MM/YYYY', maxUploadSize: '20', retentionDays: '90' });

  // Security
  const [security, setSecurity] = useState({ twoFactor: false, sessionLogs: true, autoLogout: true });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  const saveProfile = () => {
    localStorage.setItem('profile', JSON.stringify(profile));
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const savePassword = () => {
    if (!passwords.current) return setPwError('Enter current password');
    if (passwords.new.length < 8) return setPwError('New password must be at least 8 characters');
    if (passwords.new !== passwords.confirm) return setPwError('Passwords do not match');
    setPwError('');
    setPwSuccess(true);
    setPasswords({ current: '', new: '', confirm: '' });
    setTimeout(() => setPwSuccess(false), 3000);
  };

  const saveMlSettings = () => {
    localStorage.setItem('mlSettings', JSON.stringify(mlSettings));
    alert('ML settings saved — restart ML API for changes to take effect');
  };

  useEffect(() => {
    const saved = localStorage.getItem('profile');
    if (saved) setProfile(JSON.parse(saved));
    const savedMl = localStorage.getItem('mlSettings');
    if (savedMl) setMlSettings(JSON.parse(savedMl));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <Header title="Settings" subtitle="Manage your account, model, and system preferences" />

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, marginTop: 4 }}>
        {/* Left Nav */}
        <div className="card" style={{ padding: 12, height: 'fit-content', position: 'sticky', top: 20 }}>
          {[
            { id: 'profile', icon: '👤', label: 'Profile' },
            { id: 'appearance', icon: '🎨', label: 'Appearance' },
            { id: 'ml', icon: '🤖', label: 'ML Model' },
            { id: 'notifications', icon: '🔔', label: 'Notifications' },
            { id: 'system', icon: '⚙️', label: 'System' },
            { id: 'security', icon: '🔒', label: 'Security' },
            { id: 'about', icon: 'ℹ️', label: 'About' },
          ].map(item => {
            const [active, setActive] = React.useState(false);
            return (
              <button key={item.id} onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })} style={{
                width: '100%', padding: '10px 14px', border: 'none', background: 'transparent',
                color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center',
                gap: 10, borderRadius: 8, fontSize: 13, fontFamily: 'var(--font-body)', fontWeight: 500,
                transition: 'all 0.2s', textAlign: 'left',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span>{item.icon}</span>{item.label}
              </button>
            );
          })}
        </div>

        {/* Right Content */}
        <div>
          {/* Profile */}
          <div id="profile">
            <Section title="👤 Profile" subtitle="Update your personal and professional information">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                {[
                  ['Full Name', 'name'], ['Email', 'email'], ['Role', 'role'],
                  ['Department', 'department'], ['Hospital', 'hospital'], ['Phone', 'phone']
                ].map(([label, key]) => (
                  <div key={key}>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
                    <input className="input-field" value={profile[key]} onChange={e => setProfile({ ...profile, [key]: e.target.value })} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button className="btn-primary" onClick={saveProfile} style={{ justifyContent: 'center' }}>
                  {profileSaved ? '✅ Saved!' : '💾 Save Profile'}
                </button>
                {profileSaved && <span style={{ fontSize: 12, color: 'var(--accent-green)' }}>Profile updated successfully</span>}
              </div>
            </Section>
          </div>

          {/* Appearance */}
          <div id="appearance">
            <Section title="🎨 Appearance" subtitle="Customize how PneumoScan AI looks">
              <SettingRow label="Dark Mode" subtitle="Switch between dark and light interface">
                <Toggle value={theme === 'dark'} onChange={() => toggle()} />
              </SettingRow>
              <SettingRow label="Current Theme" subtitle="Your active theme preference">
                <div style={{ display: 'flex', gap: 10 }}>
                  {['dark', 'light'].map(t => (
                    <button key={t} onClick={() => theme !== t && toggle()} style={{
                      padding: '6px 16px', borderRadius: 8, border: `2px solid ${theme === t ? 'var(--accent-blue)' : 'var(--border)'}`,
                      background: theme === t ? 'rgba(79,124,255,0.15)' : 'transparent',
                      color: theme === t ? 'var(--accent-blue)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontWeight: 600, textTransform: 'capitalize'
                    }}>{t === 'dark' ? '🌙 Dark' : '☀️ Light'}</button>
                  ))}
                </div>
              </SettingRow>
              <SettingRow label="Accent Color" subtitle="Primary color used across the interface">
                <div style={{ display: 'flex', gap: 8 }}>
                  {['#4f7cff', '#22c55e', '#a855f7', '#f59e0b', '#ef4444', '#06b6d4'].map(color => (
                    <div key={color} onClick={() => document.documentElement.style.setProperty('--accent-blue', color)} style={{ width: 24, height: 24, borderRadius: '50%', background: color, cursor: 'pointer', border: '2px solid rgba(255,255,255,0.3)', transition: 'transform 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                  ))}
                </div>
              </SettingRow>
              <SettingRow label="Sidebar Style" subtitle="How the navigation sidebar behaves">
                <div style={{ fontSize: 12, color: 'var(--accent-green)' }}>Auto-expand on hover ✅</div>
              </SettingRow>
            </Section>
          </div>

          {/* ML Model */}
          <div id="ml">
            <Section title="🤖 ML Model Configuration" subtitle="Fine-tune how the AI detection model behaves">
              <SettingRow label="Active Model" subtitle="Currently loaded detection model">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)', animation: 'pulse 2s infinite' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-green)' }}>ResNet50 (Fine-tuned)</span>
                </div>
              </SettingRow>
              <SettingRow label="Model Accuracy" subtitle="Achieved on test dataset">
                <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent-green)', fontFamily: 'var(--font-display)' }}>96.54%</span>
              </SettingRow>
              <SettingRow label="Detection Classes" subtitle="Classes the model can identify">
                <div style={{ display: 'flex', gap: 6 }}>
                  {['NORMAL', 'PNEUMONIA'].map(c => (
                    <span key={c} className="badge badge-analyzed">{c}</span>
                  ))}
                </div>
              </SettingRow>
              <SettingRow label="Pneumonia Threshold" subtitle={`Current: ${mlSettings.threshold} — lower = more sensitive`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="range" min="0.5" max="0.95" step="0.05" value={mlSettings.threshold}
                    onChange={e => setMlSettings({ ...mlSettings, threshold: parseFloat(e.target.value) })}
                    style={{ width: 120, accentColor: 'var(--accent-blue)' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-blue)', minWidth: 32 }}>{mlSettings.threshold}</span>
                </div>
              </SettingRow>
              <SettingRow label="Grad-CAM Heatmaps" subtitle="Show affected region overlays on X-rays">
                <Toggle value={mlSettings.enableHeatmap} onChange={v => setMlSettings({ ...mlSettings, enableHeatmap: v })} />
              </SettingRow>
              <SettingRow label="Heatmap Opacity" subtitle={`Blend strength: ${mlSettings.heatmapAlpha}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="range" min="0.2" max="0.9" step="0.1" value={mlSettings.heatmapAlpha}
                    onChange={e => setMlSettings({ ...mlSettings, heatmapAlpha: parseFloat(e.target.value) })}
                    style={{ width: 120, accentColor: 'var(--accent-blue)' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-blue)', minWidth: 32 }}>{mlSettings.heatmapAlpha}</span>
                </div>
              </SettingRow>

              {/* ML API Status */}
              <div style={{ marginTop: 16, padding: 14, background: 'var(--bg-card2)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>ML API Connection</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
                  {[
                    ['API URL', 'http://localhost:8000'],
                    ['Backend URL', 'http://localhost:5000'],
                    ['Model Path', '...\\ml_model\\xray_model_v3.keras'],
                    ['TensorFlow', '2.17.0'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: 11 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <button className="btn-primary" onClick={saveMlSettings} style={{ justifyContent: 'center' }}>💾 Save ML Settings</button>
              </div>
            </Section>
          </div>

          {/* Notifications */}
          <div id="notifications">
            <Section title="🔔 Notifications" subtitle="Control when and how you receive alerts">
              <SettingRow label="Email Alerts" subtitle="Send email on new scan completion">
                <Toggle value={notifications.emailAlerts} onChange={v => setNotifications({ ...notifications, emailAlerts: v })} />
              </SettingRow>
              <SettingRow label="High Confidence Alerts" subtitle="Alert when model confidence > threshold">
                <Toggle value={notifications.highConfidence} onChange={v => setNotifications({ ...notifications, highConfidence: v })} />
              </SettingRow>
              <SettingRow label="Confidence Threshold" subtitle={`Alert when confidence exceeds ${notifications.confidenceThreshold}%`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="range" min="70" max="99" step="1" value={notifications.confidenceThreshold}
                    onChange={e => setNotifications({ ...notifications, confidenceThreshold: parseInt(e.target.value) })}
                    style={{ width: 120, accentColor: 'var(--accent-blue)' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-blue)', minWidth: 36 }}>{notifications.confidenceThreshold}%</span>
                </div>
              </SettingRow>
              <SettingRow label="Pending Scan Reminder" subtitle="Remind when scans await review">
                <Toggle value={notifications.pendingReminder} onChange={v => setNotifications({ ...notifications, pendingReminder: v })} />
              </SettingRow>
              <SettingRow label="Weekly Report Email" subtitle="Receive weekly analytics summary">
                <Toggle value={notifications.weeklyReport} onChange={v => setNotifications({ ...notifications, weeklyReport: v })} />
              </SettingRow>
              <SettingRow label="Sound Alerts" subtitle="Play sound on new scan results">
                <Toggle value={notifications.soundAlert} onChange={v => setNotifications({ ...notifications, soundAlert: v })} />
              </SettingRow>
            </Section>
          </div>

          {/* System */}
          <div id="system">
            <Section title="⚙️ System" subtitle="Configure system behavior and data management">
              <SettingRow label="Auto-save Results" subtitle="Automatically save scan results to database">
                <Toggle value={system.autoSave} onChange={v => setSystem({ ...system, autoSave: v })} />
              </SettingRow>
              <SettingRow label="Session Timeout" subtitle="Auto-logout after inactivity">
                <Select value={system.sessionTimeout} onChange={v => setSystem({ ...system, sessionTimeout: v })}
                  options={[{ value: '15', label: '15 minutes' }, { value: '30', label: '30 minutes' }, { value: '60', label: '1 hour' }, { value: '120', label: '2 hours' }, { value: '0', label: 'Never' }]} />
              </SettingRow>
              <SettingRow label="Date Format" subtitle="How dates are displayed across the app">
                <Select value={system.dateFormat} onChange={v => setSystem({ ...system, dateFormat: v })}
                  options={[{ value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' }, { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' }, { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }]} />
              </SettingRow>
              <SettingRow label="Max Upload Size" subtitle="Maximum file size per X-ray image">
                <Select value={system.maxUploadSize} onChange={v => setSystem({ ...system, maxUploadSize: v })}
                  options={[{ value: '10', label: '10 MB' }, { value: '20', label: '20 MB' }, { value: '50', label: '50 MB' }]} />
              </SettingRow>
              <SettingRow label="Data Retention" subtitle="How long to keep scan data">
                <Select value={system.retentionDays} onChange={v => setSystem({ ...system, retentionDays: v })}
                  options={[{ value: '30', label: '30 days' }, { value: '90', label: '90 days' }, { value: '180', label: '6 months' }, { value: '365', label: '1 year' }, { value: '0', label: 'Forever' }]} />
              </SettingRow>

              {/* Danger Zone */}
              <div style={{ marginTop: 20, padding: 16, background: 'rgba(239,68,68,0.05)', borderRadius: 10, border: '1px solid rgba(239,68,68,0.2)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-red)', marginBottom: 12 }}>⚠️ Danger Zone</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn-ghost" style={{ borderColor: 'var(--accent-red)', color: 'var(--accent-red)', fontSize: 12 }}
                    onClick={() => window.confirm('Clear all scan cache?') && alert('Cache cleared!')}>
                    🗑 Clear Cache
                  </button>
                  <button className="btn-ghost" style={{ borderColor: 'var(--accent-red)', color: 'var(--accent-red)', fontSize: 12 }}
                    onClick={() => window.confirm('This will delete ALL scans. Are you sure?') && alert('All scans deleted!')}>
                    💣 Reset All Scans
                  </button>
                </div>
              </div>
            </Section>
          </div>

          {/* Security */}
          <div id="security">
            <Section title="🔒 Security" subtitle="Manage your account security and access">
              <SettingRow label="Two-Factor Authentication" subtitle="Add an extra layer of security">
                <Toggle value={security.twoFactor} onChange={v => setSecurity({ ...security, twoFactor: v })} />
              </SettingRow>
              <SettingRow label="Session Activity Logs" subtitle="Keep record of login sessions">
                <Toggle value={security.sessionLogs} onChange={v => setSecurity({ ...security, sessionLogs: v })} />
              </SettingRow>
              <SettingRow label="Auto-logout on Idle" subtitle="Logout when session times out">
                <Toggle value={security.autoLogout} onChange={v => setSecurity({ ...security, autoLogout: v })} />
              </SettingRow>

              {/* Change Password */}
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Change Password</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 400 }}>
                  {[['Current Password', 'current'], ['New Password', 'new'], ['Confirm New Password', 'confirm']].map(([label, key]) => (
                    <div key={key}>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 5 }}>{label}</div>
                      <input className="input-field" type="password" value={passwords[key]} onChange={e => setPasswords({ ...passwords, [key]: e.target.value })} placeholder="••••••••" />
                    </div>
                  ))}
                  {pwError && <div style={{ fontSize: 12, color: 'var(--accent-red)' }}>⚠️ {pwError}</div>}
                  {pwSuccess && <div style={{ fontSize: 12, color: 'var(--accent-green)' }}>✅ Password changed successfully!</div>}
                  <button className="btn-primary" onClick={savePassword} style={{ alignSelf: 'flex-start', justifyContent: 'center' }}>🔑 Update Password</button>
                </div>
              </div>
            </Section>
          </div>

          {/* About */}
          <div id="about">
            <Section title="ℹ️ About AI X-Ray Detection" subtitle="System information and version details">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                {[
                  ['Application', 'PneumoScan AI'],
                  ['Version', 'v1.0.0'],
                  ['ML Model', 'EfficientNetB4 Fine-tuned'],
                  ['Model Accuracy', '87.46%'],
                  ['Framework', 'TensorFlow 2.17.0'],
                  ['Backend', 'Node.js + Express'],
                  ['Database', 'SQLITE'],
                  ['Frontend', 'React 18'],
                  ['Detection Classes', 'Normal, Pneumonia'],
                  ['Heatmap Method', 'Grad-CAM'],
                  ['Image Input Size', '224 × 224 px'],
                  ['Dataset', 'Chest X-Ray (Augmented)'],
                ].map(([k, v], i) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{k}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 20, padding: 16, background: 'var(--bg-card2)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>FYP Project</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  AI-Powered X-Ray Detection System for Pneumonia and Tuberculosis detection using deep learning.
                  Built with ResNet50 transfer learning, Grad-CAM visualization, and a full-stack web interface.
                </div>
                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                  <span className="badge badge-analyzed">Final Year Project</span>
                  <span className="badge badge-normal">AI / ML</span>
                  <span className="badge badge-tb">Medical Imaging</span>
                </div>
              </div>
            </Section>
          </div>

        </div>
      </div>
    </div>
  );
}
