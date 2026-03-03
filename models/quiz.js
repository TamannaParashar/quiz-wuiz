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
  time: Number,
  topic: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Quiz = mongoose.model("Quiz",newQuiz);
export default Quiz;