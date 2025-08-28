import mongoose from "mongoose";

const newQuiz = new mongoose.Schema({
    content:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
});

const Quiz = mongoose.model("Quiz",newQuiz);
export default Quiz;