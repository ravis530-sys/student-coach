import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;

function getClient(apiKey) {
  if (!genAI || genAI._apiKey !== apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
    genAI._apiKey = apiKey;
  }
  return genAI;
}

function buildSystemPrompt({ role, name, age, studentClass, board, mode, explanationLanguage, teacherSubjects }) {
  if (role === 'teacher') {
    const subjectList = teacherSubjects?.length ? teacherSubjects.join(', ') : 'All Subjects';
    return `You are an expert AI assistant helping a teacher prepare educational content for subjects: ${subjectList}.
You help generate model question papers, exam questions, and structured content.
Format papers clearly with sections (MCQ, Short Answer, Long Answer) with marks.
Use clear, professional language. When asked for a paper, provide complete, well-structured output.`;
  }

  // Student mode
  const lang = explanationLanguage || 'English';
  const cls = studentClass || 'school';
  const ageStr = age ? `${age} years old` : '';
  const boardStr = board ? `studying under ${board} board` : '';

  const complexityGuide = {
    learn: `You are a warm, enthusiastic tutor named "Coach" for a ${cls} grade student${ageStr ? `, ${ageStr}` : ''}${boardStr ? `, ${boardStr}` : ''}.
- Explain concepts in SIMPLE, easy-to-understand language suitable for their age.
- Always use real-life examples and relatable analogies.
- Use emojis to make content fun and engaging 🎉.
- Break complex ideas into small digestible steps.
- After explaining, ask if they understood or have questions.
- Respond ONLY in ${lang} language for explanations (subject content terms can remain in English if needed).
- If the student says they don't understand, explain using a COMPLETELY DIFFERENT analogy or example.`,

    qna: `You are a patient Q&A tutor for a ${cls} grade student${ageStr ? `, ${ageStr}` : ''}${boardStr ? `, ${boardStr}` : ''}.
- Answer questions clearly and simply based on the context provided.
- After answering, ask if they need more clarification.
- If they don't understand, re-explain with fresh, different examples.
- Keep answers age-appropriate and encouraging.
- Respond ONLY in ${lang} language for explanations.`,

    exam_prep: `You are a focused Board Exam preparation coach for a ${cls} grade student${ageStr ? `, ${ageStr}` : ''}${boardStr ? `, ${boardStr}` : ''}.
- Focus on important topics, key definitions, and exam-relevant content.
- Share tips on how to write answers for maximum marks.
- Highlight frequently asked questions and important formulas.
- Encourage and motivate the student.
- Respond ONLY in ${lang} language for explanations.`,

    quiz: `You are a quiz master for a ${cls} grade student${ageStr ? `, ${ageStr}` : ''}.
- Generate quiz questions based on the content provided.
- Ask ONE question at a time.
- If the answer is wrong, gently correct and explain why with a simple example.
- If correct, praise enthusiastically and move on.
- Keep track mentally and give a final score.
- Respond ONLY in ${lang} language.`,
  };

  return complexityGuide[mode] || complexityGuide.learn;
}

export async function sendMessage({ apiKey, messages, newMessage, context, profile }) {
  const client = getClient(apiKey);
  const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const systemPrompt = buildSystemPrompt(profile);

  // Build history for multi-turn chat
  const history = messages
    .filter(m => m.role === 'user' || m.role === 'model')
    .map(m => ({
      role: m.role,
      parts: [{ text: m.content }],
    }));

  const chat = model.startChat({
    history,
    systemInstruction: { role: 'system', parts: [{ text: systemPrompt }] },
  });

  // Prepend context if available and this is the first message
  let userMessage = newMessage;
  if (context && messages.length === 0) {
    userMessage = `Here is the study material I want to work with:\n\n---\n${context.substring(0, 20000)}\n---\n\n${newMessage}`;
  }

  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}

export async function generateQuiz({ apiKey, context, profile }) {
  const client = getClient(apiKey);
  const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const { studentClass, age, board, explanationLanguage } = profile;
  const lang = explanationLanguage || 'English';

  const prompt = `You are a quiz generator for a ${studentClass || 'school'} grade student${age ? `, age ${age}` : ''}${board ? ` (${board} board)` : ''}.

Based on the following study material, generate a quiz with 8 questions.
Mix of question types: 4 MCQs, 2 true/false, 2 short answer.
Make it appropriate for the student's grade level.
Respond ONLY in ${lang}.

Study material:
---
${context?.substring(0, 15000) || 'General knowledge'}
---

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "id": 1,
      "type": "mcq",
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correct": "A",
      "explanation": "Why this is correct, with a simple example"
    },
    {
      "id": 2,
      "type": "truefalse",
      "question": "Statement",
      "options": ["True", "False"],
      "correct": "True",
      "explanation": "Explanation"
    },
    {
      "id": 3,
      "type": "shortanswer",
      "question": "Question",
      "correct": "Expected answer",
      "explanation": "Detailed explanation"
    }
  ]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse quiz JSON');
  return JSON.parse(jsonMatch[0]);
}

export async function generateExamPaper({ apiKey, context, config, profile }) {
  const client = getClient(apiKey);
  const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const { subjects, difficulty, totalMarks, numMCQ, numShort, numLong, duration, className } = config;

  const prompt = `You are an expert exam paper generator for ${subjects?.join(', ') || 'the subject'} for ${className || 'school'} students.

Generate a complete model question paper based on the following content:
---
${context?.substring(0, 20000) || 'General curriculum topics'}
---

Exam Configuration:
- Subjects: ${subjects?.join(', ') || 'General'}
- Class: ${className || 'School'}
- Difficulty: ${difficulty || 'Medium'}
- Total Marks: ${totalMarks || 80}
- Duration: ${duration || '3 hours'}
- MCQ Questions: ${numMCQ || 20} (1 mark each)
- Short Answer: ${numShort || 8} (3 marks each)
- Long Answer: ${numLong || 4} (5 marks each)

Format the paper professionally with:
1. Header (School Name placeholder, Class, Subject, Date, Duration, Max Marks)
2. General Instructions
3. Section A - Multiple Choice Questions (with 4 options each)
4. Section B - Short Answer Questions
5. Section C - Long Answer / Essay Questions
6. At the end, provide an ANSWER KEY section.

Make it exam-ready and professional.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function explainInLanguage({ apiKey, text, targetLanguage, profile }) {
  const client = getClient(apiKey);
  const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `Translate and explain the following educational content in ${targetLanguage} language.
Keep subject-specific terms in English where necessary, but explain surrounding context in ${targetLanguage}.
Make it simple and suitable for a ${profile?.studentClass || 'school'} grade student.

Content:
${text}`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
