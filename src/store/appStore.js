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

const useAppStore = create(
  persist(
    (set, get) => ({
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
        currentMode: null, uploadedContent: null, messages: [],
        quizState: null,
      }),

      // Current mode
      currentMode: null,
      setMode: (mode) => set({ currentMode: mode, messages: [], quizState: null }),

      // Uploaded content
      uploadedContent: null,     // { text, filename, type }
      setUploadedContent: (content) => set({ uploadedContent: content }),
      clearContent: () => set({ uploadedContent: null }),

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
