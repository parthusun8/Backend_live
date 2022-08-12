const express = require('express')
const mongoose = require('mongoose')
const USER = require('../models/user.mongo')
const USERProfile = require('../models/userprofile.model')
const stripe = require('stripe')("sk_test_51Kx9oUSDyPLJYmvrHGifQoOVMJTLzveCWgOMKSdYGUKOhgqEW5pDoA9XTbs5NDki9XW4mmU4wNna8uFdpoM0BanG00uedfdbjt")
const instacricket = require('../models/instacricket.mongo')
const tournamentModel = require('../models/tournament.model')
const matchesmodel = require('../models/matches.mongo')
const userRouter = express.Router()

userRouter.get('/',(req,res)=>{
    res.render('fixture',{no_of_bracs:req.query.no_of_spots})
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
            res.render('tourna_fixture',{TOURNEY_ID:req.query.TOURNAMENT_ID,no_of_bracs:result.NO_OF_KNOCKOUT_ROUNDS})
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

userRouter.get('/allTournaments',async (req,res)=>{
    tournamentModel.find(function(error,result){
        if(error){
            res.status(404).send({
                Message:'Error'
            })
        }
        if(result){

            // console.log("In result")
            // var r1 = Array.from(result)
            // for(let i=0;i<r1.length;i++){
            //     console.log(i)
            //     console.log(r1[i])
            // }
            // console.log(typeof(r1))
            res.status(200).send(result)
        }
    })
})

// get tournaments by USERID
//get tournament by ID
userRouter.post('/tournamentById',async (req,res)=>{
    tournamentModel.findOne({
        TOURNAMENT_ID:req.body.TOURNAMENT_ID
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
userRouter.get('/getConfirmationDetails',async (req,res)=>{
    //queryParams will have USERID and TOURNAMENT_ID
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
                    const category = "Men's Singles"
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
})
userRouter.get('/hostedTournaments',async (req,res)=>{
    const userid = req.query.USERID
    try{
        const result = await USER.findOne({
            USERID:userid
        })
        if(result){
            if(result.HOSTED_TOURNAMENTS.length==0){
                res.status(200).send([])
            }
            else{
                var r1 = []
                for(let i =0; i< result.HOSTED_TOURNAMENTS.length;i++){
                    try{
                        const tournament = await tournamentModel.findOne({
                            TOURNAMENT_ID:result.HOSTED_TOURNAMENTS[i]
                        })
                        r1.push(tournament)
                    }catch(error){
                        console.log(error)
                    }
                }
                if(r1.length!=0){
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
                const d2 = new Date(new Date().getTime() + istConstant).getTime()
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
            res.render('match_view',result.MATCHES[parseInt(req.query.MATCHID.split(" ")[1])-1])
        }
    })
})
userRouter.get('/endMatch',async (req,res)=>{
    //TOURNAMENT_ID and MATCHID,WINNER_ID
    const matchid = parseInt(req.query.MATCHID.split(" ")[1])-1
    matchesmodel.findOne({
        TOURNAMENT_ID:req.query.TOURNAMENT_ID
    },function(error,result){
        if(error){
            res.status(404).send({
                Message:'Error in tourna fetching'
            })
        }
        else{
            if(result.MATCHES[matchid].NEXT_MATCH_PLAYER_SPOT==0){
                matchesmodel.updateOne({
                    TOURNAMENT_ID:req.query.TOURNAMENT_ID
                },{
                    $set:{
                        "MATCHES.$[elem].PLAYER1":req.query.WINNER_ID
                    }
                },{
                    arrayFilters:[{"elem.MATCHID":result.MATCHES[matchid].NEXT_MATCH_ID}]
                },function(error,result){
                    if(error){
                        console.log(error)
                    }
                    if(result){
                        res.status(200).send({
                            Message:'Updated Successfully'
                        })
                    }
                })
            }
            else{
                matchesmodel.updateOne({
                    TOURNAMENT_ID:req.query.TOURNAMENT_ID
                },{
                    $set:{
                        "MATCHES.$[elem].PLAYER2":req.query.WINNER_ID
                    }
                },{
                    arrayFilters:[{"elem.MATCHID":result.MATCHES[matchid].NEXT_MATCH_ID}]
                },function(error,result){
                    if(error){
                        console.log(error)
                    }
                    if(result){
                        res.status(200).send({
                            Message:'Updated Successfully'
                        })
                    }
                })
            }
        }
    })
})
module.exports = userRouter;