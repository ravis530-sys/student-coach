import { useState } from 'react';
import useAppStore, { ROLES, CLASSES, BOARDS, SUBJECTS, ALL_LANGUAGES } from '../../store/appStore';

const STEPS = [
  'role',
  'name', 
  'details',
  'mode-intro',
];

export default function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [localRole, setLocalRole] = useState(null);
  const [localName, setLocalName] = useState('');
  const [localAge, setLocalAge] = useState('');
  const [localClass, setLocalClass] = useState('');
  const [localBoard, setLocalBoard] = useState('');
  const [localSubjects, setLocalSubjects] = useState([]);
  const { setProfile, completeOnboarding, setApiKey, apiKey } = useAppStore();

  const totalSteps = 4;

  function toggleSubject(sub) {
    if (sub === 'All Subjects') {
      setLocalSubjects(['All Subjects']);
      return;
    }
    setLocalSubjects(prev => {
      const filtered = prev.filter(s => s !== 'All Subjects');
      return filtered.includes(sub)
        ? filtered.filter(s => s !== sub)
        : [...filtered, sub];
    });
  }

  function canProceed() {
    if (step === 0) return localRole !== null;
    if (step === 1) return localName.trim().length >= 2;
    if (step === 2) {
      if (localRole === 'student') return localAge && localClass && localBoard;
      if (localRole === 'teacher') return localSubjects.length > 0;
    }
    return true;
  }

  function handleNext() {
    if (step < totalSteps - 1) {
      setStep(s => s + 1);
    } else {
      setProfile({
        role: localRole,
        name: localName.trim(),
        age: localAge,
        studentClass: localClass,
        board: localBoard,
        teacherSubjects: localSubjects,
      });
      completeOnboarding();
    }
  }

  function handleBack() {
    setStep(s => Math.max(0, s - 1));
  }

  return (
    <div className="onboarding-overlay">
      <div className="bg-animated" />
      <div className="glass-card onboarding-card">
        {/* Step Indicators */}
        <div className="wizard-header">
          <div className="step-indicator">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`step-dot ${i === step ? 'active' : i < step ? 'done' : ''}`}
              />
            ))}
          </div>
          <div className="wizard-title">
            {step === 0 && '👋 Welcome!'}
            {step === 1 && '✨ Nice to meet you!'}
            {step === 2 && localRole === 'student' && '🎒 Your Details'}
            {step === 2 && localRole === 'teacher' && '📚 Your Subjects'}
            {step === 3 && '🚀 You\'re all set!'}
          </div>
          <div className="wizard-subtitle">
            {step === 0 && 'Tell me who you are so I can personalize your experience'}
            {step === 1 && 'What should I call you?'}
            {step === 2 && localRole === 'student' && 'A few more things to tailor your learning'}
            {step === 2 && localRole === 'teacher' && 'Which subjects do you teach?'}
            {step === 3 && 'Your AI learning assistant is ready!'}
          </div>
        </div>

        <div className="wizard-body">
          {/* Step 0: Role Selection */}
          {step === 0 && (
            <div className="role-cards">
              <div
                className={`role-card ${localRole === 'student' ? 'selected' : ''}`}
                onClick={() => setLocalRole('student')}
              >
                <div className="role-emoji">🎓</div>
                <div className="role-name">Student</div>
                <div className="role-desc">Learn topics, take quizzes & prepare for exams</div>
              </div>
              <div
                className={`role-card ${localRole === 'teacher' ? 'selected' : ''}`}
                onClick={() => setLocalRole('teacher')}
              >
                <div className="role-emoji">👨🏫</div>
                <div className="role-name">Teacher</div>
                <div className="role-desc">Generate exam papers & create study material</div>
              </div>
            </div>
          )}

          {/* Step 1: Name */}
          {step === 1 && (
            <div className="input-group">
              <label className="input-label">Your Name</label>
              <input
                className="input"
                type="text"
                placeholder={localRole === 'student' ? 'e.g., Arjun, Priya...' : 'e.g., Mr. Sharma, Ms. Priya...'}
                value={localName}
                onChange={e => setLocalName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && canProceed() && handleNext()}
                autoFocus
              />
              {!apiKey && (
                <div style={{ marginTop: '16px' }}>
                  <label className="input-label">🔑 Gemini API Key (Required)</label>
                  <input
                    className="input"
                    type="password"
                    placeholder="Enter your Google Gemini API key..."
                    onChange={e => setApiKey(e.target.value)}
                  />
                  <p className="text-xs text-muted mt-2">
                    Get a free key at{' '}
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">
                      aistudio.google.com
                    </a>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Student Details */}
          {step === 2 && localRole === 'student' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Your Age</label>
                <select className="select" value={localAge} onChange={e => setLocalAge(e.target.value)}>
                  <option value="">Select your age</option>
                  {Array.from({ length: 20 }, (_, i) => i + 5).map(a => (
                    <option key={a} value={a}>{a} years old</option>
                  ))}
                </select>
              </div>
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Class / Grade</label>
                <select className="select" value={localClass} onChange={e => setLocalClass(e.target.value)}>
                  <option value="">Select your class</option>
                  {CLASSES.map(c => (
                    <option key={c} value={c}>{c} Grade</option>
                  ))}
                </select>
              </div>
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Board / Curriculum</label>
                <select className="select" value={localBoard} onChange={e => setLocalBoard(e.target.value)}>
                  <option value="">Select your board</option>
                  {BOARDS.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Teacher Subjects */}
          {step === 2 && localRole === 'teacher' && (
            <div>
              <div className="chips-grid">
                {SUBJECTS.map(sub => (
                  <div
                    key={sub}
                    className={`chip ${localSubjects.includes(sub) ? 'selected' : ''}`}
                    onClick={() => toggleSubject(sub)}
                  >
                    {localSubjects.includes(sub) ? '✓ ' : ''}{sub}
                  </div>
                ))}
              </div>
              {localSubjects.length > 0 && (
                <p className="text-xs text-muted mt-3">
                  Selected: {localSubjects.join(', ')}
                </p>
              )}
            </div>
          )}

          {/* Step 3: All Set */}
          {step === 3 && (
            <div className="text-center" style={{ padding: '20px 0' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🎉</div>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                Hello <strong style={{ color: 'var(--primary-light)' }}>{localName}</strong>! Your AI coach is personalized for your
                {localRole === 'student' ? (
                  <> <strong style={{ color: 'var(--secondary-light)' }}>{localClass} grade</strong> {localBoard} curriculum. 🚀</>
                ) : (
                  <> <strong style={{ color: 'var(--secondary-light)' }}>{localSubjects.join(', ')}</strong> classes. 🏫</>
                )}
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '12px' }}>
                You can change your language preference or API key anytime from Settings ⚙️
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center" style={{ marginTop: '28px', gap: '12px' }}>
            {step > 0 ? (
              <button className="btn btn-ghost" onClick={handleBack}>
                ← Back
              </button>
            ) : <div />}
            <button
              className="btn btn-primary btn-round"
              onClick={handleNext}
              disabled={!canProceed()}
            >
              {step === totalSteps - 1 ? '🚀 Start Learning' : 'Continue →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
