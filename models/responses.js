const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const ResponseSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    answers: [{ question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' }, response: String }],
  });
  
  const Response = mongoose.model('Response', ResponseSchema);

  module.exports=Response;
  