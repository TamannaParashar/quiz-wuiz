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

const prompt = `Create a ${level} multiple-choice quiz on the topic "${topic}" with ${ques} questions.
Reference material: ${fullReference}
Each question should have exactly 4 options, and only one correct answer.

Format the options as a bulleted list using Markdown, like:

- Option A) Option 1  
- Option B) Option 2  
- Option C) Option 3  
- Option D) Option 4
Write answers to all questions at the bottom like (A) or (B) or (C) or (D).`;
//(Just the option name like (A) or (B) or (C) or (D))
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const quiz = response.text;
    const arr = quiz.split(/(?=Answers:)/i);
    const ques = arr[0]?.trim()||"";
    const ans = arr[1]?.trim()||"";
    const qContent = new Quiz({content:ques,ansKey:ans,time:time})
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
      const questionRegex = /\((.*?)\)/g;
      return (ansKey.match(questionRegex) || []).length;
    };
    
    const answerCount = countQuestions(data.ansKey);

    res.json({content:data.content,ansKey:data.ansKey,questionCount:answerCount,time:data.time})
    }catch(err){
        console.log("Quiz can't be attempted",err)
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));