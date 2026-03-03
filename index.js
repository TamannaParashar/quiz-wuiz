import './config.js'
import express from 'express';
import multer from 'multer';
import PdfParse from 'pdf-parse/lib/pdf-parse.js';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import './db.js'
import Quiz from './models/quiz.js';
import quizResponse from './models/quizResponse.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/generate-quiz',upload.single('pdf'), async (req, res) => {
  const { topic, ques, level, reference,time} = req.body;

  let fullReference = reference || "";

  if (req.file) {
    try {
      const parsed = await PdfParse(req.file.buffer);
      fullReference += "\n\n" + parsed.text;
    } catch (err) {
      console.error('PDF parsing failed:', err);
    }
  }

const prompt = `
Create a ${level} multiple-choice quiz on the topic "${topic}" with ${ques} questions.

Reference material:
${fullReference}

Return STRICTLY valid JSON in this format:

{
  "questions": [
    {
      "question": "Question text",
      "options": {
        "A": "Option text",
        "B": "Option text",
        "C": "Option text",
        "D": "Option text"
      },
      "answer": "A"
    }
  ]
}

Rules:
- Exactly 4 options per question
- Only one correct answer
- No markdown
- No explanation
- No extra text
- Return JSON only
`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const quiz = JSON.parse(response.text);
    const qContent = new Quiz({
      content: quiz.questions,
      time,
      topic
    });
    await qContent.save();
    console.log('Here is the quiz ID:', qContent._id);
    res.json({ quizContent: response.text , quizId: qContent._id});
  } catch (err) {
    console.error('Error generating quiz:', err);
    res.status(500).json({ error: 'AI prompt failed' });
  }
});

app.get('/api/getTest/:id', async (req, res) => {
  try {
    const data = await Quiz.findById(req.params.id);

    if (!data) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json({
      content: data.content,
      time: data.time,
      topic: data.topic
    });

  } catch (err) {
    console.error("Quiz can't be attempted", err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/addResponse',async(req,res)=>{
    const {name,email,answers,score,quizId} = req.body;
    const resp = new quizResponse({name,email,answers,score,quizId});
    await resp.save();
    console.log('Response saved successfully');
    res.json({message:'saved'})
})

app.get('/api/leaderboard/:quizId',async(req,res)=>{
    const data = await quizResponse.find({quizId:req.params.quizId}).sort({score:-1}).limit(3).select('name score -_id');
    res.json(data);
})

app.get('/api/checkAttempt/:quizId', async (req, res) => {
  const quizId = req.params.quizId;
  const email = req.query.email;
  try {
    const isAttempted = await quizResponse.findOne({ quizId, email });
    if (isAttempted) {
      return res.status(403).json({ message: 'You have already attempted this quiz.' });
    } else {
      return res.json({ message: 'Allowed to attempt' });
    }
  } catch (err) {
    console.error('Error checking attempt:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/getDetails',async (req,res)=>{
  const email = req.query.email
  const certificateDetails = await quizResponse.find({email})
  return res.json(certificateDetails)
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));