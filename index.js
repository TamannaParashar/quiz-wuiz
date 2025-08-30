import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import './db.js'
import Quiz from './models/quiz.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/generate-quiz', async (req, res) => {
  const { topic, ques, level, reference} = req.body;

  const prompt = `Create a ${level} multiple-choice quiz on the topic "${topic}" with ${ques} questions.
Reference material: ${reference}
Each question should have exactly 4 options, and only one correct answer.

Format the options as a bulleted list using Markdown, like:

- Option A) Option 1  
- Option B) Option 2  
- Option C) Option 3  
- Option D) Option 4
Write answers to all questions at the bottom with 1-2 line explanation.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const quiz = response.text;
    const arr = quiz.split(/(?=Answers:)/i);
    const ques = arr[0]?.trim()||"";
    const ans = arr[1]?.trim()||"";
    const qContent = new Quiz({content:ques,ansKey:ans})
    await qContent.save();
    console.log('Here is the quiz ID:', qContent._id);
    res.json({ quizContent: response.text , quizId: qContent._id});
  } catch (err) {
    console.error('Error generating quiz:', err);
    res.status(500).json({ error: 'AI prompt failed' });
  }
});

app.get('/api/getTest/:id',async(req,res)=>{
    try{
    const data = await Quiz.findById(req.params.id);
    const countQuestions = (ansKey) => {
      const questionRegex = /\*\*Question \d+/g; // Match pattern like "**Question 1"
      return (ansKey.match(questionRegex) || []).length;
    };
    
    const answerCount = countQuestions(data.ansKey);

    res.json({content:data.content,ansKey:data.ansKey,questionCount:answerCount})
    }catch(err){
        console.log("Quiz can't be attempted",err)
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
