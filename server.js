const express = require('express');
const session = require('express-session');
const mongodbSession = require('connect-mongodb-session')(session)
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const userModel = require('./models/user');
const bodyParser = require('body-parser');

const app = express();

// db connection
const uri = 'mongodb://127.0.0.1:27017/sessions'
mongoose.connect(uri)
    .then(() => {
        console.log('db connected');
    })
    .catch((err) => {
        console.log(err);
    });

    const store = new mongodbSession({
         uri:uri,
         collection:'mySessions'
    })


app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(session({
    secret:'secret',
    resave:false,
    saveUninitialized:false,
    store:store
}))

app.set('view engine', 'ejs');


const isAuth=(req,res,next)=>{
    if(req.session.isAuth){
        next()
    }else{
        res.redirect('/')
    }
}


app.post('/register',async(req,res)=>{
    try {
        const {email,password}= req.body
        const hash = await bcrypt.hash(password,12)
        const user = await userModel.create({email,password:hash})
        res.redirect('/')
    } catch (error) {
        console.log('nik mha ghir lyoum ',error);
        
    }
})
app.get('/register', (req, res) => {
    res.render('register');
});


app.post('/', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json('Invalid user');
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json('Invalid password');
        }
        req.session.isAuth=true
        res.redirect('/home');
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json('An error occurred during login');
    }
});

app.post('/logout',(req,res)=>{
    req.session.destroy((err)=>{
        if(err) throw err ;
        res.redirect('/')
    })
})




app.get('/', (req, res) => {
    res.render('login');
});
app.get('/home', isAuth ,(req,res)=>{
    res.render('home')
})

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
