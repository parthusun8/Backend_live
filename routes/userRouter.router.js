const moment = require('moment')
const axios = require('axios')
const express = require('express')
const mongoose = require('mongoose')
const USER = require('../models/user.mongo')
const USERProfile = require('../models/userprofile.model')
const stripe = require('stripe')("sk_test_51Kx9oUSDyPLJYmvrHGifQoOVMJTLzveCWgOMKSdYGUKOhgqEW5pDoA9XTbs5NDki9XW4mmU4wNna8uFdpoM0BanG00uedfdbjt")
const instacricket = require('../models/instacricket.mongo')
const tournamentModel = require('../models/tournament.model')
const onlytournamentModel = require('../models/tourney.mongo')
const matchesmodel = require('../models/matches.mongo')
const paymentsmodel = require('../models/userpayments.mongo')
const userRouter = express.Router()
const ruleschema = require('../models/rules.mongo')
const S3 = require('aws-sdk/clients/s3')
const fs = require('fs')
const multer = require('multer')
const razorpay = require('razorpay')
const dbles = require('../models/doubles.mongo')
const timings = require('../models/timings.mongo')
const matchtiming = require('../models/matchtimings.mongo')
const csvgen = require('json2csv').Parser
const pwd_reset = require('../models/password_reset.mongo')
const nodemailer = require('nodemailer')

const rzp_instance = new razorpay({
    key_id:'rzp_live_4JAecB352A9wtt',
   key_secret:'UhkUVQq781FVniExGipwVCwi'
})
const s3 = new S3({
    region:'ap-south-1',
    accessKeyId:'AKIAZCDZBASTOLTWPCVW',
    secretAccessKey:'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'   
})
const uploadFile = (file)=>{
    const fileStream = fs.createReadStream(file.path)
    const BucketParams = {
        Bucket:'ardentbucketnew',
        Body:fileStream,
        Key:file.filename
    }
    return s3.upload(BucketParams).promise()
}
const getfile = (key)=>{
    const downloadParams = {
        Key:key,
        Bucket:'ardentbucketnew'
    }
    return s3.getObject(downloadParams).createReadStream()
}
//multer configs
const uploadoptions = multer({dest:'./imgfolder/'})

userRouter.get('/',(req,res)=>{
    if(!req.query.no_of_spots){
        res.render('please_select_spots')
    }
    else{
        res.render('fixture',{no_of_bracs:req.query.no_of_spots})
    }
})
userRouter.get('/getTournamentFixtures',async (req,res)=>{
    //TOURNAMENT_ID required
    tournamentModel.findOne({
        TOURNAMENT_ID:req.query.TOURNAMENT_ID
    },function(error,result){
        if(error){
            console.log(error)
            res.status(404).send({
                Message:'Error'
            })
        }
        if(result){
            console.log(result)
            matchesmodel.findOne({
                TOURNAMENT_ID:result.TOURNAMENT_ID
            },function(error,d){
                if(error){
                    res.status(404).send({
                        Message:'Error'
                    })      
                }
                else{
                        res.render('tourna_fixture',{TOURNEY_ID:req.query.TOURNAMENT_ID,no_of_bracs:result.NO_OF_KNOCKOUT_ROUNDS})
                }
            })
        }
    })
})
userRouter.get('/getBookingFixtures',async (req,res)=>{
    //TOURNAMENT_ID required
    tournamentModel.findOne({
        TOURNAMENT_ID:req.query.TOURNAMENT_ID
    },function(error,result){
        if(error){
            console.log(error)
            res.status(404).send({
                Message:'Error'
            })
        }
        if(result){
            console.log(result)
            matchesmodel.findOne({
                TOURNAMENT_ID:result.TOURNAMENT_ID
            },function(error,d){
                if(error){
                    res.status(404).send({
                        Message:'Error'
                    })      
                }
                else{
                    if(d.MATCHES.length==0){
                        res.render('not_started_view',{TOURNEY_ID:req.query.TOURNAMENT_ID,no_of_bracs:result.NO_OF_KNOCKOUT_ROUNDS,USERID:req.query.USERID})
                    }
                    else{
                        res.render('booking_fixture',{TOURNEY_ID:req.query.TOURNAMENT_ID,no_of_bracs:result.NO_OF_KNOCKOUT_ROUNDS,USERID:req.query.USERID})
                    }
                }
            })
        }
    })
})

