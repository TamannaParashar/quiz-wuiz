import './config.js'
import express from 'express';
import multer from 'multer';
import PdfParse from 'pdf-parse/lib/pdf-parse.js';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import './db.js'
import Quiz from './models/quiz.js';
import quizResponse from './models/quizResponse.js';
import User from './models/User.js';
import { v2 as cloudinary } from 'cloudinary';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/generate-quiz', upload.single('pdf'), async (req, res) => {
  const { topic, ques, level, reference, time, allowNoise, allowHandGestures, startDate, endDate, passPercentage } = req.body;

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
      topic,
      allowNoise: allowNoise === 'true',
      allowHandGestures: allowHandGestures === 'true',
      startDate: startDate || null,
      endDate: endDate || null,
      passPercentage: passPercentage ? Number(passPercentage) : 70
    });
    await qContent.save();
    console.log('Here is the quiz ID:', qContent._id);
    res.json({ quizContent: response.text, quizId: qContent._id });
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
      topic: data.topic,
      allowNoise: data.allowNoise,
      allowHandGestures: data.allowHandGestures,
      startDate: data.startDate,
      endDate: data.endDate,
      passPercentage: data.passPercentage
    });

  } catch (err) {
    console.error("Quiz can't be attempted", err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/addResponse', async (req, res) => {
  const { name, email, answers, score, quizId, warnings } = req.body;
  const resp = new quizResponse({ name, email, answers, score, quizId, warnings: warnings || [] });
  await resp.save();
  console.log('Response saved successfully');
  res.json({ message: 'saved' })
})

app.get('/api/user/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/upload-reference', upload.single('photo'), async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No photo provided' });

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'quiz_wuiz_reference_photos'
    });

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, name, referencePhotoUrl: result.secure_url });
    } else {
      user.referencePhotoUrl = result.secure_url;
      if (name) user.name = name;
    }
    await user.save();

    res.json({ message: 'Success', user });
  } catch (err) {
    console.error('Error uploading photo:', err);
    res.status(500).json({ error: 'Server error during upload' });
  }
});

app.get('/api/admin/reports', async (req, res) => {
  try {
    const responses = await quizResponse.find().populate('quizId').lean();

    // Extract unique emails
    const emails = [...new Set(responses.map(r => r.email))];
    const users = await User.find({ email: { $in: emails } }).lean();

    const userMap = {};
    users.forEach(u => {
      userMap[u.email] = u.referencePhotoUrl;
    });

    const reportData = responses.map(r => ({
      ...r,
      referencePhotoUrl: userMap[r.email] || null,
      topic: r.quizId ? r.quizId.topic : 'Unknown Topic',
      quizDetails: r.quizId ? r.quizId : null,
      warnings: r.warnings || []
    }));

    res.json(reportData);
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ error: 'Server error fetching reports' });
  }
});

app.get('/api/leaderboard/:quizId', async (req, res) => {
  const data = await quizResponse.find({ quizId: req.params.quizId }).sort({ score: -1 }).limit(3).select('name score -_id');
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

app.get('/api/getDetails', async (req, res) => {
  const email = req.query.email
  const certificateDetails = await quizResponse.find({ email })
  return res.json(certificateDetails)
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));