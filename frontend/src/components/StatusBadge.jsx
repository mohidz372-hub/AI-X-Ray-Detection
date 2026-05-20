import React from 'react';

export default function StatusBadge({ status }) {
  const s = (status || '').toLowerCase();
  const cls = s.includes('pneumonia') ? 'badge-pneumonia' :
    s === 'normal' ? 'badge-normal' :
    s === 'pending' ? 'badge-pending' :
    s === 'flagged' ? 'badge-flagged' :
    s.includes('tubercul') ? 'badge-tb' :
    s === 'analyzed' ? 'badge-analyzed' : 'badge-pending';
  return <span className={`badge ${cls}`}>{status || 'Unknown'}</span>;
}
