if(process.env.NODE_ENV!="production"){
    require('dotenv').config();
}


const express=require("express");
const app=express();
const path=require("path");
const port=3030;
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const mongoose=require("mongoose");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");

const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");

const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/users.js");
const Quiz=require("./models/quiz.js");
const Question=require("./models/questions.js");

const {saveRedirectUrl, isLoggedIn}=require("./middleware.js");

const { generateUniqueCode }=require('./function.js');

MONGO_URL='mongodb://127.0.0.1:27017/cognify';
dbUrl=process.env.ATLASDB_URL;

main()
    .then(()=>{
        console.log('Connection Successful! DB Connected!');
    })
    .catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
});

store.on('error',()=>{
    console.log("ERROR IN MONGO SESSION STORE",err);
});

const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized: true,
    cookie:{
        expires:Date.now()+ 1000*60*60*24*3,
        maxAge:1000*60*60*24*3,
        httpOnly:true
    }
};



app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"/public")));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.listen(port,()=>{
    console.log("Server is listening to port: ",port);
});


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});


app.get("/",(req,res)=>{
    res.render("./home.ejs");
});

app.get("/quiz/new",isLoggedIn,(req,res)=>{
    res.render("./quiz/new.ejs");
});

app.post("/quiz/new",wrapAsync(async(req,res,next)=>{
    let quiz=(req.body.quiz);
    quiz.code=generateUniqueCode();
    quiz.owner=req.user._id;
    // console.log(quiz);
    const newQuiz=new Quiz(quiz);
    let savedQuiz=await newQuiz.save();
    console.log(savedQuiz);
    res.redirect(`/quiz/${savedQuiz._id}`);

}));

app.get("/quiz/attempt",isLoggedIn,async(req,res)=>{
    let quizzes=await Quiz.find();
    // console.log(quizzes);
    res.render("./quiz/validateCode.ejs",{quizzes});
});

app.get("/quiz/attempt/check-code", isLoggedIn, wrapAsync(async (req, res,next) => {
    const accessCode = req.query['access-code'];
    const quiz = await Quiz.findOne({ code: accessCode });

    if (quiz) {
        res.redirect(`/quiz/attempt/${quiz.id}`);
    } else {
        req.flash('error', 'Wrong code entered. Please try again.');
        res.redirect("/quiz/attempt");
    }
}));

app.get(`/quiz/attempt/:id`,isLoggedIn,wrapAsync(async(req,res,next)=>{
    let {id}=req.params;
    let quiz=await Quiz.findById(id).populate("questions");
    res.render("./quiz/attempt.ejs",{quiz});
}));

app.post("/quiz/attempt/:id",isLoggedIn,wrapAsync(async(req,res,next)=>{
    let {id}=req.params;
    // let userQuiz=await Quiz.findById(id);
    let responses=req.body;
    // console.log(id);
    // console.log(responses);
    score=0;
    for (const questionId in responses) {
        const userAnswer = responses[questionId];
        console.log(userAnswer);
        let question=await Question.findById(questionId);
        // const selectedType = question.type;
        console.log(question.correctAnswer);
        // console.log(question.type);
        if(question.correctAnswer === userAnswer){
            score++;
        };
    }
    console.log(score);
    currUser=req.user;
    currUser.quizzesAttempted.push({
        quiz: id,
        score: score,
      });
    await currUser.save();
    console.log(currUser);
    res.redirect(`/user/${currUser.id}`);
}));

app.get("/quiz/:id",isLoggedIn,wrapAsync(async(req,res,next)=>{
    let {id}=req.params;
    let quiz=await Quiz.findById(id).populate("questions");
    res.render("./quiz/addQues.ejs",{quiz});
}));




app.post("/quiz/:id",isLoggedIn,wrapAsync(async(req,res)=>{
    let question=req.body.question;
    const selectedType = question.type;

  if (selectedType === '1') {
    question.correctAnswer= question.mcq;
  } else if (selectedType === '2') {
    question.correctAnswer= question.trueFalseAnswer;
  } else if (selectedType === '3') {
    question.correctAnswer= question.descriptive;
  }
    
    console.log(question);
    const newQuestion=new Question(req.body.question);
    let {id}=req.params;
    console.log(id);
    let quiz=await Quiz.findById(id);
    console.log(quiz);
    quiz.questions.push(newQuestion);
    await newQuestion.save();
    await quiz.save();
    req.flash("success","New Question Added!");
    res.redirect(`/quiz/${quiz.id}`);
}));

app.delete("/quiz/:id",async(req,res)=>{
    let {id}=req.params;
    let quiz=await Quiz.findById(id);
    let deleteQuestions = await Question.deleteMany({ _id: { $in: quiz.questions } });
    const deleteQuiz=await Quiz.findByIdAndDelete(id);
    console.log(deleteQuiz);
    res.redirect(`/user/${res.locals.currUser.id}}`);
});

app.get("/user/:id",isLoggedIn,wrapAsync(async(req,res,next)=>{
    let {id}=req.params;
    let quizzes=await Quiz.find({owner:`${res.locals.currUser.id}`});
    console.log(quizzes);
    res.render("./quiz/userHome.ejs",{quizzes});
    // console.log(res.locals.currUser.id);
}));

app.delete("/question/:id",wrapAsync(async(req,res,next)=>{
    let {id:quesId}=req.params;
    let deletedQuestion=await Question.findByIdAndDelete(quesId);
    // console.log(deletedQuestion);
    const quiz=await Quiz.findOne({ questions: quesId });
    console.log(quiz);
    const deleteFromQuiz = await Quiz.findOneAndUpdate({ questions: quesId },{$pull:{ questions: quesId }});
    // console.log(deleteFromQuiz);
    req.flash("success","Question deleted.");
    res.redirect(`/quiz/${quiz.id}`);
}));


//USER AUTHENTICATION:
app.get("/signup",(req,res)=>{
    res.render("./users/signup.ejs");
});

app.post("/signup",wrapAsync(async(req,res)=>{
    try{
    let {username,email,password}=req.body;
    const newUser=new User({email,username});
    registeredUser=await User.register(newUser,password);
    console.log(registeredUser);
    req.login(registeredUser,(err)=>{
        if(err){
            return next(err);
        }
        req.flash("success",`Welcome to Cognifi @${username}!`);
        res.redirect("/");
    });
}catch(e){
    req.flash("error",e.message);
    res.redirect("/signup");
}
}));

app.get("/login",(req,res)=>{
    res.render("./users/login.ejs");
})

app.post("/login",saveRedirectUrl,passport.authenticate("local",{failureRedirect:'/login',failureFlash:true}),wrapAsync(async(req,res,next)=>{
    req.flash("success","Successfully logged in!");
    let redirectUrl=res.locals.redirectUrl || "/";
    res.redirect(redirectUrl);
}));

app.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            next(err);
        }
        req.flash("success","Logged out successfully!");
        res.redirect("/");
    });

});

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not found"));
});


app.use((err,req,res,next)=>{
    let {statusCode="500",message="Something went wrong!"}=err;
    res.render("error.ejs",{err});
    // res.status(statusCode).send(message);
});