import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import db from './db'

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/generate-quiz', async (req, res) => {
  const { topic, ques, level, reference} = req.body;

  const prompt = `Create a ${level} multiple-choice quiz on the topic "${topic}" with ${ques} questions.
Reference material: ${reference}`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    res.json({ quizContent: response.text });
  } catch (err) {
    console.error('Error generating quiz:', err);
    res.status(500).json({ error: 'AI prompt failed' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
