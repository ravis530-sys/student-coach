// Web Speech API wrapper for voice input and output

let recognition = null;
let synthesis = window.speechSynthesis;
let currentUtterance = null;

/**
 * Check if speech recognition is supported
 */
export function isSpeechRecognitionSupported() {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

/**
 * Check if speech synthesis is supported
 */
export function isSpeechSynthesisSupported() {
  return 'speechSynthesis' in window;
}

/**
 * Start voice input recognition
 * @param {Object} options
 * @param {string} options.language - BCP 47 language tag (e.g., 'en-US', 'hi-IN')
 * @param {Function} options.onResult - callback with transcript string
 * @param {Function} options.onError - callback with error
 * @param {Function} options.onEnd - callback when recognition ends
 */
export function startListening({ language = 'en-US', onResult, onError, onEnd }) {
  if (!isSpeechRecognitionSupported()) {
    onError?.('Speech recognition not supported in this browser');
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = language;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;

  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map(r => r[0].transcript)
      .join('');
    onResult?.(transcript, event.results[event.results.length - 1].isFinal);
  };

  recognition.onerror = (event) => {
    onError?.(event.error);
  };

  recognition.onend = () => {
    onEnd?.();
  };

  recognition.start();
}

/**
 * Stop voice input
 */
export function stopListening() {
  recognition?.stop();
  recognition = null;
}

/**
 * Speak text aloud using TTS
 * @param {string} text - Text to speak
 * @param {Object} options
 */
export function speak({ text, language = 'en-US', rate = 1, pitch = 1, onEnd }) {
  if (!isSpeechSynthesisSupported()) return;

  // Stop any current speech
  stopSpeaking();

  // Clean markdown formatting for TTS
  const cleanText = text
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/🎉|💡|✅|❌|⭐|🔥|📚|🧠|📝/g, '')
    .trim();

  // Chunk text to avoid TTS cutoff (max ~200 chars per utterance for some browsers)
  const chunks = chunkText(cleanText, 200);
  
  let index = 0;
  const speakChunk = () => {
    if (index >= chunks.length) {
      onEnd?.();
      return;
    }
    currentUtterance = new SpeechSynthesisUtterance(chunks[index]);
    currentUtterance.lang = language;
    currentUtterance.rate = rate;
    currentUtterance.pitch = pitch;
    currentUtterance.onend = () => {
      index++;
      speakChunk();
    };
    synthesis.speak(currentUtterance);
    index++;
  };

  speakChunk();
}

/**
 * Stop current speech
 */
export function stopSpeaking() {
  synthesis?.cancel();
  currentUtterance = null;
}

/**
 * Check if currently speaking
 */
export function isSpeaking() {
  return synthesis?.speaking || false;
}

/**
 * Get available voices
 */
export function getVoices() {
  return synthesis?.getVoices() || [];
}

/**
 * Map explanation language name to BCP 47 tag
 */
export function languageToTag(lang) {
  const map = {
    'English': 'en-US',
    'Hindi': 'hi-IN',
    'Telugu': 'te-IN',
    'Tamil': 'ta-IN',
    'Kannada': 'kn-IN',
    'Malayalam': 'ml-IN',
    'Bengali': 'bn-IN',
    'Marathi': 'mr-IN',
    'Gujarati': 'gu-IN',
    'Punjabi': 'pa-IN',
    'Urdu': 'ur-PK',
    'Odia': 'or-IN',
  };
  return map[lang] || 'en-US';
}

function chunkText(text, maxLen) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks = [];
  let current = '';
  
  for (const sentence of sentences) {
    if ((current + sentence).length <= maxLen) {
      current += (current ? ' ' : '') + sentence;
    } else {
      if (current) chunks.push(current);
      current = sentence;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}
