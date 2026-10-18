import { useState } from 'react';
import { FileText, Download, Copy, Settings2, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { generateExamPaper } from '../../services/geminiService';
import UploadZone from '../Upload/UploadZone';
import useAppStore from '../../store/appStore';
import toast from 'react-hot-toast';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Mixed'];

export default function ExamGenerator() {
  const { apiKey, uploadedContent, teacherSubjects } = useAppStore();

  const [config, setConfig] = useState({
    subjects: teacherSubjects?.filter(s => s !== 'All Subjects') || [],
    className: '',
    difficulty: 'Medium',
    totalMarks: 80,
    numMCQ: 20,
    numShort: 8,
    numLong: 4,
    duration: '3 Hours',
  });

  const [generatedPaper, setGeneratedPaper] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(true);

  const allSubjects = teacherSubjects?.includes('All Subjects')
    ? ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi']
    : (teacherSubjects || []);

  function updateConfig(key, val) {
    setConfig(prev => ({ ...prev, [key]: val }));
  }

  function toggleSubject(sub) {
    setConfig(prev => ({
      ...prev,
      subjects: prev.subjects.includes(sub)
        ? prev.subjects.filter(s => s !== sub)
        : [...prev.subjects, sub],
    }));
  }

  async function handleGenerate() {
    if (!apiKey) { toast.error('Please set your API key in Settings ⚙️'); return; }
    if (!config.subjects.length) { toast.error('Select at least one subject'); return; }

    setLoading(true);
    setGeneratedPaper('');
    const tid = toast.loading('Generating model paper... 📝');

    try {
      const paper = await generateExamPaper({
        apiKey,
        context: uploadedContent?.text,
        config,
        profile: { subjects: config.subjects, className: config.className },
      });
      setGeneratedPaper(paper);
      setShowConfig(false);
      toast.success('Model paper generated! 🎉', { id: tid });
    } catch (err) {
      toast.error(`Failed: ${err.message}`, { id: tid });
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(generatedPaper);
    toast.success('Copied to clipboard!');
  }

  function handleDownload() {
    const blob = new Blob([generatedPaper], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `model-paper-${config.subjects.join('-')}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  }

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }}>
          📝 Exam Paper Generator
        </h1>
        <p className="text-secondary text-sm">Upload chapters, configure, and generate a complete model question paper</p>
      </div>

      {/* Upload */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📂 Source Material <span className="badge badge-amber">Optional</span>
        </div>
        <UploadZone />
        <p className="text-xs text-muted mt-2">If no file is uploaded, the AI generates questions based on standard curriculum for the selected subject and class.</p>
      </div>

      {/* Config */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '16px' }}>
        <button
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-primary)',
          }}
          onClick={() => setShowConfig(s => !s)}
        >
          <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings2 size={16} /> Exam Configuration
          </div>
          {showConfig ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showConfig && (
          <div style={{ marginTop: '16px' }}>
            {/* Subjects */}
            <div className="input-group">
              <label className="input-label">Subjects</label>
              <div className="chips-grid">
                {allSubjects.map(sub => (
                  <div
                    key={sub}
                    className={`chip ${config.subjects.includes(sub) ? 'selected' : ''}`}
                    onClick={() => toggleSubject(sub)}
                  >
                    {config.subjects.includes(sub) ? '✓ ' : ''}{sub}
                  </div>
                ))}
              </div>
            </div>

            <div className="exam-config">
              <div className="input-group">
                <label className="input-label">Class / Grade</label>
                <input
                  className="input"
                  placeholder="e.g., 10th Grade, Class 12"
                  value={config.className}
                  onChange={e => updateConfig('className', e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Difficulty</label>
                <select className="select" value={config.difficulty} onChange={e => updateConfig('difficulty', e.target.value)}>
                  {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Total Marks</label>
                <input
                  className="input"
                  type="number"
                  min={20} max={200}
                  value={config.totalMarks}
                  onChange={e => updateConfig('totalMarks', e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Duration</label>
                <select className="select" value={config.duration} onChange={e => updateConfig('duration', e.target.value)}>
                  {['1 Hour', '1.5 Hours', '2 Hours', '2.5 Hours', '3 Hours', '3.5 Hours'].map(d => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">MCQ Questions (1 mark each)</label>
                <input
                  className="input"
                  type="number"
                  min={0} max={50}
                  value={config.numMCQ}
                  onChange={e => updateConfig('numMCQ', e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Short Answer (3 marks each)</label>
                <input
                  className="input"
                  type="number"
                  min={0} max={20}
                  value={config.numShort}
                  onChange={e => updateConfig('numShort', e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Long Answer (5 marks each)</label>
                <input
                  className="input"
                  type="number"
                  min={0} max={10}
                  value={config.numLong}
                  onChange={e => updateConfig('numLong', e.target.value)}
                />
              </div>
            </div>

            <button
              className="btn btn-primary btn-lg w-full"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <><div className="spinner" style={{ width: 18, height: 18 }} /> Generating Paper...</>
              ) : (
                <><FileText size={16} /> Generate Model Paper</>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Generated Paper */}
      {generatedPaper && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ✅ Generated Model Paper
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
                <Copy size={13} /> Copy
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleDownload}>
                <Download size={13} /> Download .txt
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowConfig(true)}>
                <Settings2 size={13} /> Reconfigure
              </button>
            </div>
          </div>
          <div className="exam-output">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{generatedPaper}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
