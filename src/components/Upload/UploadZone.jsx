import { useState, useRef } from 'react';
import { Upload, Link, X, FileText, Image, File } from 'lucide-react';
import { parseFile, parseURL, getFileTypeIcon } from '../../services/fileParser';
import useAppStore from '../../store/appStore';
import toast from 'react-hot-toast';

const ACCEPTED = '.pdf,.docx,.doc,.png,.jpg,.jpeg,.webp,.txt,.md';

export default function UploadZone({ compact = false }) {
  const { uploadedContent, setUploadedContent, clearContent } = useAppStore();
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrl, setShowUrl] = useState(false);
  const inputRef = useRef();

  async function handleFiles(files) {
    if (!files?.length) return;
    const file = files[0];
    setLoading(true);
    const tid = toast.loading(`Parsing ${file.name}...`);
    try {
      const result = await parseFile(file);
      setUploadedContent(result);
      toast.success(`✅ ${file.name} loaded!`, { id: tid });
    } catch (err) {
      toast.error(`Failed: ${err.message}`, { id: tid });
    } finally {
      setLoading(false);
    }
  }

  async function handleURL() {
    if (!urlInput.trim()) return;
    setLoading(true);
    const tid = toast.loading('Fetching URL...');
    try {
      const result = await parseURL(urlInput.trim());
      setUploadedContent(result);
      toast.success('🔗 URL content loaded!', { id: tid });
      setUrlInput('');
      setShowUrl(false);
    } catch (err) {
      toast.error('Could not fetch URL', { id: tid });
    } finally {
      setLoading(false);
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  if (uploadedContent && compact) {
    return (
      <div className="uploaded-file-card">
        <span className="file-icon">{getFileTypeIcon(uploadedContent.type)}</span>
        <div className="file-info" style={{ flex: 1, minWidth: 0 }}>
          <div className="filename truncate">{uploadedContent.filename}</div>
          <div className="filemeta">
            {uploadedContent.type?.toUpperCase()}
            {uploadedContent.pageCount ? ` · ${uploadedContent.pageCount} pages` : ''}
            {uploadedContent.text ? ` · ${Math.round(uploadedContent.text.length / 5)} words` : ''}
          </div>
        </div>
        <button className="btn btn-ghost btn-icon" onClick={clearContent} title="Remove file">
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div>
      {!uploadedContent ? (
        <>
          <div
            className={`upload-zone ${dragging ? 'drag-over' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED}
              style={{ display: 'none' }}
              onChange={e => handleFiles(e.target.files)}
            />
            <div className="upload-icon">
              {loading ? '⏳' : '📂'}
            </div>
            <div className="upload-title">
              {loading ? 'Processing file...' : 'Drop your study material here'}
            </div>
            <div className="upload-hint">
              or click to browse
            </div>
            <div className="upload-types">
              <span className="badge badge-primary"><FileText size={10}/> PDF</span>
              <span className="badge badge-cyan"><File size={10}/> Word</span>
              <span className="badge badge-amber"><Image size={10}/> Image</span>
              <span className="badge badge-emerald">📃 TXT</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', alignItems: 'center' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
            <span className="text-xs text-muted">or</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          </div>

          {showUrl ? (
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <input
                className="input"
                placeholder="Paste a URL (Wikipedia, article, etc.)..."
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleURL()}
                autoFocus
              />
              <button className="btn btn-primary" onClick={handleURL} disabled={loading}>
                Load
              </button>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowUrl(false)}>
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              className="btn btn-secondary w-full"
              style={{ marginTop: '10px' }}
              onClick={() => setShowUrl(true)}
            >
              <Link size={14} /> Paste a URL
            </button>
          )}
        </>
      ) : (
        <div>
          <div className="uploaded-file-card">
            <span className="file-icon" style={{ fontSize: '2rem' }}>{getFileTypeIcon(uploadedContent.type)}</span>
            <div className="file-info" style={{ flex: 1, minWidth: 0 }}>
              <div className="filename truncate">{uploadedContent.filename}</div>
              <div className="filemeta">
                {uploadedContent.type?.toUpperCase()}
                {uploadedContent.pageCount ? ` · ${uploadedContent.pageCount} pages` : ''}
                {uploadedContent.text ? ` · ~${Math.round(uploadedContent.text.length / 5).toLocaleString()} words extracted` : ''}
              </div>
            </div>
            <button className="btn btn-danger btn-sm" onClick={clearContent}>
              <X size={14} /> Remove
            </button>
          </div>
          {uploadedContent.text && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              maxHeight: '80px',
              overflow: 'hidden',
              lineHeight: 1.5,
            }}>
              {uploadedContent.text.substring(0, 300)}...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
