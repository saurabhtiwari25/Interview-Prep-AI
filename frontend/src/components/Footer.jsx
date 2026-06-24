import React, { useState, useEffect } from 'react';
import { Server, CheckCircle2, XCircle } from 'lucide-react';
import { healthService } from '../services/healthService';

const Footer = () => {
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        await healthService.checkStatus();
        setBackendStatus('connected');
      } catch (err) {
        setBackendStatus('disconnected');
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const renderStatusIndicator = () => {
    if (backendStatus === 'checking') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.64rem', color: 'var(--text-muted)' }}>
          <Server size={11} /> <span>Checking...</span>
        </div>
      );
    }
    if (backendStatus === 'connected') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.64rem', color: 'var(--success)' }}>
          <CheckCircle2 size={11} /> <span>Connected</span>
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.64rem', color: 'var(--danger)' }}>
        <XCircle size={11} /> <span>Not Connected</span>
      </div>
    );
  };

  return (
    <footer style={{
      display: 'flex',
      justifyContent: 'flex-end',
      padding: '20px',
      marginTop: 'auto'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-card, #fff)',
        padding: '6px 12px',
        borderRadius: '20px',
        border: '1px solid var(--border-color, #eaeaea)'
      }}>
        {renderStatusIndicator()}
      </div>
    </footer>
  );
};

export default Footer;
