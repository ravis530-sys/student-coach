import { useState } from 'react';
import { X, Eye, EyeOff, Key, Globe, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import useAppStore, { ALL_LANGUAGES } from '../../store/appStore';
import toast from 'react-hot-toast';

export default function SettingsPanel() {
  const {
    apiKey, setApiKey,
    settingsOpen, toggleSettings,
    explanationLanguage, setExplanationLanguage,
    voiceEnabled, toggleVoice,
    name, role, studentClass, board, teacherSubjects,
    resetProfile,
  } = useAppStore();

  const [showKey, setShowKey] = useState(false);
  const [localKey, setLocalKey] = useState(apiKey);

  if (!settingsOpen) return null;

  function handleSaveKey() {
    setApiKey(localKey.trim());
    toast.success('API key saved!');
  }

  function handleReset() {
    if (confirm('Reset your profile? This will take you back to the onboarding screen.')) {
      resetProfile();
      toggleSettings();
      toast('Profile reset. Starting fresh! 🔄', { icon: '🔄' });
    }
  }

  return (
    <div className="settings-overlay" onClick={e => e.target === e.currentTarget && toggleSettings()}>
      <div className="glass-card settings-card">
        {/* Header */}
        <div className="settings-header">
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>⚙️ Settings</h2>
            <p className="text-xs text-muted" style={{ marginTop: '2px' }}>Configure your AI coach preferences</p>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={toggleSettings}>
            <X size={18} />
          </button>
        </div>

        <div className="settings-body">
          {/* Current Profile */}
          <div>
            <div className="input-label" style={{ marginBottom: '10px' }}>👤 Current Profile</div>
            <div style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(124,58,237,0.08)',
              border: '1px solid var(--border)',
              fontSize: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Name:</strong> {name}</div>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Role:</strong> <span style={{ textTransform: 'capitalize' }}>{role}</span></div>
              {role === 'student' && (
                <>
                  <div><strong style={{ color: 'var(--text-secondary)' }}>Class:</strong> {studentClass} Grade</div>
                  <div><strong style={{ color: 'var(--text-secondary)' }}>Board:</strong> {board}</div>
                </>
              )}
              {role === 'teacher' && (
                <div><strong style={{ color: 'var(--text-secondary)' }}>Subjects:</strong> {teacherSubjects?.join(', ') || 'None'}</div>
              )}
            </div>
          </div>

          {/* API Key */}
          <div>
            <div className="input-label">
              <Key size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Gemini API Key
            </div>
            <div className="api-key-input-wrapper">
              <input
                className="input"
                type={showKey ? 'text' : 'password'}
                placeholder="Enter your Gemini API key..."
                value={localKey}
                onChange={e => setLocalKey(e.target.value)}
              />
              <button className="api-toggle-btn" onClick={() => setShowKey(s => !s)}>
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="flex gap-2 mt-2">
              <button className="btn btn-primary btn-sm" onClick={handleSaveKey}>
                Save Key
              </button>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
              >
                Get Free Key ↗
              </a>
            </div>
            <p className="text-xs text-muted mt-2">Your API key is stored locally in your browser only.</p>
          </div>

          {/* Explanation Language */}
          <div>
            <div className="input-label">
              <Globe size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Explanation Language
            </div>
            <select
              className="select"
              value={explanationLanguage}
              onChange={e => {
                setExplanationLanguage(e.target.value);
                toast.success(`Language changed to ${e.target.value}`);
              }}
            >
              {ALL_LANGUAGES.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <p className="text-xs text-muted mt-2">AI will explain concepts in this language. Subject terms remain in English.</p>
          </div>

          {/* Voice */}
          <div>
            <div className="input-label">
              {voiceEnabled ? <Volume2 size={12} style={{ display: 'inline', marginRight: '4px' }} /> : <VolumeX size={12} style={{ display: 'inline', marginRight: '4px' }} />}
              Voice Responses
            </div>
            <div className="flex items-center gap-3">
              <button
                className={`btn ${voiceEnabled ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => { toggleVoice(); toast(voiceEnabled ? 'Voice disabled' : '🔊 Voice enabled!'); }}
              >
                {voiceEnabled ? '🔊 Voice On' : '🔇 Voice Off'}
              </button>
              <span className="text-xs text-muted">AI reads answers aloud</span>
            </div>
          </div>

          {/* Reset Profile */}
          <div className="border-t" style={{ paddingTop: '16px' }}>
            <button className="btn btn-danger w-full" onClick={handleReset}>
              <RotateCcw size={14} /> Reset Profile & Start Over
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
