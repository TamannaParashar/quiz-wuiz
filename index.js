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
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

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
  const { topic, ques, level, reference, time, allowNoise, allowHandGestures, startDate, endDate, passPercentage,
    addCodingQuestion, codingQuestionType, codingTopic, codingDifficulty, codingLanguages,
    customCodingTitle, customCodingDescription, customCodingLanguages, customCodingTestCases } = req.body;

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

  let codingPrompt = "";
  if (addCodingQuestion === 'true' && codingQuestionType === 'ai_generated') {
    codingPrompt = `
Generate a ${codingDifficulty || level} coding challenge on the topic "${codingTopic || topic}".
Return STRICTLY valid JSON in this exact format:

{
  "title": "Problem Title",
  "description": "Clear HTML-formatted description of the problem, including constraints.",
  "allowedLanguages": ${codingLanguages || '["javascript", "python", "cpp", "java"]'},
  "testCases": [
    { "input": "...", "output": "...", "isHidden": false },
    { "input": "...", "output": "...", "isHidden": true }
  ]
}

Rules:
- Provide at least 3 test cases (at least 1 hidden).
- Inputs/Outputs should be strings representing exact stdio text.
- Return JSON only.
`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    // Clean potential markdown blocks
    const cleanJSON = (text) => text.replace(/```json\n?|\n?```/g, '').trim();

    const quiz = JSON.parse(cleanJSON(response.text));

    let codingQuestions = [];
    if (addCodingQuestion === 'true') {
      if (codingQuestionType === 'custom') {
        codingQuestions.push({
          title: customCodingTitle || "Custom Problem",
          description: customCodingDescription || "Solve the problem.",
          allowedLanguages: customCodingLanguages ? JSON.parse(customCodingLanguages) : ["javascript"],
          testCases: customCodingTestCases ? JSON.parse(customCodingTestCases) : []
        });
      } else if (codingQuestionType === 'ai_generated' && codingPrompt) {
        const codingResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: codingPrompt,
        });
        const generatedCoding = JSON.parse(cleanJSON(codingResponse.text));
        codingQuestions.push(generatedCoding);
      }
    }

    const qContent = new Quiz({
      content: quiz.questions,
      codingQuestions: codingQuestions,
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
// Auto-generate test cases route for custom coding challenges
app.post('/api/generate-testcases', async (req, res) => {
  const { title, description, count } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required.' });
  }

  const prompt = `
You are an expert platform algorithm problem setter. 
I am creating a custom coding problem with the title "${title}".
Description:
${description}

Generate exactly ${count || 5} diverse test cases (some edge cases, some large inputs) for this problem.
Return STRICTLY valid JSON in this exact format:

[
  { "input": "...", "output": "...", "isHidden": false },
  { "input": "...", "output": "...", "isHidden": true },
  ...
]

Rules:
- Make sure at least half of the test cases are "isHidden": true.
- Inputs and Outputs should be EXACT strings representing stdio text (e.g., handles integers on multiple lines). Watch out for trailing spaces.
- Return ONLY the JSON array, no markdown blocks, no explanation.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const cleanJSON = (text) => text.replace(/```json\n?|\n?```/g, '').trim();
    const testCases = JSON.parse(cleanJSON(response.text));
    res.json(testCases);
  } catch (err) {
    console.error('Error generating testcases:', err);
    res.status(500).json({ error: 'Failed to generate test cases' });
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
      codingQuestions: data.codingQuestions || [],
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
  const { name, email, answers, codingAnswers, score, quizId, warnings } = req.body;
  const resp = new quizResponse({ name, email, answers, codingAnswers: codingAnswers || {}, score, quizId, warnings: warnings || [] });
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

// Local Code Execution Endpoint
app.post('/api/execute', async (req, res) => {
  const language = req.body.language;
  const stdin = req.body.stdin;
  const code = req.body.code || (req.body.files && req.body.files[0] && req.body.files[0].content);

  if (!language || !code) {
    return res.status(400).json({ error: 'Language and code are required.' });
  }

  const tempDir = path.join(process.cwd(), 'temp_code_exec');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  const fileId = Date.now().toString() + Math.random().toString(36).substring(7);
  let ext = '';
  let executeCmd = '';
  let compileCmd = '';
  let filename = '';

  switch (language.toLowerCase()) {
    case 'javascript':
    case 'js':
      ext = '.js';
      filename = `script_${fileId}${ext}`;
      executeCmd = `node "${path.join(tempDir, filename)}"`;
      break;
    case 'python':
    case 'py':
      ext = '.py';
      filename = `script_${fileId}${ext}`;
      // Use 'python' or 'python3' based on the system
      executeCmd = `python "${path.join(tempDir, filename)}"`;
      break;
    case 'c++':
    case 'cpp':
      ext = '.cpp';
      filename = `main_${fileId}${ext}`;
      const outCpp = path.join(tempDir, `out_${fileId}.exe`);
      compileCmd = `g++ "${path.join(tempDir, filename)}" -o "${outCpp}"`;
      executeCmd = `"${outCpp}"`;
      break;
    case 'c':
      ext = '.c';
      filename = `main_${fileId}${ext}`;
      const outC = path.join(tempDir, `out_${fileId}.exe`);
      compileCmd = `gcc "${path.join(tempDir, filename)}" -o "${outC}"`;
      executeCmd = `"${outC}"`;
      break;
    case 'java':
      ext = '.java';
      // Java requires the class name to strictly match the file name. 
      // Searching for 'public class XYZ' in the code:
      const classMatch = code.match(/public\s+class\s+([a-zA-Z0-9_]+)/);
      const className = classMatch ? classMatch[1] : `Main_${fileId}`;
      filename = `${className}${ext}`;

      // If the code doesn't have a public class, or it's named 'abc' instead of the filename,
      // it won't compile unless the filename isn't strict. To handle user classes like "public class abc",
      // we extract it and name the file abc.java
      compileCmd = `javac "${path.join(tempDir, filename)}"`;
      executeCmd = `java -cp "${tempDir}" ${className}`;
      break;
    default:
      return res.status(400).json({ error: `Language '${language}' is not supported.` });
  }

  const filePath = path.join(tempDir, filename);

  try {
    fs.writeFileSync(filePath, code);

    // Command runner function with timeout
    const runCommand = (cmd, input) => {
      return new Promise((resolve, reject) => {
        // We set a 5-second timeout to prevent infinite loops (e.g., `while(true)`)
        const child = exec(cmd, { timeout: 5000 }, (error, stdout, stderr) => {
          if (error && error.killed) {
            resolve({ stdout: '', stderr: 'Execution Timed Out (5s limit)' });
          } else {
            // Even if there's an error (like a runtime exception), we want to capture stderr
            resolve({ stdout: stdout || '', stderr: stderr || (error ? error.message : '') });
          }
        });

        if (input) {
          child.stdin.write(input);
          child.stdin.end();
        }
      });
    };

    let result = { stdout: '', stderr: '' };

    // If compilation is required (C/C++, Java)
    if (compileCmd) {
      const compileRes = await runCommand(compileCmd, null);
      if (compileRes.stderr) {
        // Compilation failed
        result.stderr = compileRes.stderr;
      } else {
        // Compilation succeeded, execute the program
        result = await runCommand(executeCmd, stdin);
      }
    } else {
      // Interpreted languages (Python, JS)
      result = await runCommand(executeCmd, stdin);
    }

    // Clean up temporary files
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      if (language === 'java') {
        const classMatch = code.match(/public\s+class\s+([a-zA-Z0-9_]+)/);
        const className = classMatch ? classMatch[1] : `Main_${fileId}`;
        const classFile = path.join(tempDir, `${className}.class`);
        if (fs.existsSync(classFile)) fs.unlinkSync(classFile);
      }
      if (language === 'cpp' || language === 'c++' || language === 'c') {
        const outFile = path.join(tempDir, `out_${fileId}.exe`);
        if (fs.existsSync(outFile)) fs.unlinkSync(outFile);
      }
    } catch (cleanupErr) {
      console.error("Failed to clean up temp files:", cleanupErr);
    }

    res.json({
      run: {
        stdout: result.stdout,
        stderr: result.stderr
      }
    });

  } catch (err) {
    console.error("Execution error:", err);
    res.status(500).json({ error: 'Internal server error during execution' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));