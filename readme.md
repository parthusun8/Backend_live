# API Endpoints for Ardent Sports App

Given below are some of the api endpoints for the ardent sports app. (Please note that this is not a final list and is subject to change)

## host: https://ardentsportsapis.herokuapp.com
## ENDPOINTS:

## User:
### /createUser(POST)
#### body:
##### Sample JSON Post request body
{
    "USERID":"user2",
    "PHONE":"99039*****",
    "NAME":"Riddhiman",
    "EMAIL":"shrsoe@gmail.com",
    "PWD":"123123",
    "GENDER":"MALE",
    "DOB":"2002-10-17",
    "CITY":"Kolkata",
    "STATE":"West Bengal",
    "SPORTS_ACADEMY":"MSB Cricket",
    "PROFILE_ID":"Profile_1",
    "INTERESTED_SPORTS":["Cricket","Football"],
    "FRIENDS_LIST":["Profile_3","Profile_4"]
}

##### returns JSON
##### 
##### {
    Message:"Created a USER"
##### }
---------------------------------
### /resetUserPwd(POST)
#### body:
##### Sample JSON Post request body
{
    "USERID":"user2",
    "pwd":"newpassword"
}
-------------------------------------
### /userProfileBuild(POST)
#### body:
##### Sample JSON Post request body
{
    "base_profile":{
        "PROFILE_ID":"user2"
    },
    "trophy_room":{
        "TROPHY_NAME":"default"
    },
    "missions":{
    }
}

##### returns JSON
##### 
##### {
    Message:"Successfully Updated Userprofile"
##### }

-------------------------------------

## Live Maintainer
### /createLiveMaintainer(POST)
#### body
##### Sample JSON Post Request Body
{
    "LIVE_MAINTAINER_ID":"livman1",
    "PHONE":"98365*****",
    "EMAIL":"dflj@gmail.com",
    "PWD":"123123",
    "GENDER":"M",
    "DOB":"12-02-2002",
    "CITY":"Chennai",
    "STATE":"Tamil Nadu",
    "SPORTS_ACADEMY":"MTS Badminton",
    "current_tournaments":[
        "tournament_1",
        "tournament_2"
    ],
    "past_tournaments":[]
}
##### returns JSON
##### 
##### {
    Message:"Created a LiveMaintainer"
##### }

-----------------------------------------------------------
## Event Manager
### /createTournament (POST)
#### body
##### (JSON)

TOURNAMENT_ID:{
    type:Number,

  },
  STATUS:{
    type:Boolean,
    default:true,

  },
  LOCATION:{
    type:String,

  },
  TYPE:{
    type:String,
    default:"DYNAMIC",
  },
  GEOTAG:{     
    type:String,//API CALL
  },
  REGISTRATION_CLOSE_TIME:{
    type : Date
  },
  SPORT:{
    type:Array,    
  },
  CATEGORIES:{
    type:Array,
  },
  MATCHES:[Array of MatchIDs to be left empty by default],
  PARTICIPANTS:[Array of Participant IDs //To be left Empty during creation]

##### returns JSON
##### 
##### {
    Message:"Successfully Created New Tournament"
##### }

or
##### {
    Message:"Error in Tournament Creation"
##### }

-------------------------------------------------------
## Match Submission endpoints for socketio
### Client emit events
##### join-room: Is used to join the broad tournament:
###### emit event should contain: Javascript Object with fields: entity(LIVE_MAINTAINER, USER), entity_ID, TOURNAMENT_ID, MATCHID

###### while joined in room, 'update-score' event is emitted by client to update score: on successful/unsuccessful updation of scores, the relevant messages will be triggered as specified in 'server.js' file of 'Server_Riddhiman' branch
------------------------------------------------------


//29-04-2022: API Endpoints will be updated soon

Subject to Change.(Note: While connected to SRMIST(wifi) the api endpoints may not work since some ports are blocked. Try to use personal mobile hotspot for testing endpoints)