//change to post
userRouter.get('/createTestUser',async(req,res)=>{
    const newuser = new USER({
        USERID:"user2",
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
userRouter.post('/createUser',async (req,res,next)=>{
    try{
        const usr = await USER.findOne({
            USERID:req.body.USERID
        })
        if(usr){
            res.status(404).send({
                Message:'User Exists'
            })
        }
        else{
            next()
        }
    }catch(error){
        console.log(error)
        res.status(404).send({
            Message:'Unknown Error'
        })
    }
},async(req,res)=>{
    try{
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

    }catch(error){
        console.log(error)
        res.status(404).send({
            Message:'Unknown Error'
        })
    }
})
userRouter.get('/checkHealth',async(req,res)=>{
    console.log('Health Check')
    res.status(200).send({
        Message:'Health OK'
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
userRouter.get('/perMatchEstimatedTime',async (req,res)=>{
    const tid = req.query.TOURNAMENT_ID 
    timings.findOne({
        TOURNAMENT_ID:tid
    },function(e,r){
        if(e){
            res.status(200).send({
                Message:'Error'
            })
        }
        else{
            res.status(200).send({
                Message:r.TIMING_IN_MINUTES
            })
        }
    })    
})
userRouter.post('/findUserByID',async (req,res)=>{
    try{
        const r = await USER.findOne({
            USERID:req.body.USERID
        })
        if(r){
            var response = r
            response['Message'] = 'Success'
            res.status(200).send(response)
        }
        else{
            res.status(200).send({
                Message:'Failure'
            })
        }
    }catch(e){
        res.status(404).send({
            Message:'Error'
        })
    }
})
userRouter.post('/removeUser', async (req,res)=>{
    const query = {USERID: req.body.USERID}
    const user = await USER.exists(query)
    if(user){
        const newuser = await USER.findOneAndDelete(query)
        res.status(200).send({
            Message:'USER Deleted'
        })
    }else{
        res.status(404).send({
            Message:'USER does not Exist'
        })
    }
});
userRouter.post('/updatePerMatchEstimatedTime',async (req,res)=>{
    //reqd tournamentID and timing in minutes
    const tid = req.body.TOURNAMENT_ID 
    const time = req.body.PER_MATCH_ESTIMATED_TIME 
    try{
        const t = await timings.findOne({
            TOURNAMENT_ID:tid
        })
        if(t){
            timings.updateOne({
                TOURNAMENT_ID:tid
            },{
                TIMING_IN_MINUTES:time
            },function(e,r){
                if(e){
                    throw e
                }
                else{
                    res.status(200).send({
                        Message:'Updated'
                    })
                }
            })
        }
        else{
            const dt = {
                TOURNAMENT_ID:tid,
                TIMING_IN_MINUTES:time
            }
            const dt2 = new timings(dt)
            const r2 = await dt2.save()
            if(r2){
                res.status(200).send({
                    Message:'Updated'
                })
            }
            else{
                res.status(200).send({
                    Message:'Error'
                })
            }
        }
    }catch(err){
        res.status(200).send({
            Message:'Error'
        })
    }
})
userRouter.post('/getProfile',async (req,res)=>{
    //for profile, userID required
    USER.findOne({
        USERID:req.body.USERID
    },function(error,result){
        if(result){
            result.Message = "Success"
            res.status(200).send(result)
        }
        else{
            console.log(error)
            res.status(404).send({
                Message:'User Profile Not Found'
            })
        }
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

userRouter.get('/walletPaymentVerify', async (req,res)=>{
    const user_id = req.query.USERID
    const intent_id = req.query.intent_id;
    try {                   
        const payment_intent = await stripe.paymentIntents.retrieve(intent_id)
        console.log(payment_intent);
        if(payment_intent){
        //use findOneandUpdate function of the user model
        //update the wallet balance of the user by the amount in the payment_intent object
        //Set the relevant JSON response under the tag Message as shown below
            res.status(200).send("Done Something")
        }
        else{
            const err = new Error("Unknown Error")
            throw err
        }
    } catch (error) {
        console.log(error);
        res.status(404).send({
            Message:'Error'
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
userRouter.get('/prizeMoney',async (req,res)=>{
    //reqd tournament_id
    try{
        const result = await tournamentModel.findOne({
            TOURNAMENT_ID:req.query.TOURNAMENT_ID
        })
        if(result){
            res.status(200).send({
            GOLD:`${result.GOLD}`,
            SILVER:`${result.SILVER}`,
            BRONZE:`${result.BRONZE}`
        })
        }
    }catch(error){
        console.log(error)
        res.status(200).send({
            GOLD:'NA',
            SILVER:'NA',
            BRONZE:'NA'
        })
    }
})
userRouter.get('/defaultProfilePic',async(req,res)=>{
    USER.updateMany({
        WALLET_BALANCE:0
    },{
        PROFILE_PIC_URL:'none'
    },function(error,result){
        if(error){
            res.status(404).send({
                Message:'Error'
            })
        }
        else{
            res.status(200).send({
                Message:'Updated all users'
            })
        }
    })
})
userRouter.get('/userDetails',async (req,res)=>{
    USER.findOne({
        USERID:req.query.USERID
    },function(error,result){
        if(error){
            console.log(error)
            res.status(404).send({
                Message:'User not found'
            })
        }
        else if(result){
            var Level = ''
            var TotalPoints = ''
            //level logic
            //100 means level 1
            //100 up means level 2
            //200 up means level 3
            if(result.POINTS<100){
                Level = '1'
                TotalPoints = "100"
            }
            else if(result.POINTS>=100&&result.POINTS<200){
                Level = '2'
                TotalPoints = "200"
            }
            else{
                Level = '3'
                TotalPoints = "500"
            }
            var ps = result.POINTS/parseInt(TotalPoints,10)
            res.status(200).send({
                Message:'User found',
                Name:result.NAME,
                Phone:result.PHONE,
                City:result.CITY,
                Points:`${ps}`,
                Profile_pic_url:result.PROFILE_PIC_URL,
                PointsScored:`${result.POINTS}`,
                Level:Level,
                TotalPoints:TotalPoints,
                TOTAL_TOURNAMENTS:`${result.CURRENT_TOURNAMENTS.length}`,
                TROPHIES:`${result.TROPHIES.length}`
            })
        }
    })
})
userRouter.get('/winnerDetails',async (req,res)=>{
    USER.findOne({
        USERID:req.query.USERID
    },function(error,result){
        if(error){
            console.log(error)
            res.status(404).send({
                Message:'User not found'
            })
        }
        else if(result){
            var Level = ''
            var TotalPoints = ''
            //level logic
            //100 means level 1
            //100 up means level 2
            //200 up means level 3
            if(result.POINTS<100){
                Level = '1'
                TotalPoints = "100"
            }
            else if(result.POINTS>=100&&result.POINTS<200){
                Level = '2'
                TotalPoints = "200"
            }
            else{
                Level = '3'
                TotalPoints = "500"
            }
            var ps = result.POINTS/parseInt(TotalPoints,10)
            res.status(200).send({
                Message:'User found',
                Name:result.NAME,
                Phone:result.PHONE,
                City:result.CITY,
                Points:`${ps}`,
                Profile_pic_url:result.PROFILE_PIC_URL,
                PointsScored:`${result.POINTS}`,
                Level:Level,
                TotalPoints:TotalPoints,
                TOTAL_TOURNAMENTS:result.CURRENT_TOURNAMENTS.length,
                TROPHIES:result.TROPHIES
            })
        }
    })
})
userRouter.get('/userDetailsName',async (req,res)=>{
    USER.findOne({
        USERID:req.query.USERID
    },function(error,result){
        if(error){
            console.log(error)
            res.status(404).send({
                Message:'User not found'
            })
        }
        else if(result){
            var Level = ''
            var TotalPoints = ''
            //level logic
            //100 means level 1
            //100 up means level 2
            //200 up means level 3
            if(result.POINTS<100){
                Level = '1'
                TotalPoints = "100"
            }
            else if(result.POINTS>=100&&result.POINTS<200){
                Level = '2'
                TotalPoints = "200"
            }
            else{
                Level = '3'
                TotalPoints = "500"
            }
            var ps = result.POINTS/parseInt(TotalPoints,10)
            res.status(200).send({
                Message:'User found',
                Name:result.NAME
            })
        }
    })
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

userRouter.post('/searchDoublesPartner',async (req,res)=>{
    const usr_to_be_found = await USER.findOne({
        USERID:req.body.PLAYER_2 
    })
    if(usr_to_be_found){
        res.status(200).send({
            Message:'User Found',
            USERID:usr_to_be_found.USERID,
            NAME:usr_to_be_found.NAME
        })
    }
    else{
        res.status(404).send({
            Message:"Player not found"
        })
    }
})
userRouter.post('/addDoublesPartner',async (req,res)=>{
    const usr_to_be_found = await USER.findOne({
        USERID:req.body.PLAYER_2
    })
    const doc = await dbles.findOne({
        TOURNAMENT_ID:req.body.TOURNAMENT_ID,
        PLAYER_1:req.body.PLAYER_1
    })
    if(doc){
        dbles.updateOne({
            TOURNAMENT_ID:req.body.TOURNAMENT_ID,
            PLAYER_1:req.body.PLAYER_1
        },{
            PLAYER_2:req.body.PLAYER_2
        },function(e,r){
            if(e){
                res.status(200).send({
                    Message:'Error'
                })
            }
            else{
                res.status(200).send({
                    Message:'Added a player'
                })
            }
        })
    }
    else{
        if(usr_to_be_found){
            const newplayer = new dbles({
                TOURNAMENT_ID:req.body.TOURNAMENT_ID,
                SPOT_NUMBER:req.body.SPOT_NUMBER,
                PLAYER_1:req.body.PLAYER_1,
                PLAYER_2:req.body.PLAYER_2
            })
            const r = await newplayer.save()
            if(r){
                res.status(200).send({
                    Message:"Player added"
                })
            }
        }
        else{
            const newplayer = new dbles({
                TOURNAMENT_ID:req.body.TOURNAMENT_ID,
                SPOT_NUMBER:req.body.SPOT_NUMBER,
                PLAYER_1:req.body.PLAYER_1,
                PLAYER_2:"NA"
            })
            const r = await newplayer.save()
            if(r){
                res.status(200).send({
                    Message:"Player added"
                })
            }
            // res.status(404).send({
            //     Message:"Player not found"
            // })
        }
    }
})

userRouter.get('/getUserDetails',async (req,res)=>{
    const userid = req.query.USERID
    USER.findOne({
        USERID:userid
    },function(error,result){
        if(error){
            console.log(error)
            res.status(404).send({
                Message:'Error'
            })
        }
        if(result){
            res.status(200).send({
                usrname:result.NAME,
                usrphone:result.PHONE,
                usracademy:result.CITY,
                usrsportsacademy:result.SPORTS_ACADEMY,
                usrgender:result.GENDER,
                usrmail:result.EMAIL 
            })
        }
    })
})
userRouter.post('/makePayment',async (req,res)=>{
    try {
        let customerId;
        console.log(process.env.STRIPE_SK_KEY)
        console.log(req.body.amount)
        console.log(typeof(req.body.amount))
        console.log(req.body.email)
        console.log(req.body.spot_number)
        //Gets the customer who's email id matches the one sent by the client
        const customerList = await stripe.customers.list({
            email: req.body.email,
            limit: 1
        });
                
        //Checks the if the customer exists, if not creates a new customer
        if (customerList.data.length !== 0) {
            customerId = customerList.data[0].id;
        }
        else {
            const customer = await stripe.customers.create({
                email: req.body.email
            });
            customerId = customer.id;
            
        }

        //Creates a temporary secret key linked with the customer 
        const ephemeralKey = await stripe.ephemeralKeys.create(
            { customer: customerId },
            { apiVersion: '2020-08-27' }
        );

        //Creates a new payment intent with amount passed in from the client
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount: parseInt(req.body.amount),
            currency: 'inr',
            customer: customerId,
        })

        res.status(200).send({
            paymentIntent: paymentIntent.client_secret,
            ephemeralKey: ephemeralKey.secret,
            customer: customerId,
            success: 'true',
        })
        
    } catch (error) {
        console.log(error)
        res.status(404).send({ success: 'false', error: error.message })
    }
})

userRouter.post('/sendDetails',async (req,res)=>{
    console.log(req.body.amount)
    res.status(200).send({
        Message:'Done Work'
    })
})

userRouter.post('/cricketMatchDetails', async (req,res)=>{
    //send team1_detials and send team_2 details as per the schema
    //Enter a random matchID as of now
    const newmatch = new instacricket(req.body)
    try{
        const savedMatch = await newmatch.save()
        if(savedMatch){
            res.status(200).send({
                Message:'Created a new instant cricket match'
            })
        }
    }
    catch(error){
        console.log(error)
        res.status(404).send({
            Message:'Could not create a new cricket match'
        })
    }
})

userRouter.get('/allTournaments2',async (req,res)=>{
    tournamentModel.find(function(error,result){
        if(error){
            res.status(404).send({
                Message:'Error'
            })
        }
        if(result){
            // console.log("In result")
            const istConstant = 5*60*60*1000+30*60*1000
            var r1 = Array.from(result)
            console.log(r1)
            var r2 = []
            for(let i=0;i<r1.length;i++){
                const curDate = new Date(new Date().getTime() + istConstant)
                const end_date = new Date(r1[i].END_DATE)
                if(curDate.getTime()<end_date.getTime()){
                    r2.push(r1[i])
                }
            }
            console.log(r2)
            res.status(200).send(result)
        }
    })
})
userRouter.get('/allTournaments',async (req,res)=>{
    try{
        const istConstant = 5*60*60*1000+30*60*1000
        const r1 = await tournamentModel.find().lean()
        if(r1){
            if(r1){
                var r2 = []
                console.log(typeof(r1))
                for(let i=0;r1[i];i++){
                    console.log(i)
                    console.log(r1[i].TOURNAMENT_ID)
                    const curDate = new Date(new Date().getTime() + istConstant)
                    const end_date = new Date(r1[i].END_TIMESTAMP)
                    console.log(curDate.getTime())
                    console.log(end_date.getTime())
                    console.log(curDate.getTime()>end_date.getTime())
                    if(curDate.getTime()<end_date.getTime()){
                        console.log(r1[i])
                        r2.push(r1[i])
                    }
                }
                res.status(200).send(r2)
            }

        }
    }catch(error){
        console.log(error)
        res.status(404).send({
            Message:'Unknown Error'
        })
    }
})
// get tournaments by USERID
//get tournament by ID
userRouter.get('/tournamentById',async (req,res)=>{
    tournamentModel.findOne({
        TOURNAMENT_ID:req.query.TOURNAMENT_ID
    },function(error,result){
        if(error){
            res.status(404).send({
                Message:'Error'
            })
        }
        if(result){
            res.status(200).send(result)
        }
    })
})
userRouter.post('/hostedTournaments',async (req,res)=>{
    USER.findOne({
        USERID:req.body.USERID
    },function(error,result){
        if(error){
            res.status(404).send({
                Message:'Error'
            })
        }
        if(result){
            res.status(200).send({
                Hosted_Tournaments:result.HOSTED_TOURNAMENTS
            })
        }
    })
})
userRouter.get('/hosted',async (req,res)=>{
    //requires tournament id
    tournamentModel.findOne({
        TOURNAMENT_ID:req.query.TOURNAMENT_ID
    },function(error,result){
        if(error){
            console.log(error)
            res.status(404).send({
                Message:'Error'
            })
        }
        if(result){
            console.log(result)
            matchesmodel.findOne({
                TOURNAMENT_ID:result.TOURNAMENT_ID
            },function(error,d){
                if(error){
                    res.status(404).send({
                        Message:'Error'
                    })      
                }
                else{
                    res.render('hosted_challenges',{TOURNEY_ID:req.query.TOURNAMENT_ID,no_of_bracs:result.NO_OF_KNOCKOUT_ROUNDS})
                }
            })
        }
    })
})
userRouter.get('/download',async (req,res)=>{
    res.render('download_csv',{TOURNEY_ID:req.query.TOURNAMENT_ID})
})
userRouter.get('/downloadStats',async (req,res)=>{
    //reqd_tournament_id
    const allUsers = await USER.find({
        WALLET_BALANCE:0  
    }).lean()
    if(allUsers){
        console.log(allUsers)
        tournamentModel.findOne({
            TOURNAMENT_ID:req.query.TOURNAMENT_ID
        },function(err,result){
            if(err){
                res.status(404).send({
                    Message:'Error in Receiving CSV'
                })
            }
            if(result){
                var usrArray = []
                for(var i=0;i<result.SPOT_STATUS_ARRAY.length;i++){
                    var a = result.SPOT_STATUS_ARRAY[i].split("-")
                    console.log(a)
                    if(a[0]=='confirmed'){
                        // USER.findOne({
                        //     USERID:a[1]
                        // },function(errr,ress){
                        //     if(ress){
                        //     }
                        // })
                        for(var j=0;j<allUsers.length;j++){
                            if(a[1]==allUsers[j].USERID){
                                usrArray = [...usrArray,{
                                    "NAME":allUsers[j].NAME,
                                    "USERID":allUsers[j].USERID,
                                    "PHONE":allUsers[j].PHONE,
                                    "POINTS":allUsers[j].POINTS,
                                    "CITY":allUsers[j].CITY,
                                    "STATE":allUsers[j].STATE
                                }]
                            }
                        }
                    }
                }
                console.log(usrArray)
                const fields = ["NAME","USERID","PHONE","POINTS","CITY","STATE"]
                const csvparse = new csvgen({fields});
                const data = csvparse.parse(usrArray)
                console.log(data);
                res.setHeader("Content-Type", "text/csv");
                res.setHeader("Content-Disposition","attachment; filename=details.csv");
                res.status(200).end(data);
            }
        })   
    }
})
userRouter.post('/updateBreakTime',async (req,res)=>{
    tournamentModel.updateOne({
        TOURNAMENT_ID:req.body.TOURNAMENT_ID
    },{
        BREAK_TIME:req.body.BREAK_TIME
    },function(e,r){
        if(e){
            console.log(e)
            res.status(404).send({
                Message:'Error'
            })
        }
        else{
            res.status(200).send({
                Message:'Updated'
            })
        }
    })
})
userRouter.get('/getConfirmationDetails',async (req,res)=>{
    //queryParams will have USERID and TOURNAMENT_ID
    const dblebool = req.query.TOURNAMENT_ID.split("-")[1]
    console.log(dblebool)
    if(dblebool.includes('D')){
        USER.findOne({
            USERID:req.query.USERID
        },function(error,result){
            if(error){
                console.log(error)
                res.status(404).send({
                    Message:'Failure'
                })
            }
            if(result){
                console.log(result)
                const name_of_user = result.NAME
                tournamentModel.findOne({
                    TOURNAMENT_ID:req.query.TOURNAMENT_ID
                },function(error,result2){
                    if(error){
                        console.log(error)
                        res.status(404).send({
                            Message:'Error in fetching tournament'
                        })
                    }
                    if(result2){
                        console.log('In doubles result')
                        dbles.findOne({
                            TOURNAMENT_ID:req.query.TOURNAMENT_ID,
                            PLAYER_1:req.query.USERID
                        },function(e1,r1){
                            if(e1){
                                res.status(200).send({
                                    Message:'Failure'
                                })
                            }
                            else{
                                const tname = result2.TOURNAMENT_NAME
                                const city = result2.CITY
                                const addr = result2.LOCATION
                                const entryFee = `${result2.ENTRY_FEE}`
                                const category = result2.CATEGORY
                                if(r1.PLAYER_2=='N/A'){
                                    res.status(200).send({
                                        username : `${name_of_user}`,
                                        tournament_name : tname,
                                        tournament_city : city,
                                        address : addr,
                                        fee : entryFee,
                                        cat : category
                                    })                                

                                }
                                else{
                                    USER.findOne({
                                        USERID:r1.PLAYER_2
                                    },function(e2,r2){
                                        if(r2){
                                            res.status(200).send({
                                                username : `${name_of_user} and ${r2.NAME}`,
                                                tournament_name : tname,
                                                tournament_city : city,
                                                address : addr,
                                                fee : entryFee,
                                                cat : category
                                            })                                
                                        }
                                    })
                                }
                            }
                        })

                    }
                })
            }
        })        
    }else{
        USER.findOne({
            USERID:req.query.USERID
        },function(error,result){
            if(error){
                console.log(error)
                res.status(404).send({
                    Message:'Failure'
                })
            }
            if(result){
                const name_of_user = result.NAME
                tournamentModel.findOne({
                    TOURNAMENT_ID:req.query.TOURNAMENT_ID
                },function(error,result2){
                    if(error){
                        console.log(error)
                        res.status(404).send({
                            Message:'Error in fetching tournament'
                        })
                    }
                    if(result2){
                        const tname = result2.TOURNAMENT_NAME
                        const city = result2.CITY
                        const addr = result2.LOCATION
                        const entryFee = `${result2.ENTRY_FEE}`
                        const category = result2.CATEGORY
                        res.status(200).send({
                            username : name_of_user,
                            tournament_name : tname,
                            tournament_city : city,
                            address : addr,
                            fee : entryFee,
                            cat : category
                        })
                    }
                })
            }
        })
    }
})
userRouter.get('/hostedTournaments',async (req,res)=>{
    try{
        const istConstant = 5*60*60*1000+30*60*1000
        const userid = req.query.USERID
        const usrresult = await USER.findOne({
            USERID:userid
        }).lean()
        const r1 = await tournamentModel.find().lean()
        if(usrresult&&r1){
            if(r1){
                var r2 = []
                console.log(typeof(r1))
                for(let i=0;r1[i];i++){
                    console.log(i)
                    console.log(r1[i].TOURNAMENT_ID)
                    const curDate = new Date(new Date().getTime() + istConstant)
                    const end_date = new Date(r1[i].END_TIMESTAMP)
                    console.log(usrresult.HOSTED_TOURNAMENTS)
                    console.log(curDate.getTime())
                    console.log(end_date.getTime())
                    console.log(curDate.getTime()>end_date.getTime())
                    if(curDate.getTime()<end_date.getTime()&&usrresult.HOSTED_TOURNAMENTS.includes(r1[i].TOURNAMENT_ID)){
                        console.log(r1[i])
                        r2.push(r1[i])
                    }
                }
                res.status(200).send(r2)
            }

        }
    }catch(error){
        console.log(error)
        res.status(404).send({
            Message:'Unknown Error'
        })
    }
})
userRouter.get('/isTimeExceeded',async (req,res)=>{
    //give TOURNAMENT ID
    tournamentModel.findOne({
        TOURNAMENT_ID:req.query.TOURNAMENT_ID
    },function(error,result){
        if(error){
            res.status(404).send({
                Message:'Error in fetching Tournament'
            })
        }
        if(result){
            const istConstant = 5*60*60*1000+30*60*1000
                const starttimestamp = result.START_TIMESTAMP
                const regclosesbefore = result.REGISTRATION_CLOSES_BEFORE
                const d1 = new Date(new Date(starttimestamp).getTime() - regclosesbefore*60*60*1000).getTime()
                const d2 = new Date(new Date().getTime()+istConstant).getTime()
                if(d2>=d1){
                    res.status(200).send({
                        Message:"true"
                    })
                }
                else if(d2<=d1){
                    res.status(200).send({
                        Message:"false"
                    })
                }
        }
    })
})
userRouter.get('/myBookings',async (req,res)=>{
    const userid = req.query.USERID
    try{
        const result = await USER.findOne({
            USERID:userid
        })
        if(result){
            if(result.CURRENT_TOURNAMENTS.length==0){
                res.status(200).send([]) 
            
            ;}
            else{
                var r1 = []
                for(let i =0; i< result.CURRENT_TOURNAMENTS.length;i++){
                    try{
                        const tournament = await tournamentModel.findOne({
                            TOURNAMENT_ID:result.CURRENT_TOURNAMENTS[i]
                        })
                        r1.push(tournament)
                    }catch(error){
                        console.log(error)
                    }
                }
                if(r1.length!=0){
                    console.log(r1)       
                    res.status(200).send(r1)
            }
        }
        }
        else{
            res.status(404).send([])
        }
    }catch(error){
        console.log(error)
        res.status(404).send({
            Message:'Error'
        })
    }
})
userRouter.get('/tournamentInMyBookings',async (req,res)=>{
    //requires USERID, TOURNAMENT_ID
    USER.findOne({
        USERID:req.body.USERID
    },function(error,result){
        if(error){
            console.log(error)
            res.status(404).send({
                Message:"Booking not approved"
            })
        }
        if(result){
            const curr_bookings = result.CURRENT_TOURNAMENTS
            if(curr_bookings.indexOf(req.body.TOURNAMENT_ID)!=-1){
                res.status(200).send({
                    Message:'Already booked spot for this Tournament'
                })
            }
            else if(curr_bookings.indexOf(req.body.TOURNAMENT_ID)==-1){
                res.status(200).send({
                    Message:'Booking Approved'
                })
            }
        }
    }) 
})
userRouter.post('/updateScore',async (req,res)=>{
    //required TOURNAMENT_ID,
    //required MATCHID
    //set
    //PLAYER_1_SCORE
    //PLAYER_2_SCORE
    console.log(req.body)
    matchesmodel.findOne({
        TOURNAMENT_ID:req.body.TOURNAMENT_ID
    },function(error,result){
        if(error){
            console.log(error)
            res.status(404).send({
                Message:'Error'
            })
        }
        if(result){ 
            if(req.body.set=="1"){
                matchesmodel.updateOne({
                    TOURNAMENT_ID:req.body.TOURNAMENT_ID
                },{
                    $set:{
                        "MATCHES.$[elem].PLAYER1_SCORE.set1":parseInt(req.body.PLAYER_1_SCORE),
                        "MATCHES.$[elem].PLAYER2_SCORE.set1":parseInt(req.body.PLAYER_2_SCORE)
                    }
                },{
                    arrayFilters:[{"elem.MATCHID":req.body.MATCHID}]
                },function(error,result){
                    if(error){
                        console.log(error)
                    }
                    else{
                        res.status(200).send({
                            Message:'Success for updating score'
                        })
                    }
                })
            }
            else if(req.body.set=="2"){
                matchesmodel.updateOne({
                    TOURNAMENT_ID:req.body.TOURNAMENT_ID
                },{
                    $set:{
                        "MATCHES.$[elem].PLAYER1_SCORE.set2":parseInt(req.body.PLAYER_1_SCORE),
                        "MATCHES.$[elem].PLAYER2_SCORE.set2":parseInt(req.body.PLAYER_2_SCORE)
                    }
                },{
                    arrayFilters:[{"elem.MATCHID":req.body.MATCHID}]
                },function(error,result){
                    if(error){
                        console.log(error)
                    }
                    else{
                        res.status(200).send({
                            Message:'Success for updating score'
                        })
                    }
                })
            }
            else{
                matchesmodel.updateOne({
                    TOURNAMENT_ID:req.body.TOURNAMENT_ID
                },{
                    $set:{
                        "MATCHES.$[elem].PLAYER1_SCORE.set3":parseInt(req.body.PLAYER_1_SCORE),
                        "MATCHES.$[elem].PLAYER2_SCORE.set3":parseInt(req.body.PLAYER_2_SCORE)
                    }
                },{
                    arrayFilters:[{"elem.MATCHID":req.body.MATCHID}]
                },function(error,result){
                    if(error){
                        console.log(error)
                    }
                    else{
                        res.status(200).send({
                            Message:'Success for updating score'
                        })
                    }
                })
            }
        }
    })

})
userRouter.get('/profilePicUrl',async(req,res)=>{
    try{
        const usr=await USER.findOne({
            USERID:req.query.USERID
        })
        if(usr){
            console.log(usr)
            if(!usr.PROFILE_PIC_URL){
                res.status(200).send({
                    Message:"No Image"
                })                
            }
            else{
                res.status(200).send({
                    Message:usr.PROFILE_PIC_URL
                })
            }
        }
    }catch(error){
        res.status(404).send({
            Message:"No Image"
        })
    }
})
userRouter.get('/getScore',async (req,res)=>{
    //requires TOURNAMENT_ID and MATCHID
    matchesmodel.findOne({
        TOURNAMENT_ID:req.query.TOURNAMENT_ID
    },function(error,result){
        if(error){
            res.status(404).send({
                Message:'Tournament Not found'
            })
        }
        else{
            console.log(result)
            if(result.MATCHES.length==0){
                res.send("The Tournament has not started Yet")
            }
            else{
                result.MATCHES[parseInt(req.query.MATCHID.split(" ")[1])-1].MATCHID = req.query.MATCHID.split(" ")[1]
                result.MATCHES[parseInt(req.query.MATCHID.split(" ")[1])-1].TOURNAMENT_NAME = result.TOURNAMENT_NAME
                if(req.query.TOURNAMENT_ID[0]=='B'){
                    res.render('match_view',result.MATCHES[parseInt(req.query.MATCHID.split(" ")[1])-1])
                }
                else if(req.query.TOURNAMENT_ID[0]=='T'){
                    res.render('table_tennis_match_view',result.MATCHES[parseInt(req.query.MATCHID.split(" ")[1])-1])
                }
            }
        }
    })
})
userRouter.post('/walkover',async (req,res)=>{
    //reqd, tournament_id,zero_indexed_matchid
    const matchid = parseInt(req.body.MATCHID)
    console.log(matchid)
    console.log(req.body.WINNER_ID)
    matchesmodel.findOne({
        TOURNAMENT_ID:req.body.TOURNAMENT_ID
    },async function(err,ress){
        if(err){
            console.log(err)
            res.status(404).send({
                Message:'Error'
            })
        }
        else if(ress){
            const wn_deet = await USER.findOne({
                USERID:req.body.WINNER_ID
            })
            if(wn_deet){
                matchesmodel.updateOne({
                    TOURNAMENT_ID:req.body.TOURNAMENT_ID
                },{
                    $set:{
                        "MATCHES.$[elem].winner_id":req.body.WINNER_ID,
                        "MATCHES.$[elem].winner_name":wn_deet.NAME,
                        "MATCHES.$[elem].completion_status":"Done"
                    }
                },{
                    arrayFilters:[{"elem.MATCHID":ress.MATCHES[matchid].MATCHID}] 
                },async function(errr,resss){
                    if(errr){
                        res.status(404).send({
                            Message:'Error'
                        })
                    }
                    else if(resss){
                        //update next match spot
                        if(ress.MATCHES.length-2==matchid){
                            //update tournament_won
                            const twon_update = await USER.updateOne({
                                USERID:req.body.WINNER_ID
                            },{
                                $push:{
                                    TROPHIES:req.body.TOURNAMENT_ID
                                }
                            })
                            if(twon_update){
                                console.log('Update Next Match Spot Walkover')
                                if(ress.MATCHES[matchid].NEXT_MATCH_PLAYER_SPOT==0){
                                    matchesmodel.updateOne({
                                        TOURNAMENT_ID:req.body.TOURNAMENT_ID
                                    },{
                                        $set:{
                                            "MATCHES.$[elem].PLAYER1":req.body.WINNER_ID
                                        }
                                    },{
                                        arrayFilters:[{"elem.MATCHID":ress.MATCHES[matchid].NEXT_MATCH_ID}]
                                    },function(e,result2){
                                        if(e){
                                            console.log(e)
                                            res.status(404).send({
                                                Message:'Error'
                                            })
                                        }
                                        if(result2){
                                            res.status(200).send({
                                                Message:'Success',
                                            })
                                        }
                                    })
                                }
                                else if(ress.MATCHES[matchid].NEXT_MATCH_PLAYER_SPOT==1){
                                    matchesmodel.updateOne({
                                        TOURNAMENT_ID:req.body.TOURNAMENT_ID
                                    },{
                                        $set:{
                                            "MATCHES.$[elem].PLAYER2":req.body.WINNER_ID
                                        }
                                    },{
                                        arrayFilters:[{"elem.MATCHID":ress.MATCHES[matchid].NEXT_MATCH_ID}]
                                    },function(e,result2){
                                        if(e){
                                            console.log(e)
                                            res.status(404).send({
                                                Message:'Error'
                                            })
                                        }
                                        if(result2){
                                            res.status(200).send({
                                                Message:'Success',
                                            })
                                        }
                                    })
                                }
                            }
                        }
                        else{
                            console.log('Update Next Match Spot Walkover')
                            if(ress.MATCHES[matchid].NEXT_MATCH_PLAYER_SPOT==0){
                                matchesmodel.updateOne({
                                    TOURNAMENT_ID:req.body.TOURNAMENT_ID
                                },{
                                    $set:{
                                        "MATCHES.$[elem].PLAYER1":req.body.WINNER_ID
                                    }
                                },{
                                    arrayFilters:[{"elem.MATCHID":ress.MATCHES[matchid].NEXT_MATCH_ID}]
                                },function(e,result2){
                                    if(e){
                                        console.log(e)
                                        res.status(404).send({
                                            Message:'Error'
                                        })
                                    }
                                    if(result2){
                                        res.status(200).send({
                                            Message:'Success',
                                        })
                                    }
                                })
                            }
                            else if(ress.MATCHES[matchid].NEXT_MATCH_PLAYER_SPOT==1){
                                matchesmodel.updateOne({
                                    TOURNAMENT_ID:req.body.TOURNAMENT_ID
                                },{
                                    $set:{
                                        "MATCHES.$[elem].PLAYER2":req.body.WINNER_ID
                                    }
                                },{
                                    arrayFilters:[{"elem.MATCHID":ress.MATCHES[matchid].NEXT_MATCH_ID}]
                                },function(e,result2){
                                    if(e){
                                        console.log(e)
                                        res.status(404).send({
                                            Message:'Error'
                                        })
                                    }
                                    if(result2){
                                        res.status(200).send({
                                            Message:'Success',
                                        })
                                    }
                                })
                            }
                        }
                    }
                })
            }
            else{
                res.status(404).send({
                    Message:'Error'
                })
            }
        }
    })
})
userRouter.post('/tourney_exists',async (req,res)=>{
    //SPORT and TOURNAMENT_ID
    try{
        const result = await tournamentModel.findOne({
            TOURNAMENT_ID:req.body.TOURNAMENT_ID,
            SPORT:req.body.SPORT
        })
        if(result){
            res.status(200).send({
                Message:'Success'
            })
        }
        else{
            res.status(404).send({
                Message:'Not Found'
            })
        }
    }catch(error){
        console.log(error)
        res.status(404).send({
            Message:'Tournament not found'
        })
    }
})
userRouter.get('/endMatch',async (req,res)=>{
    //TOURNAMENT_ID and MATCHID,WINNER_ID
    const matchid = parseInt(req.query.MATCHID.split("-")[1])
    console.log(matchid)
    matchesmodel.findOne({
        TOURNAMENT_ID:req.query.TOURNAMENT_ID
    },async function(error,result){
        if(error){
            res.status(404).send({
                Message:'Error in tourna fetching'
            })
        }
        else{
            if(result.MATCHES.length-2==matchid){
                console.log(result)
                console.log('Finals')
                var WINNER = ""
                var LOSER = ""
                if(result.MATCHES[matchid].PLAYER1=="Not Booked"||result.MATCHES[matchid].PLAYER1=="Not Yet Assigned"){
                    WINNER = result.MATCHES[matchid].PLAYER2
                }
                else if(result.MATCHES[matchid].PLAYER2=="Not Booked"||result.MATCHES[matchid].PLAYER2=="Not Yet Assigned"){
                    WINNER = result.MATCHES[matchid].PLAYER1
                }
                else{
                    var set1 = 0
                    var set2 = 0
                    var set3 = 0
                    console.log(result.MATCHES[matchid].PLAYER1_SCORE)
                    console.log(result.MATCHES[matchid].PLAYER2_SCORE)
                    if((result.MATCHES[matchid].PLAYER1_SCORE.set1)>(result.MATCHES[matchid].PLAYER2_SCORE.set1)){
                        set1 = 1
                    }
                    else{
                        set1 = 0
                    }
                    if((result.MATCHES[matchid].PLAYER1_SCORE.set2)>(result.MATCHES[matchid].PLAYER2_SCORE.set2)){
                        set2 = 1
                    }
                    else{
                        set2 = 0
                    }
                    if((result.MATCHES[matchid].PLAYER1_SCORE.set3)>(result.MATCHES[matchid].PLAYER2_SCORE.set3)){
                        set3 = 1
                    }
                    else{
                        set3 = 0
                    }
                    var pl1sum= result.MATCHES[matchid].PLAYER1_SCORE.set1 + result.MATCHES[matchid].PLAYER1_SCORE.set2 + result.MATCHES[matchid].PLAYER1_SCORE.set3
                    var pl2sum = result.MATCHES[matchid].PLAYER2_SCORE.set1 + result.MATCHES[matchid].PLAYER2_SCORE.set2 + result.MATCHES[matchid].PLAYER2_SCORE.set3
                    if(req.query.TOURNAMENT_ID[0]=='T'){
                        pl1sum+=result.MATCHES[matchid].PLAYER1_SCORE.set4+result.MATCHES[matchid].PLAYER1_SCORE.set5
                        pl2sum+=result.MATCHES[matchid].PLAYER2_SCORE.set4+result.MATCHES[matchid].PLAYER2_SCORE.set5
                    }
                    if(pl1sum>pl2sum){
                        WINNER = result.MATCHES[matchid].PLAYER1
                        LOSER = result.MATCHES[matchid].PLAYER2
                    }
                    else{
                        WINNER=result.MATCHES[matchid].PLAYER2
                        LOSER = result.MATCHES[matchid].PLAYER1
                    }
                    console.log(set1+set2+set3)
                    console.log(set1)
                    console.log(set2)
                    console.log(set3)
                    console.log('733')
                    console.log(WINNER)
                }
                //trial
                const winner_name = await USER.findOne({
                    USERID:WINNER
                })
                if(winner_name){
                    matchesmodel.findOneAndUpdate({
                        TOURNAMENT_ID : req.query.TOURNAMENT_ID
                    },{ 
                        $set:{
                            "MATCHES.$[elem].winner_id":WINNER,
                            "MATCHES.$[elem].winner_name":winner_name.NAME,
                            "MATCHES.$[elem].completion_status":"Done"
                        }
                    },{
                        arrayFilters:[{"elem.MATCHID":result.MATCHES[matchid].MATCHID}]
                    },function(error,d){
                        if(error){
                            res.status(404).send({
                                Message:'Error in final processing'
                            })
                        }
                        else{
                            //update user
                            USER.findOneAndUpdate({
                                USERID:WINNER
                            },{
                                $push:{
                                    TROPHIES:req.query.TOURNAMENT_ID
                                }
                            },function(error,f){
                                if(error){
                                    res.status(404).send({
                                        Message:'Error in final processing'
                                    })                                        
                                }
                                else{
                                    USER.updateOne({
                                        USERID:WINNER
                                    },{
                                        POINTS:f.POINTS+10
                                    },function(error,result){
                                        if(error){
                                            res.status(404).send({
                                                Message:'Error in final processing'
                                            })      
                                        }
                                        else{
                                            USER.findOne({
                                                USERID:LOSER
                                            },function(erre,resse){
                                                if(resse){
                                                    USER.updateOne({
                                                        USERID:LOSER
                                                    },{
                                                        POINTS:resse.POINTS+5
                                                    },function(err3,ress3){
                                                        if(ress3){
                                                            res.status(200).send({
                                                                Message:'Successfully Updated Finals',
                                                                WINNER:WINNER
                                                            })
                                                        }
                                                        else if(err3){
                                                            console.log(err3)
                                                            res.status(200).send({
                                                                Message:'Error',
                                                                WINNER:'None'
                                                            })
                                                        }
                                                    })
                                                }
                                            })        
                                            
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            }
            else if(result.MATCHES[matchid].PLAYER2=="Not Booked"||result.MATCHES[matchid].PLAYER2=="Not Yet Assigned"){
                var WINNER = result.MATCHES[matchid].PLAYER1  
                const winner_name = await USER.findOne({
                    USERID:WINNER
                })
                if(winner_name){
                    USER.findOne({
                        USERID:WINNER
                    },function(error,response){
                        if(error){
                            throw error
                        }
                        if(response){
                            USER.updateOne({
                                USERID:WINNER
                            },{
                                POINTS:response.POINTS+10
                            },function(er,re){
                                if(er){
                                    throw er
                                }
                                if(re){
                                    if(result.MATCHES[matchid].NEXT_MATCH_PLAYER_SPOT==0){
                                        //write winner_id_logic
                                        matchesmodel.updateOne({
                                            TOURNAMENT_ID:req.query.TOURNAMENT_ID
                                        },{
                                            $set:{
                                                "MATCHES.$[elem].PLAYER1":WINNER,
                                                "MATCHES.$[elem2].winner_id":WINNER,
                                                "MATCHES.$[elem2].winner_name":winner_name.NAME,
                                                "MATCHES.$[elem2].completion_status":"Done"
                                            }
                                        },{
                                            arrayFilters:[{"elem.MATCHID":result.MATCHES[matchid].NEXT_MATCH_ID},{"elem2.MATCHID":result.MATCHES[matchid].MATCHID}]
                                        },function(error,result2){
                                            if(error){
                                                console.log(error)
                                            }
                                            if(result2){
                                                res.status(200).send({
                                                    Message:'Updated Successfully',
                                                    WINNER:WINNER
                                                })
                                            }
                                        })
                                    }
                                    else{
                                        matchesmodel.updateOne({
                                            TOURNAMENT_ID:req.query.TOURNAMENT_ID
                                        },{
                                            $set:{
                                                "MATCHES.$[elem].PLAYER2":WINNER,
                                                "MATCHES.$[elem2].winner_id":WINNER,
                                                "MATCHES.$[elem2].winner_name":winner_name.NAME,
                                                "MATCHES.$[elem2].completion_status":"Done"   
                                            }
                                        },{
                                            arrayFilters:[{"elem.MATCHID":result.MATCHES[matchid].NEXT_MATCH_ID},{"elem2.MATCHID":result.MATCHES[matchid].MATCHID}]
                                        },function(error,result3){
                                            if(error){
                                                console.log(error)
                                            }
                                            if(result3){
                                                res.status(200).send({
                                                    Message:'Updated Successfully',
                                                    WINNER:WINNER
                                                })
                                            }
                                        })
                                    }
                                }
                            })
                        }
                    })
                }  
            }
            else if(result.MATCHES[matchid].PLAYER1=="Not Booked"||result.MATCHES[matchid].PLAYER1=="Not Yet Assigned"){
                console.log('Else if Case')
                var WINNER = result.MATCHES[matchid].PLAYER2   
                const winner_name = await USER.findOne({
                    USERID:WINNER
                })
                if(winner_name){
                    USER.findOne({
                        USERID:WINNER
                    },function(error,response){
                        if(error){
                            throw error
                        }
                        if(response){
                            USER.updateOne({
                                USERID:WINNER
                            },{
                                POINTS:response.POINTS+10
                            },function(er,re){
                                if(er){
                                    throw er
                                }
                                if(re){
                                    if(result.MATCHES[matchid].NEXT_MATCH_PLAYER_SPOT==0){
                                        //write winner_id_logic
                                        matchesmodel.updateOne({
                                            TOURNAMENT_ID:req.query.TOURNAMENT_ID
                                        },{
                                            $set:{
                                                "MATCHES.$[elem].PLAYER1":WINNER,
                                                "MATCHES.$[elem2].winner_id":WINNER,
                                                "MATCHES.$[elem2].winner_name":winner_name.NAME,
                                                "MATCHES.$[elem2].completion_status":"Done"
                                            }
                                        },{
                                            arrayFilters:[{"elem.MATCHID":result.MATCHES[matchid].NEXT_MATCH_ID},{"elem2.MATCHID":result.MATCHES[matchid].MATCHID}]
                                        },function(error,result2){
                                            if(error){
                                                console.log(error)
                                            }
                                            if(result2){
                                                res.status(200).send({
                                                    Message:'Updated Successfully',
                                                    WINNER:WINNER
                                                })
                                            }
                                        })
                                    }
                                    else{
                                        matchesmodel.updateOne({
                                            TOURNAMENT_ID:req.query.TOURNAMENT_ID
                                        },{
                                            $set:{
                                                "MATCHES.$[elem].PLAYER2":WINNER,
                                                "MATCHES.$[elem2].winner_id":WINNER,
                                                "MATCHES.$[elem2].winner_name":winner_name.NAME,
                                                "MATCHES.$[elem2].completion_status":"Done"   
                                            }
                                        },{
                                            arrayFilters:[{"elem.MATCHID":result.MATCHES[matchid].NEXT_MATCH_ID},{"elem2.MATCHID":result.MATCHES[matchid].MATCHID}]
                                        },function(error,result3){
                                            if(error){
                                                console.log(error)
                                            }
                                            if(result3){
                                                res.status(200).send({
                                                    Message:'Updated Successfully',
                                                    WINNER:WINNER
                                                })
                                            }
                                        })
                                    }
                                }})}})
                }
            }
            else{
                console.log('Else Case')
                matchesmodel.findOne({
                    TOURNAMENT_ID:req.query.TOURNAMENT_ID
                },async function(error,result4){
                    if(error){
                        console.log(error)
                        res.status(404).send({
                            Message:'Unknown Error'
                        })
                    }
                    else{
                        console.log(result4)
                        var set1 = 0
                        var set2 = 0
                        var set3 = 0
                        var WINNER_ID = ""
                        var LOSER_ID = ""
                        if((result4.MATCHES[matchid].PLAYER1_SCORE.set1)>(result4.MATCHES[matchid].PLAYER2_SCORE.set1)){
                            set1 = 1
                        }
                        else{
                            set1 = 0
                        }
                        if((result4.MATCHES[matchid].PLAYER1_SCORE.set2)>(result4.MATCHES[matchid].PLAYER2_SCORE.set2)){
                            set2 = 1
                        }
                        else{
                            set2 = 0
                        }
                        if((result4.MATCHES[matchid].PLAYER1_SCORE.set3)>(result4.MATCHES[matchid].PLAYER2_SCORE.set3)){
                            set3 = 1
                        }
                        else{
                            set3 = 0
                        }
                        var pl1sum = result4.MATCHES[matchid].PLAYER1_SCORE.set1 + result4.MATCHES[matchid].PLAYER1_SCORE.set2 + result4.MATCHES[matchid].PLAYER1_SCORE.set3
                        var pl2sum = result4.MATCHES[matchid].PLAYER2_SCORE.set1 + result4.MATCHES[matchid].PLAYER2_SCORE.set2 + result4.MATCHES[matchid].PLAYER2_SCORE.set3
                        if(req.query.TOURNAMENT_ID[0]=='T'){
                            pl1sum+=result4.MATCHES[matchid].PLAYER1_SCORE.set4+result4.MATCHES[matchid].PLAYER1_SCORE.set5
                            pl2sum+=result4.MATCHES[matchid].PLAYER2_SCORE.set4+result4.MATCHES[matchid].PLAYER2_SCORE.set5
                        }
                        if(pl1sum>pl2sum){
                            WINNER_ID = result4.MATCHES[matchid].PLAYER1
                            LOSER_ID = result4.MATCHES[matchid].PLAYER2
                        }
                        else{
                            WINNER_ID= result4.MATCHES[matchid].PLAYER2
                            LOSER_ID = result4.MATCHES[matchid].PLAYER1
                        }
                        console.log(set1)
                        console.log(set2)
                        console.log(set3)
                        console.log(WINNER_ID)
                        console.log(LOSER_ID)
                        const winner_name = await USER.findOne({
                            USERID:WINNER_ID
                        })
                        if(winner_name){
                            USER.findOne({
                                USERID:WINNER_ID
                            },function(er,re){
                                if(er){
                                    throw er
                                }
                                if(re){
                                    console.log('Winner Updating')
                                    USER.updateOne({
                                        USERID:WINNER_ID
                                    },{
                                        POINTS:re.POINTS+10
                                    },function(err,rre){
                                        if(err){
                                            throw err
                                        }
                                        if(rre){
                                            console.log('Loser Updating')
                                            USER.findOne({
                                                USERID:LOSER_ID
                                            },function(er2,re2){
                                                if(er2){
                                                    throw er2
                                                }
                                                if(re2){
                                                    USER.updateOne({
                                                        USERID:LOSER_ID
                                                    },{
                                                        POINTS:re2.POINTS+5
                                                    },function(er3,re3){
                                                        if(er3){
                                                            throw er3
                                                        }
                                                        if(re3){
                                                            console.log('Updating Next Match Spot')
                                                            if(result4.MATCHES[matchid].NEXT_MATCH_PLAYER_SPOT==0){
                                                                //write winner_id_logic
                                                                matchesmodel.updateOne({
                                                                    TOURNAMENT_ID:req.query.TOURNAMENT_ID
                                                                },{
                                                                    $set:{
                                                                        "MATCHES.$[elem].PLAYER1":WINNER_ID,
                                                                        "MATCHES.$[elem2].winner_id":WINNER_ID,
                                                                        "MATCHES.$[elem2].winner_name":winner_name.NAME,
                                                                        "MATCHES.$[elem2].completion_status":"Done"
                                                                    }
                                                                },{
                                                                    arrayFilters:[{"elem.MATCHID":result4.MATCHES[matchid].NEXT_MATCH_ID},{"elem2.MATCHID":result4.MATCHES[matchid].MATCHID}]
                                                                },function(error,result2){
                                                                    if(error){
                                                                        console.log(error)
                                                                    }
                                                                    if(result2){
                                                                        res.status(200).send({
                                                                            Message:'Updated Successfully',
                                                                            WINNER:WINNER_ID
                                                                        })
                                                                    }
                                                                })
                                                            }
                                                            else{
                                                                matchesmodel.updateOne({
                                                                    TOURNAMENT_ID:req.query.TOURNAMENT_ID
                                                                },{
                                                                    $set:{
                                                                        "MATCHES.$[elem].PLAYER2":WINNER_ID,
                                                                        "MATCHES.$[elem2].winner_id":WINNER_ID,
                                                                        "MATCHES.$[elem2].winner_name":winner_name.NAME,
                                                                        "MATCHES.$[elem2].completion_status":"Done"   
                                                                    }
                                                                },{
                                                                    arrayFilters:[{"elem.MATCHID":result4.MATCHES[matchid].NEXT_MATCH_ID},{"elem2.MATCHID":result4.MATCHES[matchid].MATCHID}]
                                                                },function(error,result3){
                                                                    if(error){
                                                                        console.log(error)
                                                                    }
                                                                    if(result3){
                                                                        res.status(200).send({
                                                                            Message:'Updated Successfully',
                                                                            WINNER:WINNER_ID
                                                                        })
                                                                    }
                                                                })
                                                            }
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
            
                    }
                })                
            }
        }
    })
})
userRouter.get('/trophy',async (req,res)=>{
    console.log('Hello')
    //userid and Tournament ID to be passed
    res.render('final_winner',{WINNER_ID:req.query.USERID})
})
userRouter.get('/startscoring',async (req,res)=>{
    //TOURNAMENT_ID,
    //MATCHID: 0-indexed
    matchesmodel.findOne({
        TOURNAMENT_ID:req.query.TOURNAMENT_ID
    },async function(e,r){
        if(e){
            res.status(404).send({
                Message:'Wrong Credentials'
            })
        }
        else{
            res.status(200).send({
                Message:r.MATCHES[parseInt(req.query.MATCHID,10)]
            })
        }
    })
})
userRouter.get('/allMatches', async (req,res)=>{
    //tournament id
    const allUsers = await USER.find({
        WALLET_BALANCE:0  
    }).lean()
    if(allUsers){
        console.log(allUsers.length)
        tournamentModel.findOne({
            TOURNAMENT_ID:req.query.TOURNAMENT_ID
        },function(error,result2){
            if(error){
                console.log(error)
            }
            if(result2){
                if(result2.CATEGORY[result2.CATEGORY.length-1]=='S'){
                    matchesmodel.findOne({
                        TOURNAMENT_ID:req.query.TOURNAMENT_ID
                    },function(error,result){
                        if(error){
                            console.log(error)
                        }
                        else{
                            var mtches = []
                            var sport = ""
                            if(result.TOURNAMENT_ID[0]=='T'){
                                sport = "Table Tennis"
                            }
                            else{
                                sport = "Badminton"
                            }
                            for(var i=0;i<(result2.NO_OF_KNOCKOUT_ROUNDS)-1;i++){
                                if(result.MATCHES[i].completion_status=="Not Complete"&&!((result.MATCHES[i].PLAYER1=="Not Booked"||result.MATCHES[i].PLAYER1=="Not Yet Assigned")&&(result.MATCHES[i].PLAYER2=="Not Booked"||result.MATCHES[i].PLAYER2=="Not Yet Assigned"))){
                                    var us1 = ""
                                    var us2 = ""
                                    console.log(result.MATCHES[i].PLAYER1)
                                    console.log(result.MATCHES[i].PLAYER2)
                                        for(let j = 0;j<allUsers.length;j++){
                                            if(`${result.MATCHES[i].PLAYER1}`==`${allUsers[j].USERID}`){
                                                us1 = allUsers[j].NAME
                                                break
                                            }
                                        }
                                        for(let k = 0;k<allUsers.length;k++){
                                            if(`${result.MATCHES[i].PLAYER2}`==`${allUsers[k].USERID}`){
                                                us2 = allUsers[k].NAME
                                                break
                                            }
                                        }
                                        if(us1==""){
                                            us1="N/A"
                                        }
                                        if(us2==""){
                                            us2="N/A"
                                        }
                                    mtches.push({
                                        TOURNAMENT_ID:req.query.TOURNAMENT_ID,
                                        PLAYER1_NAME:us1,
                                        PLAYER1_PARTNER:"N/A",
                                        PLAYER2_NAME:us2,
                                        PLAYER2_PARTNER:"N/A",
                                        PLAYER1_ID:result.MATCHES[i].PLAYER1,
                                        PLAYER2_ID:result.MATCHES[i].PLAYER2,
                                        MATCHID:result.MATCHES[i].MATCHID,
                                        SPORT_NAME:sport,
                                        LOCATION:result2.LOCATION,
                                        CITY:result2.CITY,
                                        TOURNAMENT_NAME:result2.TOURNAMENT_NAME,
                                        IMG_URL:result2.IMG_URL,
                                        PRIZE_POOL:`${result2.PRIZE_POOL}`
                                    })
                                    console.log(mtches) 
                                }
                            }
                                res.status(200).send(mtches)
                        }
                    })
                }
                else{
                            matchesmodel.findOne({
                        TOURNAMENT_ID:req.query.TOURNAMENT_ID
                    },async function(error,result){
                        if(error){
                            console.log(error)
                        }
                        else{
                            var sport = ""
                            if(result.TOURNAMENT_ID[0]=='T'){
                                sport = "Table Tennis"
                            }
                            else{
                                sport = "Badminton"
                            }
                            var mtches = []
                            for(var i=0;i<(result2.NO_OF_KNOCKOUT_ROUNDS)-1;i++){
                                if(result.MATCHES[i].completion_status=="Not Complete"&&!((result.MATCHES[i].PLAYER1=="Not Booked"||result.MATCHES[i].PLAYER1=="Not Yet Assigned")&&(result.MATCHES[i].PLAYER2=="Not Booked"||result.MATCHES[i].PLAYER2=="Not Yet Assigned"))){
                                    var us1 = ""
                                    var us2 = ""
                                    var us3 = ""
                                    var us4 = ""
                                    var user_1 = result.MATCHES[i].PLAYER1
                                    var user_2 = result.MATCHES[i].PLAYER2 
                                    console.log(result.MATCHES[i].PLAYER1)
                                    console.log(result.MATCHES[i].PLAYER2)
                                    //find doubles partner
                                    var dbles_partner_1_id = ""
                                    var dbles_partner_2_id = ""
                                    var dat1 = await dbles.findOne({
                                        TOURNAMENT_ID:req.query.TOURNAMENT_ID,
                                        PLAYER_1:user_1
                                    })
                                    var dat2 = await dbles.findOne({
                                        TOURNAMENT_ID:req.query.TOURNAMENT_ID,
                                        PLAYER_1:user_2
                                    }) 
                                    if(dat1){
                                        dbles_partner_1_id = dat1.PLAYER_2
                                    }
                                    else{
                                        dbles_partner_1_id = "N/A"
                                    }
                                    if(dat2){
                                        dbles_partner_2_id = "N/A"
                                    }
                                    for(let j = 0;j<allUsers.length;j++){
                                        if(`${user_1}`==`${allUsers[j].USERID}`){
                                            us1 = allUsers[j].NAME
                                            break
                                        }
                                    }
                                    for(let k = 0;k<allUsers.length;k++){
                                        if(`${user_2}`==`${allUsers[k].USERID}`){
                                            us2 = allUsers[k].NAME
                                            break
                                        }
                                    }
                                    for(let k = 0;k<allUsers.length;k++){
                                        if(`${dbles_partner_1_id}`==`${allUsers[k].USERID}`){
                                            us3 = allUsers[k].NAME
                                            break
                                        }
                                    }
                                    for(let k = 0;k<allUsers.length;k++){
                                        if(`${dbles_partner_2_id}`==`${allUsers[k].USERID}`){
                                            us4 = allUsers[k].NAME
                                            break
                                        }
                                    }
                                    if(us1==""){
                                        us1="N/A"
                                    }
                                    if(us2==""){
                                        us2="N/A"
                                    }
                                    if(us3==""){
                                        us3="N/A"
                                    }
                                    if(us4==""){
                                        us4="N/A"
                                    }
                                    mtches.push({
                                        TOURNAMENT_ID:req.query.TOURNAMENT_ID,
                                        PLAYER1_NAME:us1,
                                        PLAYER1_PARTNER:us3,
                                        PLAYER2_NAME:us2,
                                        PLAYER2_PARTNER:us4,
                                        PLAYER1_ID:result.MATCHES[i].PLAYER1,
                                        PLAYER2_ID:result.MATCHES[i].PLAYER2,
                                        MATCHID:result.MATCHES[i].MATCHID,
                                        SPORT_NAME:sport,
                                        LOCATION:result2.LOCATION,
                                        CITY:result2.CITY,
                                        TOURNAMENT_NAME:result2.TOURNAMENT_NAME,
                                        IMG_URL:result2.IMG_URL,
                                        PRIZE_POOL:`${result2.PRIZE_POOL}`
                                    })
                                }
                            }
                            res.status(200).send(mtches)
                        }
                    })   
                }
            }
        })
    }
})
userRouter.get('/allMatchesSpots',async (req,res)=>{
    //req.query.TOURNAMENT_ID
    matchesmodel.findOne({
        TOURNAMENT_ID:req.query.TOURNAMENT_ID
    },function(error,result){
        if(error){
            res.status(404).send({
                Message:'Unknown Error'
            })
        }
        else{
            console.log(result)
            res.status(200).send({
                Matches:result.MATCHES
            })
        }
    })
})
userRouter.get('/pastTournaments',async (req,res)=>{
    try{
        const istConstant = 5*60*60*1000+30*60*1000
        const userid = req.query.USERID
        const usrresult = await USER.findOne({
            USERID:userid
        }).lean()
        const r1 = await tournamentModel.find().lean()
        if(usrresult&&r1){
            if(r1){
                var r2 = []
                console.log(typeof(r1))
                for(let i=0;r1[i];i++){
                    console.log(i)
                    console.log(r1[i].TOURNAMENT_ID)
                    const curDate = new Date(new Date().getTime() + istConstant)
                    const end_date = new Date(r1[i].END_TIMESTAMP)
                    console.log(usrresult.HOSTED_TOURNAMENTS)
                    console.log(curDate.getTime())
                    console.log(end_date.getTime())
                    console.log(curDate.getTime()>end_date.getTime())
                    if(curDate.getTime()>end_date.getTime()&&usrresult.HOSTED_TOURNAMENTS.includes(r1[i].TOURNAMENT_ID)){
                        console.log(r1[i])
                        r2.push(r1[i])
                    }
                }
                res.status(200).send(r2)
            }

        }
    }catch(error){
        console.log(error)
        res.status(404).send({
            Message:'Unknown Error'
        })
    }
})
userRouter.get('/spotStatusArray',async (req,res)=>{
    //TOURNAMENT_ID reqd
    tournamentModel.findOne({
        TOURNAMENT_ID:req.query.TOURNAMENT_ID
    },function(error,result){
        if(error){
            console.log(error);
            res.status(404).send({
                Message:'Unknown Error'
            })
        }
        else{
            res.status(200).send({
                array:result.SPOT_STATUS_ARRAY
            })
        }
    })
})
userRouter.get('/profileDetails',async (req,res)=>{
    //req.query.USERID
    USER.findOne({
        USERID:req.query.USERID
    },function(error,result){
        if(error){
            console.log(error)
            res.status(404).send({
                Message:'Error'
            })
        }
        else{
            res.render('spotDetail',{USERID:req.query.USERID,USERNAME:result.NAME,CITY:result.CITY,TOURNAMENT_ID:req.query.TOURNAMENT_ID,ORIGINAL:req.query.ORIGINAL})
        }
    })
})
userRouter.get('/profileDetailsTourna',async (req,res)=>{
    //req.query.USERID
    USER.findOne({
        USERID:req.query.USERID
    },function(error,result){
        if(error){
            console.log(error)
            res.status(404).send({
                Message:'Error'
            })
        }
        else{
            res.render('spotDetailTourna',{USERID:req.query.USERID,USERNAME:result.NAME,CITY:result.CITY,TOURNAMENT_ID:req.query.TOURNAMENT_ID})
        }
    })
})
userRouter.get('/ticket',async (req,res)=>{
    //reqs tournamentID and USERID
    tournamentModel.findOne({
        TOURNAMENT_ID:req.query.TOURNAMENT_ID
    },function(error,result){
        if(error,result){
            if(error){
                res.status(404).send({
                    Message:'Error'
                })
            }
            else{
                var spotbooked = result.SPOT_STATUS_ARRAY.indexOf(`confirmed-${req.query.USERID}`)+1
                USER.findOne({
                    USERID:req.query.USERID
                },function(error,result2){
                    if(error){
                        console.log(error)
                    }
                    if(result2){
                        res.status(200).send({
                            TNAME:result.TOURNAMENT_NAME,
                            SPOT:spotbooked,
                            USRNAME:result2.NAME,
                            SPORT:result.SPORT,
                            CATEGORY:result.CATEGORY,
                            DATE:result.START_DATE,
                            LOCATION:result.CITY
                        })
                    }
                })
            }
        }
    })
})
userRouter.get('/baseTournaments',async(req,res)=>{
    try{
        const istConstant = 5*60*60*1000+30*60*1000
        const r1 = await onlytournamentModel.find().lean()
        const result1 = await tournamentModel.find().lean()
        if(r1&&result1){
            if(r1){
                var r2 = []
                console.log(typeof(r1))
                for(let i=0;r1[i];i++){
                    //console.log(i)
                    //console.log(r1[i].TOURNAMENT_ID)
                    const curDate = new Date(new Date().getTime() + istConstant)
                    const end_date = new Date(r1[i].END_TIMESTAMP)
                    const start_time = new Date(r1[i].START_TIMESTAMP)
                    const temp_start_time = new Date(start_time.getTime() - r1[i].REGISTRATION_CLOSES_BEFORE*60*60*1000)
                    r1[i].START_TIME = moment(start_time).format('LT')
                    r1[i].END_TIME = moment(end_date).format('LT') 
                    //console.log(curDate.getTime())
                    //console.log(end_date.getTime())
                    //console.log(curDate.getTime()>end_date.getTime())
                    if(curDate.getTime()<temp_start_time.getTime()&&r1[i].REGISTRATION_CLOSES_BEFORE>0){
                        //console.log(r1[i])
                        console.log(moment(end_date).format('LT'))
                        var spotStatusArrays = []
                        for(var j = 0;j<result1.length;j++){
                            if(result1[j].TOURNAMENT_ID.includes(r1[i].TOURNAMENT_ID)){

                                //PARTH REMOVE THIS LATER WHEN IMAGE UPLOADED TO S3
                                if(result1[j].SPORT == "Cricket"){
                                    r1[i].IMG_URL = "https://img.freepik.com/premium-vector/cricket-player-logo-design-vector-icon-symbol-template-illustration_647432-117.jpg?w=740"
                                }
                                var cat = ""
                                var cat_name = ""
                                var type = ""
                                console.log(result1[j].AGE_CATEGORY)
                                if(result1[j].CATEGORY=='MS'){
                                    cat=`${result1[j].AGE_CATEGORY} Men's Singles`
                                    cat_name = "Men's Singles"
                                    type="SINGLES"
                                }
                                else if(result1[j].CATEGORY=='WS'){
                                    cat=`${result1[j].AGE_CATEGORY} Women's Singles`
                                    cat_name = "Women's Singles"
                                    type="SINGLES"
                                }
                                else if(result1[j].CATEGORY=='MD'){
                                    cat=`${result1[j].AGE_CATEGORY} Men's Doubles`
                                    cat_name = "Men's Doubles"
                                    type="DOUBLES"
                                }
                                else if(result1[j].CATEGORY=='WD'){
                                    cat=`${result1[j].AGE_CATEGORY} Women's Doubles`
                                    cat_name = "Women's Doubles"
                                    type="DOUBLES"
                                }
                                else if(result1[j].CATEGORY=='MixD'){
                                    cat=`${result1[j].AGE_CATEGORY} Mixed Doubles`
                                    cat_name = "Mixed Doubles"
                                    type="DOUBLES"
                                }
                                else if(result1[j].CATEGORY=='BD'){
                                    cat=`${result1[j].AGE_CATEGORY} Boys Doubles`
                                    cat_name = "Boys Doubles"
                                    type="DOUBLES"
                                }
                                else if(result1[j].CATEGORY=='BS'){
                                    cat=`${result1[j].AGE_CATEGORY} Boys Singles`
                                    cat_name = "Boys Singles"
                                    type="SINGLES"
                                }
                                else if(result1[j].CATEGORY=='GS'){
                                    cat=`${result1[j].AGE_CATEGORY} Girls Singles`
                                    cat_name = "Girls Singles"
                                    type="SINGLES"
                                }
                                else if(result1[j].CATEGORY=='GD'){
                                    cat=`${result1[j].AGE_CATEGORY} Girls Doubles`
                                    cat_name = "Girls Doubles"
                                    type="DOUBLES"
                                } else if(result1[j].CATEGORY=='CR'){
                                    cat=`${result1[j].AGE_CATEGORY} Cricket`
                                    cat_name = "Cricket"
                                    type="Eleven"
                                }
                                console.log(result1[j].TOURNAMENT_NAME)
                                console.log(result1[j].SPOT_STATUS_ARRAY)
                                spotStatusArrays.push({
                                    category:cat,
                                    category_name:cat_name,
                                    id: result1[j].TOURNAMENT_ID,
                                    array: result1[j].SPOT_STATUS_ARRAY,
                                    STATUS:r1[i].STATUS,
                                    SPORT:r1[i].SPORT,
                                    CATEGORY_TYPE:type
                                })
                            }
                        }
                        r1[i].spotStatusArrays = spotStatusArrays;
                        console.log(r2);
                        r2.push(r1[i])
                    }
                }
                res.status(200).send(r2)
                console.log("RETURN" + r2)
            }
        }
    }catch(error){
        console.log(error)
        res.status(404).send({
            Message:'Unknown Error'
        })
    }
})
userRouter.get('/tournamentdetails',async(req,res)=>{
    //tournament_id_required
    //from here we will get per tournament details
    const tid = req.query.TOURNAMENT_ID
    res.render('viewTournaDetails',{tid:tid})
})

userRouter.post('/postProfilePic',uploadoptions.single('image'),async (req,res)=>{
    try{
        console.log(req.file)
    console.log(req.body)
        const result = await uploadFile(req.file)
        if(result){
            console.log(result)
            fs.unlink(`./imgfolder/${req.file.filename}`,function(err){
                if(err){
                    throw err
                }
                else{
                    USER.updateOne({
                        USERID: req.body.USERID
                    },{
                        PROFILE_PIC_URL:`http://52.66.209.218:3000/getImage?key=${result.key}`
                    },function(err,result2){
                        if(err){
                            throw err
                        }
                        else{
                            res.status(200).send({
                                Message:`http://52.66.209.218:3000/getImage?key=${result.key}`
                            })
                        }
                    })
                }
            })
        }
    }catch(error){
        console.log(error)
        res.status(404).send({
            Message:error.Message
        })
    }
})

userRouter.post('/extendBookingTime',async (req,res)=>{
    const tid = req.body.TOURNAMENT_ID 
    const hrs = req.body.HRS 
    tournamentModel.findOne({
        TOURNAMENT_ID:tid
    },function(err,rr){
        if(err){
            res.status(404).send({
                Message:'Error in increasing time'
            })
        }
        else{
            const start_time = new Date(new Date(rr.START_TIMESTAMP).getTime()+hrs*60*60*1000).toISOString()
            tournamentModel.updateOne({
                TOURNAMENT_ID:tid
            },{
                START_TIMESTAMP:start_time
            },function(e,r){
                if(e){
                    res.status(404).send({
                        Message:'Error in increasing time'
                    })
                }
                else{
                    res.status(200).send({
                        Message:'Time increased'
                    })
                }
            })
        }
    })
})
userRouter.get('/clearSpots',async (req,res)=>{
    //TOURNAMENT_ID
    //0-indexed SPOT NUMBER
    tournamentModel.updateOne({
        TOURNAMENT_ID:req.body.TOURNAMENT_ID
    },{
        
    })
})
userRouter.get('/getImage',async(req,res)=>{
    const key = req.query.key
    const stream = getfile(key)
    stream.pipe(res)
})
userRouter.get('/paymentPage',async(req,res)=>{
    //requires username, Tournament Details, Price
    res.render('payment',{username:req.query.username,tournament_name:req.query.tournament_name,tournament_id:req.query.tournament_id,price:req.query.price})
})
userRouter.post('/rzp_payment',async (req,res)=>{
    // rzp_instance.payments.fetch(req.query.payment_id).then((d)=>{
    //     console.log(d)
    //     res.status(200).send({
    //         Message:'Received Response'
    //     })
    // }).catch((error)=>{
    //     console.log(error)
    // })
    console.log(req.body.amount)
    var options = {
        amount: req.body.amount + '00',  // amount in the smallest currency unit
        currency: "INR",
      };
    rzp_instance.orders.create(options,function(error,order){
        if(error){
            res.status(404).send({
                Message:'Error in order creation'
            })
        }
        else{

            console.log(order.id)
            res.status(200).send({
                orderID:order.id,
                status:1
            })
        }
    })
})

userRouter.post('/updateUserPayment',async (req,res)=>{
    //userid
    //tournament_id
    //price_paid
    //payment_id
    rzp_instance.payments.fetch(req.body.payment_id).then((d)=>{
        console.log(d)
        if(d.status=='captured'){
            const pmt = new paymentsmodel({
                USERID:req.body.userid,
                TOURNAMENT_ID:req.body.tournament_id,
                AMOUNNT:req.body.price_paid,
                PAYMENT_ID:req.body.payment_id,
                STATUS:true
            })
            pmt.save().then((d)=>{
                res.status(200).send({
                    Message:'paid'
                })
            }).catch((e)=>{
                console.log(e)
                res.status(200).send({
                    Message:'failure'
                })
            })
        }
    }).catch((error)=>{
        console.log(error)
        res.status(200).send({
            Message:'failure'
        })
    })
})
userRouter.get('/getrules',async (req,res)=>{
    const tid = req.query.TOURNAMENT_ID
    try{
        const rules = await ruleschema.findOne({
            TOURNAMENT_ID:tid
        })
        if(rules){
            res.status(200).send({
                Message:rules.RULES
            })
        }
        else{
            res.status(200).send({
                Message:'Tournament Doesnt Exist'
            })
        }
    }catch(err){
        res.status(404).send({
            Message:'Error'
        })
    }
})
userRouter.post('/rules',async (req,res)=>{
    const tid = req.body.TOURNAMENT_ID 
    const rules = req.body.RULES
    console.log(tid)
    console.log(rules)
    ruleschema.updateOne({
        TOURNAMENT_ID:tid
    },{
        RULES:rules
    },function(errr,resss){
        if(errr){
            res.status(404).send({
                Message:'Error'
            })
        }
        else if(resss){
            res.status(200).send({
                Message:'Success'
            })
        }
    })
})
userRouter.get('/matchTimings',async (req,res)=>{
    //get matchtimings array
    const dat = await matchtiming.find({
        TOURNAMENT_ID:req.query.TOURNAMENT_ID
    }).lean()
    if(dat){
        res.status(200).send({
            array:dat
        })
    }
    else{
        res.status(404).send({
            message:'None'
        })
    }
})
userRouter.post('/updateMatchTimings',async (req,res)=>{
    //TOURNAMENT_ID
    //MATCHID
    //START_TIMESTAMP
    //END_TIMESTAMP
    const dat = await matchtiming.findOne({
        TOURNAMENT_ID:req.body.TOURNAMENT_ID,
        MATCHID:req.body.MATCHID
    })
    if(dat){
        console.log('dat')
        matchtiming.updateOne({
            TOURNAMENT_ID:req.body.TOURNAMENT_ID,
        MATCHID:req.body.MATCHID
        },{
            START_TIMESTAMP:req.body.START_TIMESTAMP,
            END_TIMESTAMP:req.body.END_TIMESTAMP
        },function(e,r){
            if(e){
                res.status(404).send({
                    Message:'Error'
                })
            }
            else{
                res.status(200).send({
                    Message:'Updated'
                })
            }
        })
    }
    else{
        console.log('tbu')
        const tbu = new matchtiming({
            TOURNAMENT_ID:req.body.TOURNAMENT_ID,
            MATCHID:req.body.MATCHID,
            START_TIMESTAMP:req.body.START_TIMESTAMP,
            END_TIMESTAMP:req.body.END_TIMESTAMP
        })
        const r2 = await tbu.save()
        if(r2){
            console.log('r2')
            res.status(200).send({
                Message:'Updated'
            })
        }
        else{
            res.status(404).send({
                Message:'Error'
            })
        }
    }
})
userRouter.get('/success',async (req,res)=>{
    res.send('Success')
})
userRouter.get('/failure',async (req,res)=>{
    res.send('Failure')
})

//updating doubles partner
//remove spots
//showing doubles partner in fixtures and in match_live_view
userRouter.post('/removeBooking',async (req,res)=>{
    console.log(req.body)
    //if singles and doubles
    // if(req.body.TOURNAMENT_ID.split("-")[1].includes('D')){
    //     console.log('In Doubles removal')
    //     //remove from player and partner
    //     tournamentModel.findOne({
    //         TOURNAMENT_ID:req.body.TOURNAMENT_ID
    //     },async function(e,r){
    //         if(e){
    //             res.status(404).send({
    //                 Message:'Error'
    //             })
    //         }
    //         else{
    //             console.log('Else')
    //             const usr = r.SPOT_STATUS_ARRAY[req.body.SPOTID] 
    //             const actual_usr = usr.split("-")[1]
    //             USER.updateOne({
    //                 USERID:actual_usr
    //             },{
    //                 $pull:{
    //                     CURRENT_TOURNAMENTS:req.body.TOURNAMENT_ID
    //                 }
    //             },async function(e2,r2){
    //                 if(e2){
    //                     res.status(404).send({
    //                         Message:'Error'
    //                     })
    //                 }
    //                 else{
    //                     //Now remove from spot status array
    //                     //now fetch the doubles ID and remove it from there

    //                     const usr2 = await dbles.findOne({
    //                         TOURNAMENT_ID:req.body.TOURNAMENT_ID,
    //                         PLAYER_1:actual_usr
    //                     })
    //                     if(usr2){
    //                         if(usr2.PLAYER_2!='N.A'||usr2.PLAYER_2!='na'||usr2.PLAYER_2!='N/A'||usr2.PLAYER_2!='NA'){
    //                             const removal_res = await USER.updateOne({
    //                                 USERID:usr2.PLAYER_2
    //                             },{
    //                                 $pull:{
    //                                     CURRENT_TOURNAMENTS:req.body.TOURNAMENT_ID
    //                                 }
    //                             })
    //                             if(removal_res){
    //                                 tournamentModel.updateOne({
    //                                     TOURNAMENT_ID:req.body.TOURNAMENT_ID,
    //                                     SPOT_STATUS_ARRAY:usr
    //                                 },{
    //                                     $set:{
    //                                         "SPOT_STATUS_ARRAY.$":`${req.body.SPOTID}`
    //                                     }
    //                                 },function(e3,r3){
    //                                     if(e3){
    //                                         res.status(404).send({
    //                                             Message:'Error'
    //                                         })
    //                                     }
    //                                     else{
    //                                         res.status(200).send({
    //                                             Message:'Error removed'
    //                                         })
    //                                     }
    //                                 })
    //                             }
    //                         }
    //                         else{
    //                             tournamentModel.updateOne({
    //                                 TOURNAMENT_ID:req.body.TOURNAMENT_ID,
    //                                 SPOT_STATUS_ARRAY:usr
    //                             },{
    //                                 $set:{
    //                                     "SPOT_STATUS_ARRAY.$":`${req.body.SPOTID}`
    //                                 }
    //                             },function(e3,r3){
    //                                 if(e3){
    //                                     res.status(404).send({
    //                                         Message:'Error'
    //                                     })
    //                                 }
    //                                 else{
    //                                     res.status(200).send({
    //                                         Message:'Error removed'
    //                                     })
    //                                 }
    //                             })
    //                         }
    //                     }
    //                     console.log('else2')
    //                 }
    //             })
    //         }
    //     })
    // }

        //remove from player
        //first vacate spotStatus Array
        console.log('Remove Booking')
        tournamentModel.findOne({
            TOURNAMENT_ID:req.body.TOURNAMENT_ID
        },async function(e,r){
            if(e){
                res.status(404).send({
                    Message:'Error'
                })
            }
            else{
                console.log('Else')
                const usr = r.SPOT_STATUS_ARRAY[req.body.SPOTID] 
                const actual_usr = usr.split("-")[1]
                USER.updateOne({
                    USERID:actual_usr
                },{
                    $pull:{
                        CURRENT_TOURNAMENTS:req.body.TOURNAMENT_ID
                    }
                },async function(e2,r2){
                    if(e2){
                        res.status(404).send({
                            Message:'Error'
                        })
                    }
                    else{
                        //Now remove from spot status array
                        console.log('else2')
                        tournamentModel.updateOne({
                            TOURNAMENT_ID:req.body.TOURNAMENT_ID,
                            SPOT_STATUS_ARRAY:usr
                        },{
                            $set:{
                                "SPOT_STATUS_ARRAY.$":`${req.body.SPOTID}`
                            }
                        },function(e3,r3){
                            if(e3){
                                res.status(404).send({
                                    Message:'Error'
                                })
                            }
                            else{
                                res.status(200).send({
                                    Message:'Error removed'
                                })
                            }
                        })
                    }
                })
            }
        })        
    
})
userRouter.get('/finddoublespartner',async (req,res)=>{
    dbles.findOne({
        TOURNAMENT_ID:req.query.TOURNAMENT_ID,
        PLAYER_1:req.query.USERID
    },function(e,r){
        if(r){
            res.status(200).send(r)
        }
        else{
            dbles.findOne({
                TOURNAMENT_ID:req.query.TOURNAMENT_ID,
                PLAYER_2:req.query.USERID
            },function(e2,r2){
                if(e2){
                    res.status(404).send({
                        Message:'error'
                    })
                }
                else{
                    res.status(200).send(r2)
                }
            })

        }
    })
})
userRouter.get('/addSinglesPlayerToSpot',async (req,res)=>{
    //tournament_id
    //spot_number
    console.log(req.query)
    tournamentModel.updateOne({
        TOURNAMENT_ID:req.query.TOURNAMENT_ID,
        SPOT_STATUS_ARRAY:req.query.SPOT_NUMBER
    },{
        $set:{
            "SPOT_STATUS_ARRAY.$":`confirmed-${req.query.USERID}`
        }
    },function(e,r){
        if(e){
            res.status(404).send({
                Message:'Error'
            })
        }
        else{
            USER.updateOne({
                USERID:req.query.USERID
            },{
                $push:{
                    CURRENT_TOURNAMENTS:req.query.TOURNAMENT_ID   
                }
            },async function(e2,r2){
                if(e2){
                    res.status(404).send({
                        Message:'Error'
                    })
                }
                else{
                    res.status(200).send({
                        Message:'Updated'
                    })
                }
            })
        }
    })
})
userRouter.get('/getLivFixtures',async (req,res)=>{
    //TOURNAMENT_ID required
    tournamentModel.findOne({
        TOURNAMENT_ID:req.query.TOURNAMENT_ID
    },function(error,result){
        if(error){
            console.log(error)
            res.status(404).send({
                Message:'Error'
            })
        }
        if(result){
            console.log(result)
            matchesmodel.findOne({
                TOURNAMENT_ID:result.TOURNAMENT_ID
            },function(error,d){
                if(error){
                    res.status(404).send({
                        Message:'Error'
                    })      
                }
                else{
                    if(d.MATCHES.length==0){
                        res.render('live_maintainer',{TOURNEY_ID:req.query.TOURNAMENT_ID,no_of_bracs:result.NO_OF_KNOCKOUT_ROUNDS})
                    }
                    else{
                        res.render('live_maintainer',{TOURNEY_ID:req.query.TOURNAMENT_ID,no_of_bracs:result.NO_OF_KNOCKOUT_ROUNDS})
                    }
                }
            })
        }
    })
})
userRouter.post('/addDoublesPartnerOnSpot',async (req,res)=>{
    const usr_to_be_found = await USER.findOne({
        USERID:req.body.PLAYER_2
    })
    const doc = await dbles.findOne({
        TOURNAMENT_ID:req.body.TOURNAMENT_ID,
        PLAYER_1:req.body.PLAYER_1
    })
    if(doc){
        dbles.updateOne({
            TOURNAMENT_ID:req.body.TOURNAMENT_ID,
            PLAYER_1:req.body.PLAYER_1
        },{
            PLAYER_2:req.body.PLAYER_2
        },function(e,r){
            if(e){
                res.status(200).send({
                    Message:'Error'
                })
            }
            else{
                USER.updateOne({
                    USERID:req.body.PLAYER_2
                },{
                    $push:{
                        CURRENT_TOURNAMENTS:req.body.TOURNAMENT_ID   
                    }
                },function(e2,r2){
                    res.status(200).send({
                        Message:'Added a player'
                    })
                })
            }
        })
    }
    else{
        if(usr_to_be_found){
            const newplayer = new dbles({
                TOURNAMENT_ID:req.body.TOURNAMENT_ID,
                SPOT_NUMBER:req.body.SPOT_NUMBER,
                PLAYER_1:req.body.PLAYER_1,
                PLAYER_2:req.body.PLAYER_2
            })
            const r = await newplayer.save()
            if(r){
                USER.updateOne({
                    USERID:req.body.PLAYER_2
                },{
                    $push:{
                        CURRENT_TOURNAMENTS:req.body.TOURNAMENT_ID   
                    }
                },function(e2,r2){
                    res.status(200).send({
                        Message:'Added a player'
                    })
                })
            }
        }
        else{
            const newplayer = new dbles({
                TOURNAMENT_ID:req.body.TOURNAMENT_ID,
                SPOT_NUMBER:req.body.SPOT_NUMBER,
                PLAYER_1:req.body.PLAYER_1,
                PLAYER_2:"NA"
            })
            const r = await newplayer.save()
            if(r){
                res.status(200).send({
                    Message:"Player added"
                })
            }
            // res.status(404).send({
            //     Message:"Player not found"
            // })
        }
    }
})
userRouter.post('/updateNoOfCourts',async (req,res)=>{
    //get tournament id
    //get no_of_courts
    console.log('Hello')
    console.log(req.body)
    tournamentModel.updateOne({
        TOURNAMENT_ID:req.body.TOURNAMENT_ID
    },{
        NO_OF_COURTS:req.body.NO_OF_COURTS  
    }
,function(e,r){
    if(e){
        console.log(e)
        res.status(404).send({
            Message:'Unable to update'
        })
    }
    else{
        console.log('Hi')
        res.status(200).send({
            Message:'Updated'
        })
    }
})
})
userRouter.post('/changeStartEndTimings',async (req,res)=>{
    //tournament_id
    //start_date
    //start_time
    console.log('request')
    tournamentModel.updateOne({
        TOURNAMENT_ID:req.body.TOURNAMENT_ID 
    },{
        START_TIMESTAMP:req.body.START_TIMESTAMP
    },async function(e,r){
        if(e){
            res.status(404).send({
                Message:'Error'
            })
        }
        else{
            res.status(200).send({
                Message:'updated'
            })
        }
    })
})

userRouter.post('/resetpwdOtpgen',async (req,res)=>{
    try{
        const user = await USER.findOne({
            USERID:req.body.USERID
        })
        if(user){
            //update password reset
            const otp = Math.floor(100000 + Math.random() * 900000)
            const p_gen = await pwd_reset.find({
                USERID:req.body.USERID
            })
            let r;
            if(p_gen){
                r = await pwd_reset.updateOne({
                    USERID:req.body.USERID
                },{
                    OTP:`${otp}`
                })
            }
            else{
                const p_reset = new pwd_reset({
                    USERID:req.body.USERID,
                    OTP:`${otp}`,
                    TIMESTAMP:`${new Date().toISOString()}`
                })
                r = await p_reset.save()
            }
            if(r){
                let transporter = nodemailer.createTransport({
                    service: 'gmail',
                    port: 465,
                    secure: true,
                    auth: {
                        user: 'ardentsport1@gmail.com',
                        pass: 'lzklutweytlbdhqx'
                    }
                });
                
                // setup email data with unicode symbols
                let mailOptions = {
                    from: 'ardentsport1@gmail.com', // sender address
                    to: req.body.USERID, // list of user
                    subject: 'Password Reset', // Subject line
                    text:`Here is your One Time Password`, // plain text body
                    html: `<b>${otp} - please do not share with anyone</b>` // html body
                };
                
                // send mail with defined transport object
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Message sent: %s', info.messageId);
                    res.status(200).send({
                        Message:'Success'
                    })
                });
            }
        }
    }catch(e){
        console.log(e)
        res.status(500).send({
            Message:'Error'
        })
    }
})
userRouter.post('/otpVerify',async (req,res)=>{
    try{
        const p_reset = await pwd_reset.findOne({
            USERID:req.body.USERID
        })
        if(p_reset){
            console.log(p_reset)
            if(p_reset.OTP==req.body.OTP){
                res.status(200).send({
                    Message:'Success'
                })
            }
            else{
                res.status(200).send({
                    Message:'Failure'
                })
            }
        }else{
            res.status(200).send({
                Message:'Invalid Credentials'
            })
        }
    }catch(e){
        res.status(500).send({
            Message:'Error'
        })
    }
})
userRouter.post('/updatePwd',async (req,res)=>{
    try{
        const u = await USER.updateOne({
            USERID:req.body.USERID
        },{
           PWD:req.body.NEWPWD 
        })
        if(u){
            res.status(200).send({
                Message:'Success'
            })
        }
        else{
            res.status(200).send({
                Message:'Failure'
            })
        }
    }catch(e){
        res.status(500).send({
            Message:'Error'
        })
    }
})
module.exports = userRouter;