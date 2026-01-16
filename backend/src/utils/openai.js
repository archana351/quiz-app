const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateQuizWithAI = async (topic) => {
  const prompt = `
Generate 5 multiple choice quiz questions on "${topic}".

Rules:
- Each question must have 4 options
- Only ONE correct answer
- Return STRICT JSON only
- Format:
[
  {
    "question": "",
    "options": ["", "", "", ""],
    "correctAnswer": ""
  }
]
`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  });

  return JSON.parse(response.choices[0].message.content);
};

module.exports = generateQuizWithAI;
