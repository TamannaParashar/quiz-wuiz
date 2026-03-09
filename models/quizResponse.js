import mongoose from "mongoose";
const response = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    answers: {
        type: Map,
        of: String
    },
    codingAnswers: {
        type: Map,
        of: String
    },
    score: {
        type: Number,
        required: true
    },
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    warnings: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
})
const quizResponse = mongoose.model("quizResponse", response);
export default quizResponse