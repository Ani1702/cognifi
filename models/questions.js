const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const questionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    type: { type: String, required: true },
    options: [{ type: String }], // Only for 'mcq' type
    correctAnswer: { type: String }, // For 'mcq' and 'truefalse' types
  });

const Question=mongoose.model("Question",questionSchema);
module.exports=Question;