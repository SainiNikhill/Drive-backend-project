const express = require('express')
const router = express.Router();
const { body, validationResult } = require("express-validator");
const userModel = require("../models/user.model")
const bcrypt = require('bcryptjs')
const jwt =require('jsonwebtoken')




router.get('/register',(req,res)=>{
    res.render('register')
})

router.post('/register',
    body('email').trim().isEmail(),
    body('password').trim().isLength({min:5}),
    body('username').trim().isLength({min:3}),
    
    async (req,res)=>{
        const errors =validationResult(req)
    if(!errors.isEmpty()){
        return  res.status(400).json({
            error:errors.array(),
            message:"invalid data"
        })
    }

    ///if error is not comming create a new user 

    const {email,username,fullname,password}= req.body;

    const hashPassword = await bcrypt.hash(password,10)
    const newUser = await userModel.create({
        email,username,fullname,
        password: hashPassword
    })
    res.redirect('/home')
       
})

//login
router.get('/login',(req,res)=>{
    res.render('login')
})
router.post('/login',
    body('username').trim().isLength({min:3}),
    body('password').trim().isLength({min:5}),
    
    async (req,res)=>
        {
        const errors =validationResult(req)
        if (!errors.isEmpty()) {
          return res.status(400).json({
            error: errors.array(),
            message: "invalid data",
          });
        }

        const {username,password}=req.body;
        const user =await userModel.findOne({
            username:username
        })

        if(!user){
            return res.status(400).json({
                meassage:'username or password is incorrect'
            })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(400).json({
                message:"username or password is incorrect"
            })
        }
        const token = jwt.sign({
            userId:user._id,
            email:user.email,
            username:user.username
        },
        process.env.JWT_SECRET,)
        
        //using cookieparser

        res.cookie('token',token)
        res.redirect("/home")



    

})



module.exports = router;