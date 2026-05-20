import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ScansManagement from './pages/ScansManagement';
import PatientRecords from './pages/PatientRecords';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

const pages = {
  dashboard: Dashboard,
  scans: ScansManagement,
  patients: PatientRecords,
  reports: Reports,
  settings: Settings,
};

function AppContent() {
  const [activePage, setActivePage] = useState('dashboard');
  const PageComponent = pages[activePage] || Dashboard;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar active={activePage} setActive={setActivePage} />
      <main style={{
        marginLeft: 64, flex: 1, padding: '28px 32px',
        maxWidth: 'calc(100vw - 64px)', overflowX: 'hidden', transition: 'all 0.3s'
      }}>
        <div className="fade-in" key={activePage}>
          <PageComponent />
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return <ThemeProvider><AppContent /></ThemeProvider>;
}
