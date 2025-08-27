const mongoose = require("mongoose");

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

const Quiz = mongoose.Model("Quiz",newQuiz);
module.exports(Quiz);