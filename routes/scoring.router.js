const express = require("express");
const mongoose = require("mongoose");
const USER = require("../models/user.mongo");
const USERProfile = require("../models/userprofile.model");
const tournamentModel = require("../models/tournament.model");
const onlytournamentModel = require("../models/tourney.mongo");
const matchesmodel = require("../models/matches.mongo");
const ScoringRouter = express.Router();
const S3 = require("aws-sdk/clients/s3");
const timings = require("../models/timings.mongo");
const matchtiming = require("../models/matchtimings.mongo");
const tourneyMongo = require("../models/tourney.mongo");
const cricketModel = require("../models/cricket.model");
const Player = require("../models/team.model");
const score = require("../models/scoring.model");

ScoringRouter.post('/startScoringFlow', async (req, res) =>{
    try{
        const checkExists = await score.findOne({TOURNAMENT_ID : req.body.TOURNAMENT_ID});

        if(!checkExists){
            const CricketDoc = await cricketModel.findOne({TOURNAMENT_ID : req.body.TOURNAMENT_ID});

            const GetAllTeams = await Player.find({TOURNAMENT_ID : req.body.TOURNAMENT_ID});

            //CREATING ONLY FIRST SET OF MATCHES
            var matchesArray = [];
            var matchNo = 0;
            var inningArray = [];
            for(var i=0; i<CricketDoc.TEAM_SIZE; i+=2){
                var teamArray = [];
                var inningArray = [];
                for(var j=0; j<2; j++){
                    teamArray.push({
                        TOURNAMENT_ID : req.body.TOURNAMENT_ID,
                        PLAYERS : GetAllTeams[i+j].PLAYERS,
                        SUBSTITUTE : GetAllTeams[i+j].SUBSTITUTE,
                        TEAM_NAME : GetAllTeams[i+j].TEAM_NAME,
                        CAPTAIN : GetAllTeams[i+j].CAPTAIN,
                    });
                    inningArray.push({
                        COMPLETED_OVER_DETAILS : [],
                        CURRENT_OVER : "",
                        BATTING_DETAILS : {
                            STRIKER : "",
                            NON_STRIKER : "",
                            SCORE : 0,
                        },
                        BALLER : "",
                        OVERS_DONE : 0,
                        WICKETS : 0,
                    });
                }

                matchesArray.append({
                    MATCH_ID : matchNo,
                    TOURNAMENT_ID : req.body.TOURNAMENT_ID,
                    TEAMS : teamArray,
                    STATUS : false,
                    WINNER : "ONGOING",
                    FIRST_INNING_DONE : false,
                    INNING : inningArray,
                });
                matchNo++;
            }

            const newDoc = {
                TOURNAMENT_ID : req.body.TOURNAMENT_ID,
                TOTAL_OVERS : CricketDoc.OVERS,
                WICKETS : CricketDoc.TEAM_SIZE,
                MATCHES : matchesArray,
            };
            console.log("newDoc " + newDoc);
            const newScoreDoc = new score(newDoc);
            await newScoreDoc.save();

            checkExists = await score.findOne({TOURNAMENT_ID : req.body.TOURNAMENT_ID});
        } 
        const cuurMatchNum = checkExists.CURRENT_MATCH_NUMBER;
        console.log("Current Match " + checkExists.MATCHES[cuurMatchNum]);
        const currTeam = checkExists.MATCHES[cuurMatchNum].TEAMS;
        const teamNames = [currTeam[0].TEAM_NAME, currTeam[1].TEAM_NAME];
        console.log("Final Result " + teamNames);
        res.status(200).send(teamNames);
    } catch(e){
        console.log(e);
        res.status(400).send("Error Occured");
    }
});

module.exports = ScoringRouter;