import mongoose from "mongoose";
const response = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    answers:{
        type:Map,
        of:String
    },
    score:{
        type:Number,
        required:true
    }
})
const quizResponse = mongoose.model("quizResponse",response);
export default quizResponse