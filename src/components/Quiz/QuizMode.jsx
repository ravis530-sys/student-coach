import { useState, useEffect } from 'react';
import { ChevronRight, RotateCcw, Trophy, X, CheckCircle, XCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateQuiz } from '../../services/geminiService';
import useAppStore from '../../store/appStore';
import toast from 'react-hot-toast';

function ScoreCard({ score, total, questions, onRetry, onExit }) {
  const pct = Math.round((score / total) * 100);
  const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '🌟' : pct >= 40 ? '💪' : '📚';
  const msg = pct >= 80 ? 'Excellent work!' : pct >= 60 ? 'Good job! Keep practicing!' : pct >= 40 ? "Not bad! Let's review and try again!" : "Let's study more and try again! You've got this!";

  return (
    <div className="glass-card score-card quiz-card">
      <div style={{ fontSize: '3rem', marginBottom: '12px' }}>{emoji}</div>
      <div
        className="score-circle"
        style={{ '--pct': pct }}
      >
        <div className="score-number">{score}/{total}</div>
      </div>
      <h2 style={{ fontSize: '1.5rem', marginTop: '16px', marginBottom: '6px' }}>{msg}</h2>
      <p className="text-secondary" style={{ fontSize: '0.9rem' }}>You scored <strong style={{ color: 'var(--primary-light)' }}>{pct}%</strong></p>

      {/* Per-question breakdown */}
      <div style={{ marginTop: '24px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {questions.map((q, i) => (
          <div key={q.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: '10px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: q.userCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.08)',
            border: `1px solid ${q.userCorrect ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}`,
            fontSize: '0.83rem',
          }}>
            {q.userCorrect
              ? <CheckCircle size={15} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: 2 }} />
              : <XCircle size={15} color="var(--accent-rose)" style={{ flexShrink: 0, marginTop: 2 }} />
            }
            <div>
              <div style={{ fontWeight: 600 }}>Q{i + 1}: {q.question}</div>
              {!q.userCorrect && (
                <div style={{ color: 'var(--accent-emerald)', marginTop: '4px', fontSize: '0.78rem' }}>
                  ✓ Correct: {q.correct}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'center' }}>
        <button className="btn btn-secondary" onClick={onRetry}>
          <RotateCcw size={14} /> Try Again
        </button>
        <button className="btn btn-primary" onClick={onExit}>
          Back to Modes
        </button>
      </div>
    </div>
  );
}

