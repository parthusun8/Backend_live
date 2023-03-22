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

ScoringRouter.post("/startScoringFlow", async (req, res) => {
  try {
    var checkExists = await score.findOne({
      TOURNAMENT_ID: req.body.TOURNAMENT_ID,
    });
    if (!checkExists) {
      const CricketDoc = await cricketModel.findOne({
        TOURNAMENT_ID: req.body.TOURNAMENT_ID,
      });
      const Tournament = await tournamentModel.findOne({
        TOURNAMENT_ID: req.body.TOURNAMENT_ID,
      });
      const GetAllTeams = await Player.find({
        TOURNAMENT_ID: req.body.TOURNAMENT_ID,
      });
      // console.log(GetAllTeams);
      //CREATING ONLY FIRST SET OF MATCHES
      var matchesArray = [];
      var matchNo = 0;
      var inningArray = [];
      for (var i = 0; i < Tournament.NO_OF_KNOCKOUT_ROUNDS; i += 2) {
        console.log("Curently Doing ", GetAllTeams[i], GetAllTeams[i + 1]);
        var teamArray = [];
        var inningArray = [];
        for (var j = 0; j < 2; j++) {
          teamArray.push({
            TOURNAMENT_ID: req.body.TOURNAMENT_ID,
            PLAYERS: GetAllTeams[i + j].PLAYERS,
            SUBSTITUTE: GetAllTeams[i + j].SUBSTITUTE,
            TEAM_NAME: GetAllTeams[i + j].TEAM_NAME,
            CAPTAIN: GetAllTeams[i + j].CAPTAIN,
          });
          inningArray.push({
            COMPLETED_OVER_DETAILS: [],
            CURRENT_OVER: "",
            BATTING_DETAILS: {
              STRIKER: "",
              NON_STRIKER: "",
              SCORE: 0,
            },
            BALLER: "",
            OVERS_DONE: 0,
            WICKETS: 0,
          });
        }

        matchesArray.push({
          MATCH_ID: matchNo,
          TOURNAMENT_ID: req.body.TOURNAMENT_ID,
          TEAMS: teamArray,
          STATUS: false,
          WINNER: "ONGOING",
          FIRST_INNING_DONE: false,
          INNING: inningArray,
        });
        matchNo++;
      }

      const newDoc = {
        TOURNAMENT_ID: req.body.TOURNAMENT_ID,
        TOTAL_OVERS: CricketDoc.OVERS,
        WICKETS: CricketDoc.TEAM_SIZE,
        MATCHES: matchesArray,
      };
      console.log("newDoc " + newDoc);
      const newScoreDoc = new score(newDoc);
      await newScoreDoc.save();

      checkExists = await score.findOne({
        TOURNAMENT_ID: req.body.TOURNAMENT_ID,
      });
    }
    const cuurMatchNum = checkExists.CURRENT_MATCH_NUMBER;
    console.log("Current Match " + checkExists.MATCHES[cuurMatchNum]);
    const currTeam = checkExists.MATCHES[cuurMatchNum].TEAMS;
    const teamNames = [currTeam[0].TEAM_NAME, currTeam[1].TEAM_NAME];
    console.log("Final Result " + teamNames);
    res.status(200).send(teamNames);
  } catch (e) {
    console.log(e);
    res.status(400).send("Error Occured");
  }
});

