import mongoose from "mongoose";

const newQuiz = new mongoose.Schema({
    content:{
        type:String,
        required:true
    },
    ansKey:{
        type:String,
        required:true
    },
    time:{
        type:Number,
        required:true
    },
    topic:{
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