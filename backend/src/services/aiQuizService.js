const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateQuizWithAI = async (topic) => {
  const prompt = `
You are an expert quiz generator.

Generate a quiz for the topic: "${topic}"

Rules:
- Correct spelling of the topic
- 5 multiple choice questions
- Each question must have 4 options
- Clearly mention the correct answer
- Output ONLY valid JSON

JSON format:
{
  "title": "Quiz title",
  "topic": "Topic name",
  "difficulty": "easy",
  "questions": [
    {
      "question": "",
      "options": ["", "", "", ""],
      "correctAnswer": ""
    }
  ]
}
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  });

  return JSON.parse(response.choices[0].message.content);
};

module.exports = generateQuizWithAI;
