const mongoose=require("mongoose");
const Schema=mongoose.Schema;
// const  Review= require("./review");

const QuizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    instructions:{type: String},
    code: { type: String, unique: true, required: true, maxlength: 6 }, 
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    owner:{
      type:Schema.Types.ObjectId,
      ref:"User"
  },
  createdAt:{ type: Date, default: Date.now }
  });
  
  const Quiz = mongoose.model('Quiz', QuizSchema);
  
module.exports=Quiz;