ScoringRouter.post("/updateToss", async (req, res) => {
  try {
    const checkExists = await score.findOne({
      TOURNAMENT_ID: req.body.TOURNAMENT_ID,
    });
    if (checkExists) {
      await score.updateOne(
        { TOURNAMENT_ID: req.body.TOURNAMENT_ID },
        {
          $set: {
            [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.TOSS`]:
              req.body.CHOSEN_TO,
          },
        }
      );
      const tossWonBy = req.body.TEAM_NAME;
      const teamFormat = req.body.TEAM_FORMAT;
      if (tossWonBy != teamFormat[0] && req.body.CHOSEN_TO == "BAT") {
        var temp =
          checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[1];
        checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[1] =
          checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[0];
        checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[0] = temp;
        const resss = await score.updateOne(
          { TOURNAMENT_ID: req.body.TOURNAMENT_ID },
          {
            $set: {
              [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.TEAMS.0`]:
                checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[1],
              [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.TEAMS.1`]:
                checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[0],
            },
          }
        );
        console.log("Updated Team Order ");
      }
      var teamPlayers = {
        "one" : checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[0].PLAYERS,
        "two" : checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[1].PLAYERS,
        "overs" : checkExists.TOTAL_OVERS,
        "wickets" : checkExists.WICKETS,
        "first" : checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].FIRST_INNING_DONE,
      };

      res.status(200).send(teamPlayers);
    }
  } catch (e) {
    console.log(e);
    res.status(400).send("Error Occured");
  }
});

//For Striker, Non Striker
ScoringRouter.post("/updatePlayers", async (req, res) => {
  try {
    var checkExists = await score.findOne(
      { TOURNAMENT_ID: req.body.TOURNAMENT_ID },
      { MATCHES: 1, CURRENT_MATCH_NUMBER: 1 }
    );
    if (checkExists) {
      var first =
        checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].FIRST_INNING_DONE;
      var inning_no = 0;
      if (first) inning_no = 1;

      await score.updateOne(
        { TOURNAMENT_ID: req.body.TOURNAMENT_ID },
        {
          $set: {
            [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.INNING.${inning_no}.BATTING_DETAILS.STRIKER`]:
              checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[0]
                .PLAYERS[req.body.BATTING.STRIKER_INDEX],
            [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.INNING.${inning_no}.BATTING_DETAILS.NON_STRIKER`]:
              checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[0]
                .PLAYERS[req.body.BATTING.NON_STRIKER_INDEX],
            [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.INNING.${inning_no}.BALLER`]:
              checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[1]
                .PLAYERS[req.body.BOWLING.BALLER_INDEX],
          },
        }
      );
      res.status(200).send("Striker, Non-Striker, Baller Updated");
    } else {
      res.status(400).send("Wrong Tournament ID");
    }
  } catch (e) {
    res.status(400).send("Error Occured");
  }
});

ScoringRouter.post("/usualScore", async (req, res) => {
  try {
    var checkExists = await score.findOne({
      TOURNAMENT_ID: req.body.TOURNAMENT_ID,
    });
    if (checkExists) {
      var first =
        checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].FIRST_INNING_DONE;
      var inning_no = 0;
      if (first) inning_no = 1;

      await score.updateOne(
        { TOURNAMENT_ID: req.body.TOURNAMENT_ID },
        {
          $set: {
            [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.INNING.${inning_no}.BATTING_DETAILS.SCORE`]:
              checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[
                inning_no
              ].BATTING_DETAILS.SCORE + req.body.SCORE,

            [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.INNING.${inning_no}.CURRENT_OVER`]:
              checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[
                inning_no
                ].CURRENT_OVER + req.body.score + "-",
          },
        }
      );

      //update individual player score
      const striker_index = checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[0].PLAYERS.findIndex((x) => {return x == checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[inning_no].BATTING_DETAILS.STRIKER});

      const non_striker_index = checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[0].PLAYERS.findIndex((x) => {return x == checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[inning_no].BATTING_DETAILS.NON_STRIKER});

      const baller_index = checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[1].PLAYERS.findIndex((x) => {return x == checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[inning_no].BALLER});
      
      console.log(striker_index, non_striker_index, baller_index);

      var reqscore = parseInt(req.body.score);

      await score.updateOne({TOURNAMENT_ID : req.body.TOURNAMENT_ID},{
        $set: {
            [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.TEAMS.0.PLAYERS.${striker_index}.SCORE`]: checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[0].PLAYERS[striker_index].SCORE + reqscore,

            [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.TEAMS.1.PLAYERS.${baller_index}.RUNS`]: checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[1].PLAYERS[baller_index].RUNS + reqscore,
        }
      })

      //check striker
      if(req.body.score == "1" || req.body.score == "3" || req.body.score == "5"){
        //change striker

      } else{
        //no change
      }
      res.status(200).send("Score Updated");
    } else {
      res.status(400).send("Wrong Tournament ID");
    }
  } catch (e) {
    console.log("Error Occured");
    res.status(400).send("Error Occured");
  }
});
module.exports = ScoringRouter;
