import React, { useState } from 'react';
import { X, Sparkles, Check, User as UserIcon, Mail, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from './Avatar';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUserProfile } = useAuth();
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_display || user?.avatar_url || '');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleRandomizeAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`;
    setAvatarUrl(newAvatar);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      await updateUserProfile({
        first_name: firstName,
        last_name: lastName,
        bio: bio,
        avatar_url: avatarUrl,
      });
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Your Profile</h2>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
            <Avatar src={avatarUrl} alt={user?.username} size="lg" />
            <button
              type="button"
              onClick={handleRandomizeAvatar}
              style={{
                marginTop: 10,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 999,
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid var(--border-active)',
                color: 'var(--text-primary)',
                fontSize: 12,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              <Sparkles size={14} /> Randomize Avatar
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Username</label>
            <div className="input-with-icon">
              <UserIcon size={16} className="input-icon" />
              <input
                type="text"
                className="form-input"
                value={user?.username || ''}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
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
                value={user?.email || ''}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: 14 }}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Alex"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: 14 }}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Rivera"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Bio / Status</label>
            <div className="input-with-icon">
              <FileText size={16} className="input-icon" />
              <input
                type="text"
                className="form-input"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Hey there! I am using PulseChat."
              />
            </div>
          </div>

          {successMsg && (
            <div style={{ color: 'var(--online)', fontSize: 13, marginBottom: 14, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Check size={16} /> {successMsg}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1 }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
