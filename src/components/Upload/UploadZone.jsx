import { useState, useRef } from 'react';
import { Link, X, FileText, Image, File, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { parseFile, parseURL, getFileTypeIcon } from '../../services/fileParser';
import useAppStore from '../../store/appStore';
import toast from 'react-hot-toast';

const ACCEPTED = '.pdf,.docx,.doc,.png,.jpg,.jpeg,.webp,.txt,.md';

export default function UploadZone({ compact = false }) {
  const {
    uploadedFiles,
    uploadedContent,
    addUploadedFiles,
    removeUploadedFile,
    clearContent,
  } = useAppStore();

  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrl, setShowUrl] = useState(false);
  const [previewFileId, setPreviewFileId] = useState(null);
  const inputRef = useRef();
  const miniInputRef = useRef();

  const files = uploadedFiles?.length > 0 ? uploadedFiles : (uploadedContent ? [uploadedContent] : []);

  async function handleFiles(fileList) {
    if (!fileList?.length) return;
    const filesArray = Array.from(fileList);
    setLoading(true);
    const tid = toast.loading(`Parsing ${filesArray.length} file${filesArray.length > 1 ? 's' : ''}...`);

    try {
      const parsedResults = [];
      for (const file of filesArray) {
        try {
          const result = await parseFile(file);
          parsedResults.push({
            ...result,
            id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          });
        } catch (err) {
          toast.error(`Failed ${file.name}: ${err.message}`);
        }
      }

      if (parsedResults.length > 0) {
        addUploadedFiles(parsedResults);
        toast.success(`✅ Added ${parsedResults.length} file${parsedResults.length > 1 ? 's' : ''}!`, { id: tid });
      } else {
        toast.dismiss(tid);
      }
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
      if (miniInputRef.current) miniInputRef.current.value = '';
    }
  }

  async function handleURL() {
    if (!urlInput.trim()) return;
    setLoading(true);
    const tid = toast.loading('Fetching URL...');
    try {
      const result = await parseURL(urlInput.trim());
      addUploadedFiles([{
        ...result,
        id: `url-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      }]);
      toast.success('🔗 URL content added!', { id: tid });
      setUrlInput('');
      setShowUrl(false);
    } catch (err) {
      toast.error(`Could not fetch URL: ${err.message}`, { id: tid });
    } finally {
      setLoading(false);
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  // COMPACT MODE
  if (compact) {
    if (files.length === 0) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPTED}
            style={{ display: 'none' }}
            onChange={e => handleFiles(e.target.files)}
          />
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
          >
            <Plus size={14} /> Add Materials
          </button>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED}
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="text-xs font-semibold text-secondary">
            📚 {files.length} File{files.length > 1 ? 's' : ''} Attached
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              className="btn btn-ghost btn-sm"
              style={{ padding: '2px 6px', fontSize: '0.75rem' }}
              onClick={() => inputRef.current?.click()}
              title="Add more files"
            >
              <Plus size={12} /> Add
            </button>
            <button
              className="btn btn-ghost btn-sm text-danger"
              style={{ padding: '2px 6px', fontSize: '0.75rem' }}
              onClick={clearContent}
              title="Clear all"
            >
              Clear
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
          {files.map(f => (
            <div
              key={f.id || f.filename}
              className="uploaded-file-card"
              style={{ margin: 0, padding: '6px 10px', fontSize: '0.8rem', gap: '8px' }}
            >
              <span style={{ fontSize: '1rem' }}>{getFileTypeIcon(f.type)}</span>
              <span className="truncate" style={{ maxWidth: '140px', fontWeight: 500 }} title={f.filename}>
                {f.filename}
              </span>
              <button
                className="btn btn-ghost btn-icon"
                style={{ padding: 2, height: 'auto', width: 'auto' }}
                onClick={() => removeUploadedFile(f.id || f.filename)}
                title="Remove"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // FULL MODE
  return (
    <div>
      {files.length === 0 ? (
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
              multiple
              accept={ACCEPTED}
              style={{ display: 'none' }}
              onChange={e => handleFiles(e.target.files)}
            />
            <div className="upload-icon">
              {loading ? '⏳' : '📂'}
            </div>
            <div className="upload-title">
              {loading ? 'Processing files...' : 'Drop your study materials here'}
            </div>
            <div className="upload-hint">
              or click to browse multiple files at once
            </div>
            <div className="upload-types">
              <span className="badge badge-primary"><FileText size={10}/> PDF</span>
              <span className="badge badge-cyan"><File size={10}/> Word</span>
              <span className="badge badge-amber"><Image size={10}/> Image</span>
              <span className="badge badge-emerald">📃 TXT</span>
              <span className="badge badge-indigo">✨ Multiple Files</span>
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
                placeholder="Paste a URL (Wikipedia, article, docs)..."
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
              <Link size={14} /> Paste a Web URL
            </button>
          )}
        </>
      ) : (
        <div>
          {/* Header */}
          <div className="uploaded-files-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                📂 Attached Materials ({files.length})
              </span>
              <span className="badge badge-emerald">Ready for AI</span>
            </div>
            <button
              className="btn btn-ghost btn-sm text-danger"
              onClick={clearContent}
              title="Remove all uploaded files"
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Trash2 size={13} /> Clear All
            </button>
          </div>

          {/* List of Files */}
          <div className="uploaded-files-list">
            {files.map(f => {
              const fid = f.id || f.filename;
              const isPreviewOpen = previewFileId === fid;
              const wordCount = f.text ? Math.round(f.text.length / 5) : 0;

              return (
                <div key={fid}>
                  <div className="uploaded-file-card">
                    <span className="file-icon">{getFileTypeIcon(f.type)}</span>
                    <div className="file-info">
                      <div className="filename truncate" title={f.filename}>{f.filename}</div>
                      <div className="filemeta">
                        {f.type?.toUpperCase()}
                        {f.pageCount ? ` · ${f.pageCount} pages` : ''}
                        {wordCount > 0 ? ` · ~${wordCount.toLocaleString()} words` : ''}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {f.text && (
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => setPreviewFileId(isPreviewOpen ? null : fid)}
                          title={isPreviewOpen ? 'Hide text preview' : 'View extracted text preview'}
                        >
                          {isPreviewOpen ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      )}
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => removeUploadedFile(fid)}
                        title="Remove this file"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Individual File Preview Drawer */}
                  {isPreviewOpen && f.text && (
                    <div style={{
                      marginTop: '4px',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border)',
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      maxHeight: '120px',
                      overflowY: 'auto',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap',
                    }}>
                      {f.text.substring(0, 800)}{f.text.length > 800 ? '...' : ''}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add more files or URL bar */}
          <input
            ref={miniInputRef}
            type="file"
            multiple
            accept={ACCEPTED}
            style={{ display: 'none' }}
            onChange={e => handleFiles(e.target.files)}
          />

          <div className="upload-add-bar">
            <div
              className={`upload-mini-drop ${dragging ? 'drag-over' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => miniInputRef.current?.click()}
            >
              <Plus size={14} />
              <span>{loading ? 'Processing...' : 'Add more files (Drop or browse)'}</span>
            </div>

            <button
              className="btn btn-secondary btn-sm"
              style={{ height: '38px', whiteSpace: 'nowrap' }}
              onClick={() => setShowUrl(!showUrl)}
            >
              <Link size={14} /> Add URL
            </button>
          </div>

          {/* URL Input Form when toggled */}
          {showUrl && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <input
                className="input"
                placeholder="Paste URL (e.g. Wikipedia article)..."
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleURL()}
                autoFocus
              />
              <button className="btn btn-primary" onClick={handleURL} disabled={loading}>
                Add
              </button>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowUrl(false)}>
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
