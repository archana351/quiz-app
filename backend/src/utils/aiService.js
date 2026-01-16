const axios = require('axios');

const generateQuizFromAI = async (topic) => {
  const prompt = `
You are an educational quiz generator.

Create a beginner-friendly multiple choice quiz on the topic: "${topic}".

Requirements:
- 5 questions
- 4 options per question
- Mark correct answer
- Beginner level
- Return ONLY valid JSON

JSON format:
{
  "title": "",
  "topic": "",
  "difficulty": "Beginner",
  "questions": [
    {
      "question": "",
      "options": ["", "", "", ""],
      "correctAnswer": ""
    }
  ]
}
`;

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    }
  );

  return JSON.parse(response.data.choices[0].message.content);
};

module.exports = generateQuizFromAI;
