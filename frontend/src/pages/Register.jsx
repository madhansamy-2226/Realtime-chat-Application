import React, { useState } from 'react';
import { User, Mail, Lock, FileText, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Common/Avatar';

const Register = ({ onNavigateToLogin }) => {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [bio, setBio] = useState('Hey there! I am using PulseChat.');
  const [avatarUrl, setAvatarUrl] = useState(`https://api.dicebear.com/7.x/avataaars/svg?seed=user_${Math.random()}`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRandomize = () => {
    const seed = Math.random().toString(36).substring(7);
    setAvatarUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register({
        username,
        email,
        password,
        password_confirm: passwordConfirm,
        bio,
        avatar_url: avatarUrl,
      });
    } catch (err) {
      console.error('Registration error:', err);
      const data = err.response?.data;
      if (data) {
        const errorMsgs = Object.entries(data)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join('\n');
        setError(errorMsgs);
      } else {
        setError('Failed to create account.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-brand">
          <h1 className="brand-title">Create Account</h1>
          <p className="brand-subtitle">Join PulseChat and start messaging in real time</p>
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
              alignItems: 'flex-start',
              gap: 8,
              marginBottom: 18,
              whiteSpace: 'pre-wrap',
            }}
          >
            <AlertCircle size={16} style={{ marginTop: 2, flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Avatar selector */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 20 }}>
            <Avatar src={avatarUrl} alt="Avatar" size="lg" />
            <div>
              <button
                type="button"
                onClick={handleRandomize}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  borderRadius: 999,
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid var(--border-active)',
                  color: 'var(--text-primary)',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                <Sparkles size={14} /> New Avatar
              </button>
              <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 4 }}>Click to roll random avatar</div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Username</label>
            <div className="input-with-icon">
              <User size={16} className="input-icon" />
              <input
                type="text"
                className="form-input"
                placeholder="e.g. dev_jordan"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                className="form-input"
                placeholder="jordan@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
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

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label">Status / Bio</label>
            <div className="input-with-icon">
              <FileText size={16} className="input-icon" />
              <input
                type="text"
                className="form-input"
                placeholder="About you..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating Account...' : 'Complete Sign Up'} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={onNavigateToLogin}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
