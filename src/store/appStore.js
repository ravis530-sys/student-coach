import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const ROLES = { STUDENT: 'student', TEACHER: 'teacher' };
export const MODES = { LEARN: 'learn', QNA: 'qna', EXAM_PREP: 'exam_prep', QUIZ: 'quiz', EXAM_GENERATE: 'exam_generate' };

export const CLASSES = [
  '1st', '2nd', '3rd', '4th', '5th',
  '6th', '7th', '8th', '9th', '10th',
  '11th', '12th', 'College / University'
];

export const BOARDS = ['CBSE', 'ICSE', 'State Board', 'IB', 'Other'];

export const SUBJECTS = [
  'All Subjects', 'Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology',
  'English', 'Hindi', 'Social Studies', 'History', 'Geography', 'Civics',
  'Computer Science', 'Economics', 'Business Studies', 'Accountancy',
  'Political Science', 'Psychology', 'Sociology', 'Physical Education', 'Art'
];

export const ALL_LANGUAGES = [
  'English', 'Hindi', 'Telugu', 'Tamil', 'Kannada', 'Malayalam',
  'Bengali', 'Marathi', 'Gujarati', 'Punjabi', 'Urdu', 'Odia'
];

function aggregateFiles(files) {
  if (!files || files.length === 0) return null;
  if (files.length === 1) {
    return {
      ...files[0],
      files,
      shortLabel: files[0].filename,
    };
  }

  const combinedText = files
    .map((f, idx) => `=== [DOCUMENT ${idx + 1}: ${f.filename}] ===\n${f.text || ''}\n=== [END OF DOCUMENT: ${f.filename}] ===`)
    .join('\n\n');

  const totalPages = files.reduce((sum, f) => sum + (f.pageCount || 0), 0);

  return {
    filename: `${files.length} files (${files.map(f => f.filename).join(', ')})`,
    shortLabel: `${files.length} documents`,
    text: combinedText,
    type: 'multiple',
    pageCount: totalPages || undefined,
    files,
  };
}

const useAppStore = create(
  persist(
    (set) => ({
      // Settings
      apiKey: '',
      setApiKey: (key) => set({ apiKey: key }),

      // User profile
      role: null,
      name: '',
      age: '',
      studentClass: '',
      board: '',
      teacherSubjects: [],
      onboardingComplete: false,

      setProfile: (profile) => set({ ...profile }),
      completeOnboarding: () => set({ onboardingComplete: true }),
      resetProfile: () => set({
        role: null, name: '', age: '', studentClass: '', board: '',
        teacherSubjects: [], onboardingComplete: false,
        currentMode: null, uploadedFiles: [], uploadedContent: null, messages: [],
        quizState: null,
      }),

      // Current mode
      currentMode: null,
      setMode: (mode) => set({ currentMode: mode, messages: [], quizState: null }),

      // Uploaded files & aggregated content
      uploadedFiles: [],
      uploadedContent: null, // { text, filename, type, files, shortLabel }
      setUploadedFiles: (files) => set({
        uploadedFiles: files || [],
        uploadedContent: aggregateFiles(files || []),
      }),
      addUploadedFiles: (newFiles) => set((state) => {
        const incoming = Array.isArray(newFiles) ? newFiles : [newFiles];
        const existingNames = new Set((state.uploadedFiles || []).map(f => f.filename));
        const filtered = incoming.filter(f => !existingNames.has(f.filename));
        const updated = [...(state.uploadedFiles || []), ...filtered];
        return {
          uploadedFiles: updated,
          uploadedContent: aggregateFiles(updated),
        };
      }),
      removeUploadedFile: (idOrFilename) => set((state) => {
        const updated = (state.uploadedFiles || []).filter(
          f => f.id !== idOrFilename && f.filename !== idOrFilename
        );
        return {
          uploadedFiles: updated,
          uploadedContent: aggregateFiles(updated),
        };
      }),
      setUploadedContent: (content) => {
        if (!content) {
          set({ uploadedFiles: [], uploadedContent: null });
        } else {
          const files = content.files || (Array.isArray(content) ? content : [content]);
          set({
            uploadedFiles: files,
            uploadedContent: aggregateFiles(files),
          });
        }
      },
      clearContent: () => set({ uploadedFiles: [], uploadedContent: null }),

      // Chat messages
      messages: [],
      addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
      clearMessages: () => set({ messages: [] }),

      // Explanation language (dynamic, user can change anytime)
      explanationLanguage: 'English',
      setExplanationLanguage: (lang) => set({ explanationLanguage: lang }),

      // Quiz state
      quizState: null,
      setQuizState: (qs) => set({ quizState: qs }),

      // UI state
      settingsOpen: false,
      toggleSettings: () => set((state) => ({ settingsOpen: !state.settingsOpen })),
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      // Voice
      voiceEnabled: false,
      toggleVoice: () => set((state) => ({ voiceEnabled: !state.voiceEnabled })),
    }),
    {
      name: 'student-coach-storage',
      partialize: (state) => ({
        apiKey: state.apiKey,
        role: state.role,
        name: state.name,
        age: state.age,
        studentClass: state.studentClass,
        board: state.board,
        teacherSubjects: state.teacherSubjects,
        onboardingComplete: state.onboardingComplete,
        explanationLanguage: state.explanationLanguage,
        voiceEnabled: state.voiceEnabled,
      }),
    }
  )
);

export default useAppStore;