export default function QuizMode({ onExit }) {
  const { apiKey, uploadedContent, explanationLanguage, name, role, age, studentClass, board } = useAppStore();
  const [quizData, setQuizData] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [shortInput, setShortInput] = useState('');
  const [loading, setLoading] = useState(false);

  const profile = { role, name, age, studentClass, board, explanationLanguage };

  useEffect(() => {
    startQuiz();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startQuiz() {
    if (!apiKey) { toast.error('Set your API key in Settings first!'); return; }
    setLoading(true);
    setQuizData(null);
    setCurrentIdx(0);
    setSelected(null);
    setSubmitted(false);
    setScore(0);
    setDone(false);
    setAnswers([]);

    const tid = toast.loading('Generating quiz questions... 🧠');
    try {
      const data = await generateQuiz({ apiKey, context: uploadedContent?.text, profile });
      setQuizData(data);
      toast.success(`Quiz ready! ${data.questions.length} questions`, { id: tid });
    } catch (err) {
      toast.error(`Failed to generate quiz: ${err.message}`, { id: tid });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="quiz-container" style={{ textAlign: 'center', paddingTop: '60px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🧠</div>
        <div className="dots-loader" style={{ justifyContent: 'center', marginBottom: '12px' }}>
          <span /><span /><span />
        </div>
        <p className="text-secondary">Generating personalized questions for you...</p>
      </div>
    );
  }

  if (!quizData) return null;

  const questions = quizData.questions;
  const totalQuestions = questions.length;

  if (done) {
    return (
      <div className="quiz-container">
        <ScoreCard
          score={score}
          total={totalQuestions}
          questions={answers}
          onRetry={startQuiz}
          onExit={onExit}
        />
      </div>
    );
  }

  const q = questions[currentIdx];

  function checkAnswer(answer) {
    const isCorrect = answer.trim().toLowerCase() === q.correct.trim().toLowerCase();
    setSubmitted(true);
    setSelected(answer);
    if (isCorrect) setScore(s => s + 1);
    setAnswers(prev => [...prev, { ...q, userAnswer: answer, userCorrect: isCorrect }]);
  }

  function handleNext() {
    if (currentIdx + 1 >= totalQuestions) {
      setDone(true);
    } else {
      setCurrentIdx(i => i + 1);
      setSelected(null);
      setSubmitted(false);
      setShortInput('');
    }
  }

  const pct = Math.round((currentIdx / totalQuestions) * 100);

  return (
    <div className="quiz-container">
      {/* Progress */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span className="badge badge-primary">Question {currentIdx + 1} of {totalQuestions}</span>
          <span className="badge badge-emerald">Score: {score}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="glass-card quiz-card">
        <div className="quiz-question-num">
          {q.type === 'mcq' ? '🔤 Multiple Choice' : q.type === 'truefalse' ? '✅ True or False' : '✍️ Short Answer'}
        </div>
        <div className="quiz-question-text">{q.question}</div>

        {/* MCQ or True/False */}
        {(q.type === 'mcq' || q.type === 'truefalse') && (
          <div className="quiz-options">
            {q.options.map((opt) => {
              let cls = 'quiz-option';
              if (submitted) {
                if (opt === q.correct) cls += ' correct';
                else if (opt === selected && opt !== q.correct) cls += ' incorrect';
              }
              return (
                <button
                  key={opt}
                  className={cls}
                  disabled={submitted}
                  onClick={() => checkAnswer(opt)}
                >
                  {submitted && opt === q.correct && '✅ '}
                  {submitted && opt === selected && opt !== q.correct && '❌ '}
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {/* Short Answer */}
        {q.type === 'shortanswer' && !submitted && (
          <div>
            <input
              className="quiz-short-answer-input"
              placeholder="Type your answer..."
              value={shortInput}
              onChange={e => setShortInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && shortInput.trim() && checkAnswer(shortInput)}
            />
            <button
              className="btn btn-primary mt-3"
              disabled={!shortInput.trim()}
              onClick={() => checkAnswer(shortInput)}
            >
              Submit Answer
            </button>
          </div>
        )}

        {q.type === 'shortanswer' && submitted && (
          <div className="quiz-options">
            <div className={`quiz-option ${selected.trim().toLowerCase() === q.correct.trim().toLowerCase() ? 'correct' : 'incorrect'}`}>
              Your answer: {selected}
            </div>
            {selected.trim().toLowerCase() !== q.correct.trim().toLowerCase() && (
              <div className="quiz-option correct">✅ Correct answer: {q.correct}</div>
            )}
          </div>
        )}

        {/* Explanation */}
        {submitted && (
          <div className="quiz-explanation">
            <div style={{ fontWeight: 600, marginBottom: '6px', color: 'var(--primary-light)' }}>
              💡 Explanation
            </div>
            <ReactMarkdown>{q.explanation}</ReactMarkdown>
          </div>
        )}

        {/* Next */}
        {submitted && (
          <button className="btn btn-primary mt-4" onClick={handleNext}>
            {currentIdx + 1 >= totalQuestions ? '🏁 See Results' : 'Next Question'} <ChevronRight size={16} />
          </button>
        )}
      </div>

      <button className="btn btn-ghost btn-sm mt-3" onClick={onExit} style={{ opacity: 0.6 }}>
        <X size={13} /> Exit Quiz
      </button>
    </div>
  );
}
