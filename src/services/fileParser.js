// File parser service — handles PDF, DOCX, images, and URLs
// Uses pdf.js for PDFs and mammoth for DOCX

// Polyfill Math.sumPrecise for PDF.js compatibility across all browsers
if (typeof Math.sumPrecise !== 'function') {
  Math.sumPrecise = function (numbers) {
    let sum = 0;
    if (numbers && typeof numbers[Symbol.iterator] === 'function') {
      for (const n of numbers) {
        sum += Number(n) || 0;
      }
    }
    return sum;
  };
}

/**
 * Extract text from a PDF file using PDF.js
 */
export async function parsePDF(file) {
  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
  GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(' ');
    fullText += `\n--- Page ${i} ---\n${pageText}`;
  }
  
  return {
    text: fullText.trim(),
    filename: file.name,
    type: 'pdf',
    pageCount: pdf.numPages,
  };
}

/**
 * Extract text from a DOCX file using Mammoth
 */
export async function parseDOCX(file) {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  
  return {
    text: result.value.trim(),
    filename: file.name,
    type: 'docx',
  };
}

/**
 * Convert an image file to base64 for Gemini Vision
 */
export async function parseImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve({
        base64,
        mimeType: file.type,
        filename: file.name,
        type: 'image',
        text: `[Image: ${file.name}]`, // placeholder text
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Fetch and extract text content from a URL (uses a CORS proxy for cross-origin)
 */
export async function parseURL(url) {
  // Try direct fetch first
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error('Direct fetch failed');
    const text = await response.text();
    // Strip HTML tags
    const stripped = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return {
      text: stripped.substring(0, 30000),
      filename: url,
      type: 'url',
      url,
    };
  } catch {
    // Return URL as context for Gemini to use its grounding
    return {
      text: `[Web URL provided: ${url}]\nPlease analyze content from this URL and help me learn from it.`,
      filename: url,
      type: 'url',
      url,
    };
  }
}

/**
 * Main parser dispatcher
 */
export async function parseFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  
  if (ext === 'pdf') return parsePDF(file);
  if (['docx', 'doc'].includes(ext)) return parseDOCX(file);
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp'].includes(ext)) return parseImage(file);
  
  // Plain text files
  if (['txt', 'md', 'csv'].includes(ext)) {
    const text = await file.text();
    return { text, filename: file.name, type: 'text' };
  }
  
  throw new Error(`Unsupported file type: .${ext}`);
}

export function getFileTypeIcon(type) {
  const icons = {
    pdf: '📄',
    docx: '📝',
    doc: '📝',
    image: '🖼️',
    url: '🔗',
    text: '📃',
  };
  return icons[type] || '📁';
}
