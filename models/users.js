const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose");

const userSchema=new Schema({
    email:{
        type:String,
        required:true,
    },
    quizzesCreated: [{ type: Schema.Types.ObjectId, ref: 'Quiz' }],
    quizzesAttempted: [{
        quiz: { type: Schema.Types.ObjectId, ref: 'Quiz' },
        score: { type: Number, default: 0 },
        createdAt: { type: Date, default: Date.now }
      }]
});

userSchema.plugin(passportLocalMongoose);

module.exports=mongoose.model("User",userSchema);