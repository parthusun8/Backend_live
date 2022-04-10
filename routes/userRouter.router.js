const express = require('express')
const USER = require('../models/user.mongo')

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
        GENDER:"MALE"
    })

    await newuser.save();
    console.log(newuser);
    res.send({
        Message:"Created a USER."
    })
})
userRouter.post('/createUser',async(req,res)=>{
    const newuser = new USER({
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
    })

    for(let i = 0;i<req.body.INTERESTED_SPORTS.length;i++){
        newuser.INTERESTED_SPORTS.push(req.body.INTERESTED_SPORTS[i]);
    }
    for(let j = 0;j<req.body.FRIENDS_LIST.length;j++){
        newuser.FRIENDS_LIST.push(req.body.FRIENDS_LIST[j]);
    }
    await newuser.save();
    console.log(newuser);
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

module.exports = userRouter;