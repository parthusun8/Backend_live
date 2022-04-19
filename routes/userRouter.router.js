const express = require('express')
const { default: mongoose } = require('mongoose')
const USER = require('../models/user.mongo')
const USERProfile = require('../models/userprofile.model')

const userRouter = express.Router()

userRouter.get('/',(req,res)=>{
    res.send({
        Message:'userRouter'
    })
})

//change to post
userRouter.get('/createTestUser',async(req,res)=>{
    const newuser = new USER({
        USERID:"user1",
        PHONE:"98213*****",
        NAME:"James",
        PWD:"abc234",
        GENDER:"MALE",
    })
    await newuser.save();
    res.send({
        Message:"Created a USER."
    })
})
userRouter.post('/createUser',async(req,res)=>{
    const newuser = new USER(
        {
        USERID:req.body.USERID,
        PHONE:req.body.PHONE,
        NAME:req.body.NAME,
        EMAIL:req.body.EMAIL,
        PWD:req.body.PWD,
        GENDER:req.body.GENDER,
        DOB:req.body.DOB,
        CITY:req.body.CITY,
        STATE:req.body.STATE,
        SPORTS_ACADEMY:req.body.SPORTS_ACADEMY,
        PROFILE_ID:req.body.PROFILE_ID
    }
    )
    for(let i = 0;i<req.body.INTERESTED_SPORTS.length;i++){
        newuser.INTERESTED_SPORTS.push(req.body.INTERESTED_SPORTS[i]);
    }
    for(let j = 0;j<req.body.FRIENDS_LIST.length;j++){
        newuser.FRIENDS_LIST.push(req.body.FRIENDS_LIST[j]);
    }
    await newuser.save();
    res.send({
        Message:"Created a USER"
    })
})
userRouter.post('/userResetPwd',async (req,res)=>{
    const query = {USERID:req.body.USERID}
    const user = await USER.exists(query)
    if(user){
        const newuser = await USER.findOneAndUpdate(query,{
            PWD:req.body.PWD
        })
        res.status(200).send({
            Message:'USER Updated'
        })
    }else{
        res.status(404).send({
            Message:'USER does not Exist'
        })
    }
})

userRouter.post('/userProfileBuild',async(req,res)=>{
    const new_USERPRofile = new USERProfile(req.body)
    try{
        await new_USERPRofile.save()
        res.status(200).send({
            Message:"Successfully Updated Userprofile"
        })
    }catch(err){
        console.log(err);
        res.status(404).send({
            Message:"Error in Profile creation"
        })
    }
})

userRouter.post('/userResetPwd',async (req,res)=>{
    const query = {USERID:req.body.USERID}
    const user = await USER.exists(query)
    if(user){
        const newuser = await USER.findOneAndUpdate(query,{
            PWD:req.body.PWD
        })
        res.status(200).send({
            Message:'USER Updated'
        })
    }else{
        res.status(404).send({
            Message:'USER does not Exist'
        })
    }
})


userRouter.post('/userProfileBuild',async(req,res)=>{
    const new_USERPRofile = new USERProfile(req.body)
    try{
        await new_USERPRofile.save()
        res.status(200).send({
            Message:"Successfully Updated Userprofile"
        })
    }catch(err){
        console.log(err);
        res.status(404).send({
            Message:"Error in Profile creation"
        })
    }
})

userRouter.post('/userLogin',async (req,res)=>{
    const loginid = req.body.loginid
    const pwd = req.body.pwd
    try{
        const user = await USER.findOne({
            USERID:loginid
        })
        if(user.PWD==pwd){
            res.status(200).send({
                Message:'USER Verified'
            })
        }
        else{
            res.status(404).send({
                Message:'Incorrect Pwd'
            })
        }
    }catch(err){
        res.status(404).send({
            Message:"Invalid USERID"
        })
    }
})

module.exports = userRouter;