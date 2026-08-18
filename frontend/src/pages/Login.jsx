import React, { useState } from 'react';
import { User, Lock, MessageSquare, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  { username: 'madhan', label: 'Madhan' },
  { username: 'santhosh', label: 'Santhosh' },
  { username: 'manoj', label: 'Manoj' },
];

const Login = ({ onNavigateToRegister }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.detail || 'Invalid username or password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (uName) => {
    setUsername(uName);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-icon-box">
            <MessageSquare size={28} />
          </div>
          <h1 className="brand-title">Welcome to PulseChat</h1>
          <p className="brand-subtitle">Real-time messaging with Django & WebSockets</p>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              color: '#f87171',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 18,
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div className="input-with-icon">
              <User size={16} className="input-icon" />
              <input
                type="text"
                className="form-input"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={16} />
          </button>
        </form>

        {/* Demo Quick Fill Buttons */}
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border-subtle)' }}>
          <div
            style={{
              fontSize: 12,
              color: 'var(--text-subtle)',
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              justifyContent: 'center',
            }}
          >
            <Sparkles size={13} color="var(--primary)" /> Demo Test Accounts (Pass: password123)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.username}
                type="button"
                className="quick-fill-btn"
                onClick={() => handleQuickFill(acc.username)}
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onNavigateToRegister}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Create one
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
