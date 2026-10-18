import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import useAppStore from './store/appStore';
import OnboardingWizard from './components/Onboarding/OnboardingWizard';
import Sidebar from './components/Layout/Sidebar';
import Topbar from './components/Layout/Topbar';
import SettingsPanel from './components/Settings/SettingsPanel';
import HomePage from './pages/HomePage';
import TutorChat from './components/Chat/TutorChat';
import QuizMode from './components/Quiz/QuizMode';
import ExamGenerator from './components/ExamGenerator/ExamGenerator';
import UploadZone from './components/Upload/UploadZone';
import './styles/index.css';

const CHAT_MODES = ['learn', 'qna', 'exam_prep'];

export default function App() {
  const { onboardingComplete, role } = useAppStore();
  const [currentView, setCurrentView] = useState('home');

  // If onboarding not done, show wizard
  if (!onboardingComplete) {
    return (
      <>
        <div className="bg-animated" />
        <OnboardingWizard />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              backdropFilter: 'blur(20px)',
            },
          }}
        />
      </>
    );
  }

  function handleNavigate(view) {
    setCurrentView(view);
  }

  function renderContent() {
    if (currentView === 'home') {
      return <HomePage onNavigate={handleNavigate} />;
    }

    if (currentView === 'upload') {
      return (
        <div className="content-area" style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>
              📂 Upload Study Material
            </h1>
            <p className="text-secondary text-sm">
              Upload your textbook, notes, or any document to study with AI
            </p>
          </div>
          <div className="glass-card" style={{ padding: '24px' }}>
            <UploadZone />
          </div>
          <div style={{
            marginTop: '16px',
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(124, 58, 237, 0.06)',
            border: '1px solid var(--border)',
            fontSize: '0.83rem',
            color: 'var(--text-secondary)',
          }}>
            <strong style={{ color: 'var(--primary-light)' }}>Supported formats:</strong> PDF, Word (.docx), 
            Images (PNG, JPG, JPEG, WebP), Plain Text (.txt), and Web URLs.
            <br /><br />
            After uploading, go to any mode (Learn, Q&A, Quiz) and the AI will use your material automatically.
          </div>
        </div>
      );
    }

    if (CHAT_MODES.includes(currentView)) {
      return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <TutorChat mode={currentView} />
        </div>
      );
    }

    if (currentView === 'quiz') {
      return (
        <div style={{ height: '100%', overflowY: 'auto' }}>
          <QuizMode onExit={() => setCurrentView('home')} />
        </div>
      );
    }

    if (currentView === 'exam_generate') {
      return (
        <div style={{ height: '100%', overflowY: 'auto' }}>
          <ExamGenerator />
        </div>
      );
    }

    return <HomePage onNavigate={handleNavigate} />;
  }

  return (
    <>
      <div className="bg-animated" />
      <div className="app-shell">
        <Sidebar currentView={currentView} onNavigate={handleNavigate} />
        <div className="main-area">
          <Topbar currentView={currentView} />
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {renderContent()}
          </div>
        </div>
      </div>
      <SettingsPanel />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#12122f',
            color: '#f0f0ff',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            backdropFilter: 'blur(20px)',
            borderRadius: '12px',
            fontSize: '0.88rem',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#f43f5e', secondary: '#fff' } },
        }}
      />
    </>
  );
}
