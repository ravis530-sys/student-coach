import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Mic, MicOff, Volume2, VolumeX, RefreshCw } from 'lucide-react';
import { sendMessage } from '../../services/geminiService';
import { startListening, stopListening, speak, stopSpeaking, languageToTag, isSpeechRecognitionSupported } from '../../services/speechService';
import useAppStore from '../../store/appStore';
import toast from 'react-hot-toast';

function MessageBubble({ msg, onSpeak, isPlaying }) {
  const isAI = msg.role === 'model';
  return (
    <div className={`message-wrapper ${!isAI ? 'user' : ''}`}>
      <div className={`message-avatar ${isAI ? 'ai' : 'user-av'}`}>
        {isAI ? '🤖' : '👤'}
      </div>
      <div className={`message-bubble ${isAI ? 'ai-bubble' : 'user-bubble'}`}>
        {isAI ? (
          <div className="message-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
          </div>
        ) : (
          <div>{msg.content}</div>
        )}
        <div className="message-time">
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {isAI && (
            <button
              className="btn btn-ghost btn-icon"
              style={{ padding: '2px 6px', fontSize: '0.75rem', opacity: 0.7 }}
              onClick={() => onSpeak(msg.content)}
              title={isPlaying ? 'Stop' : 'Read aloud'}
            >
              {isPlaying ? <VolumeX size={13} /> : <Volume2 size={13} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="message-wrapper">
      <div className="message-avatar ai">🤖</div>
      <div className="message-bubble ai-bubble">
        <div className="dots-loader">
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}

export default function TutorChat({ mode }) {
  const {
    apiKey, messages, addMessage, clearMessages,
    uploadedFiles, uploadedContent, explanationLanguage, voiceEnabled,
    name, role, age, studentClass, board, teacherSubjects,
  } = useAppStore();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [playingMsgId, setPlayingMsgId] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const profile = useMemo(() => ({
    role, name, age, studentClass, board, teacherSubjects, mode, explanationLanguage
  }), [role, name, age, studentClass, board, teacherSubjects, mode, explanationLanguage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Send welcome message on mount
  useEffect(() => {
    if (messages.length === 0) {
      const materialLabel = uploadedFiles?.length > 1
        ? `${uploadedFiles.length} materials (${uploadedFiles.map(f => f.filename).join(', ')})`
        : uploadedContent?.filename || 'your material';

      const welcomes = {
        learn: uploadedContent
          ? `Hi ${name}! 👋 I've loaded your material **"${materialLabel}"**. What chapter or topic would you like to start with? I'll explain it in a simple, fun way! 🚀`
          : `Hi ${name}! 👋 Ready to learn something amazing today? You can upload PDFs, Word docs, images, or web links — or just tell me what topic you'd like to study! 📚`,
        qna: uploadedContent
          ? `Hi ${name}! 📖 I've read your study materials: **"${materialLabel}"**. Go ahead — ask me anything from them!`
          : `Hi ${name}! ❓ Ask me any question about your studies and I'll answer it clearly with examples!`,
        exam_prep: `Hi ${name}! 🎯 Let's prepare you for your board exams! Tell me which subject or topic you want to focus on, and I'll cover the most important points with exam tips! 💪`,
        quiz: uploadedContent
          ? `Hi ${name}! 🧠 Ready to test your knowledge on **"${materialLabel}"**? Type **"start quiz"** and I'll generate questions for you!`
          : `Hi ${name}! 🧠 Ready for a quiz? Tell me what subject or topic to quiz you on, and we'll begin!`,
        exam_generate: `Hello! 📝 Upload the chapters or notes you want to include, then configure the exam parameters to generate a complete model paper!`,
      };

      const welcome = welcomes[mode] || `Hello ${name}! How can I help you today?`;
      addMessage({ role: 'model', content: welcome, timestamp: Date.now(), id: 'welcome' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  const handleSend = useCallback(async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    if (!apiKey) {
      toast.error('Please set your Gemini API key in Settings ⚙️');
      return;
    }

    const userMsg = { role: 'user', content: userText, timestamp: Date.now(), id: Date.now() };
    addMessage(userMsg);
    setInput('');
    setLoading(true);

    try {
      const response = await sendMessage({
        apiKey,
        messages,
        newMessage: userText,
        context: uploadedContent?.text,
        profile,
      });

      const aiMsg = { role: 'model', content: response, timestamp: Date.now(), id: Date.now() + 1 };
      addMessage(aiMsg);

      // Auto-speak if voice enabled
      if (voiceEnabled) {
        speak({ text: response, language: languageToTag(explanationLanguage) });
      }
    } catch (err) {
      toast.error(`AI Error: ${err.message}`);
      addMessage({ role: 'model', content: '❌ Something went wrong. Please check your API key and try again.', timestamp: Date.now(), id: Date.now() + 2 });
    } finally {
      setLoading(false);
    }
  }, [input, loading, apiKey, messages, uploadedContent, profile, addMessage, voiceEnabled, explanationLanguage]);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleVoiceInput() {
    if (!isSpeechRecognitionSupported()) {
      toast.error('Voice input not supported in this browser. Try Chrome or Edge.');
      return;
    }

    if (listening) {
      stopListening();
      setListening(false);
      return;
    }

    setListening(true);
    startListening({
      language: languageToTag(explanationLanguage),
      onResult: (transcript, isFinal) => {
        setInput(transcript);
        if (isFinal) {
          setListening(false);
          if (transcript.trim()) handleSend(transcript.trim());
        }
      },
      onError: (err) => {
        setListening(false);
        toast.error(`Voice error: ${err}`);
      },
      onEnd: () => setListening(false),
    });
  }

  function handleSpeak(text) {
    if (playingMsgId) {
      stopSpeaking();
      setPlayingMsgId(null);
    } else {
      setPlayingMsgId(text);
      speak({
        text,
        language: languageToTag(explanationLanguage),
        onEnd: () => setPlayingMsgId(null),
      });
    }
  }

  const modeLabels = {
    learn: '📚 Learn Mode',
    qna: '❓ Q&A Mode',
    exam_prep: '🎯 Exam Prep',
    quiz: '🧠 Quiz Mode',
    exam_generate: '📝 Exam Generator',
  };

  return (
    <div className="chat-container" style={{ height: '100%' }}>
      {/* Topbar context */}
      <div style={{
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        borderBottom: '1px solid var(--border-subtle)',
        flexShrink: 0,
        flexWrap: 'wrap',
      }}>
        <span className="badge badge-primary">{modeLabels[mode]}</span>
        {uploadedFiles?.length > 1 ? (
          <span
            className="badge badge-emerald"
            style={{ maxWidth: '240px' }}
            title={uploadedFiles.map(f => f.filename).join(', ')}
          >
            <span className="truncate">📚 {uploadedFiles.length} files attached</span>
          </span>
        ) : uploadedContent ? (
          <span className="badge badge-emerald" style={{ maxWidth: '220px' }}>
            <span className="truncate">📄 {uploadedContent.filename}</span>
          </span>
        ) : null}
        <span className="badge badge-cyan">{explanationLanguage}</span>
        <div style={{ flex: 1 }} />
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => { clearMessages(); }}
          title="Clear chat"
        >
          <RefreshCw size={13} /> New Chat
        </button>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            onSpeak={handleSpeak}
            isPlaying={playingMsgId === msg.content}
          />
        ))}
        {loading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggestion chips */}
      {messages.length <= 2 && !loading && (
        <div style={{ padding: '8px 20px', display: 'flex', gap: '8px', flexWrap: 'wrap', flexShrink: 0 }}>
          {mode === 'learn' && [
            "Explain this chapter simply",
            "Give me real-life examples",
            "Summarize the key points",
          ].map(s => (
            <button key={s} className="chip" onClick={() => handleSend(s)}>{s}</button>
          ))}
          {mode === 'qna' && [
            "What is the main concept?",
            "I didn't understand, explain again",
            "Give me an example",
          ].map(s => (
            <button key={s} className="chip" onClick={() => handleSend(s)}>{s}</button>
          ))}
          {mode === 'exam_prep' && [
            "Most important topics",
            "Key definitions to remember",
            "How to write a perfect answer",
          ].map(s => (
            <button key={s} className="chip" onClick={() => handleSend(s)}>{s}</button>
          ))}
          {mode === 'quiz' && [
            "Start quiz",
            "Give me an easy question",
            "Quiz me on definitions",
          ].map(s => (
            <button key={s} className="chip" onClick={() => handleSend(s)}>{s}</button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="chat-input-area">
        <div className="chat-input-row">
          <button
            className={`btn btn-ghost btn-icon ${listening ? 'voice-pulse' : ''}`}
            style={{
              color: listening ? 'var(--accent-rose)' : 'var(--text-muted)',
              flexShrink: 0,
            }}
            onClick={handleVoiceInput}
            title={listening ? 'Stop listening' : 'Voice input'}
          >
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <textarea
            ref={textareaRef}
            className="chat-input"
            rows={1}
            placeholder={listening ? '🎤 Listening... speak now' : `Ask anything${uploadedContent ? ' about your material' : ''}... (Enter to send)`}
            value={input}
            onChange={e => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
            }}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            className="send-btn"
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            title="Send"
          >
            {loading ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <Send size={16} color="white" />}
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
          <p className="text-xs text-muted">
            Shift+Enter for new line • AI may make mistakes — always verify important facts
          </p>
        </div>
      </div>
    </div>
  );
}
