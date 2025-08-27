const mongoose = require('mongoose');
const url = "mongodb://localhost:27017/quiz-wuiz";

mongoose.connect(url,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db  = mongoose.connection

db.on('connect',()=>{
    console.log("Connected to mongoose");
});

db.on('disconnect',()=>{
    console.log("Disconnected from mongoose");
});