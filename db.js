import mongoose from "mongoose";
const url = "mongodb://localhost:27017/quiz-wuiz";

mongoose.connect(url,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db  = mongoose.connection

db.on('connected',()=>{
    console.log("Connected to mongoose");
});

db.on('disconnected',()=>{
    console.log("Disconnected from mongoose");
});