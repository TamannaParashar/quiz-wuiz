import mongoose from "mongoose";

const newQuiz = new mongoose.Schema({
  content: [
    {
      question: String,
      options: {
        A: String,
        B: String,
        C: String,
        D: String,
      },
      answer: String
    }
  ],
  codingQuestions: [
    {
      title: String,
      description: String,
      allowedLanguages: [String],
      testCases: [
        {
          input: String,
          output: String,
          isHidden: Boolean
        }
      ]
    }
  ],
  time: Number,
  topic: String,
  allowNoise: {
    type: Boolean,
    default: false
  },
  allowHandGestures: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date,
    default: null
  },
  endDate: {
    type: Date,
    default: null
  },
  passPercentage: {
    type: Number,
    default: 70
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Quiz = mongoose.model("Quiz", newQuiz);
export default Quiz;