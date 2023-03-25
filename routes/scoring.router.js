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
              STRIKER: {
                NAME: "",
                USERID: "",
              },
              NON_STRIKER: {
                NAME: "",
                USERID: "",
              },
              SCORE: 0,
            },
            BALLER: {
              NAME: "",
              USERID: "",
            },
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
        TOTAL_MATCHES: Tournament.NO_OF_KNOCKOUT_ROUNDS - 1,
      };
      console.log("newDoc " + newDoc);
      const newScoreDoc = new score(newDoc);
      await newScoreDoc.save();

      checkExists = await score.findOne({
        TOURNAMENT_ID: req.body.TOURNAMENT_ID,
      });
    }

    if (checkExists.CURRENT_MATCH_NUMBER == checkExists.TOTAL_MATCHES) {
      res.status(200).send("All Matches Completed");
    } else {
      const cuurMatchNum = checkExists.CURRENT_MATCH_NUMBER;
      console.log("Current Match " + checkExists.MATCHES[cuurMatchNum]);
      const currTeam = checkExists.MATCHES[cuurMatchNum].TEAMS;
      const teamNames = [currTeam[0].TEAM_NAME, currTeam[1].TEAM_NAME];
      console.log("Final Result " + teamNames);
      res.status(200).send(teamNames);
    }
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
      if (
        (tossWonBy != teamFormat[0] && req.body.CHOSEN_TO == "BAT") ||
        (tossWonBy == teamFormat[0] && req.body.CHOSEN_TO == "BALL")
      ) {
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
      if (
        (tossWonBy != teamFormat[0] && req.body.CHOSEN_TO == "BAT") ||
        (tossWonBy == teamFormat[0] && req.body.CHOSEN_TO == "BALL")
      ) {
        var teamPlayers = {
          two: checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[0]
            .PLAYERS,
          one: checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[1]
            .PLAYERS,
          overs: checkExists.TOTAL_OVERS,
          wickets: checkExists.WICKETS,
          first:
            checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER]
              .FIRST_INNING_DONE,
        };
        res.status(200).send(teamPlayers);
      } else {
        var teamPlayers = {
          one: checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[0]
            .PLAYERS,
          two: checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[1]
            .PLAYERS,
          overs: checkExists.TOTAL_OVERS,
          wickets: checkExists.WICKETS,
          first:
            checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER]
              .FIRST_INNING_DONE,
        };

        res.status(200).send(teamPlayers);
      }
    }
  } catch (e) {
    console.log(e);
    res.status(400).send("Error Occured");
  }
});
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
  var checkExists = {};
  try {
    checkExists = await score.findOne({
      TOURNAMENT_ID: req.body.TOURNAMENT_ID,
    });
    if (checkExists) {
      var first =
        checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].FIRST_INNING_DONE;
      var inning_no = 0;
      if (first) inning_no = 1;
      console.log(
        checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[inning_no]
          .BATTING_DETAILS.SCORE
      );

      console.log(parseInt(req.body.score));
      console.log("Starting Score Update");
      await score.updateOne(
        { TOURNAMENT_ID: req.body.TOURNAMENT_ID },
        {
          $set: {
            [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.INNING.${inning_no}.BATTING_DETAILS.SCORE`]:
              checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[
                inning_no
              ].BATTING_DETAILS.SCORE + parseInt(req.body.score),

            [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.INNING.${inning_no}.CURRENT_OVER`]:
              checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[
                inning_no
              ].CURRENT_OVER +
              req.body.score +
              "-",
          },
        }
      );
      console.log("Score Updated");
      //   update individual player score

      console.log("Starting INDIVIDUAL SCORE Update");
      var striker_index = -1;

      for (
        var i = 0;
        i <
        checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[0].PLAYERS
          .length;
        i++
      ) {
        if (
          checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[0]
            .PLAYERS[i].USERID ==
          checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[
            inning_no
          ].BATTING_DETAILS.STRIKER.USERID
        ) {
          striker_index = i;
          break;
        }
      }

      var non_striker_index = -1;

      for (
        var i = 0;
        i <
        checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[0].PLAYERS
          .length;
        i++
      ) {
        if (
          checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[0]
            .PLAYERS[i].USERID ==
          checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[
            inning_no
          ].BATTING_DETAILS.NON_STRIKER.USERID
        ) {
          non_striker_index = i;
          break;
        }
      }

      var baller_index = -1;

      for (
        var i = 0;
        i <
        checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[1].PLAYERS
          .length;
        i++
      ) {
        if (
          checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[1]
            .PLAYERS[i].USERID ==
          checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[
            inning_no
          ].BALLER.USERID
        ) {
          baller_index = i;
          break;
        }
      }

      console.log(striker_index, non_striker_index, baller_index);

      var reqscore = parseInt(req.body.score);

      console.log();

      await score.updateOne(
        { TOURNAMENT_ID: req.body.TOURNAMENT_ID },
        {
          $set: {
            [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.TEAMS.0.PLAYERS.${striker_index}.SCORE`]:
              checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[0]
                .PLAYERS[striker_index].SCORE + reqscore,
            [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.TEAMS.0.PLAYERS.${striker_index}.BALLS_USED`]:
              checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[0]
                .PLAYERS[striker_index].BALLS_USED + 1,

            [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.TEAMS.1.PLAYERS.${baller_index}.RUNS`]:
              checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[1]
                .PLAYERS[baller_index].RUNS + reqscore,

            [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.TEAMS.0.PLAYERS.${striker_index}.BALLS_USED}`]:
              checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[0]
                .PLAYERS[striker_index].BALLS_USED + 1,
            [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.TEAMS.1.PLAYERS.${baller_index}.BALLS`]:
              checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[1]
                .PLAYERS[baller_index].BALLS + 1,
          },
        }
      );

      if (req.body.score == "4") {
        console.log("4");
        await score.updateOne(
          { TOURNAMENT_ID: req.body.TOURNAMENT_ID },
          {
            $set: {
              [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.TEAMS.0.PLAYERS.${striker_index}.FOURS`]:
                checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[0]
                  .PLAYERS[striker_index].FOURS + 1,
            },
          }
        );
      }
      if (req.body.score == "6") {
        console.log("6");
        await score.updateOne(
          { TOURNAMENT_ID: req.body.TOURNAMENT_ID },
          {
            $set: {
              [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.TEAMS.0.PLAYERS.${striker_index}.SIX`]:
                checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[0]
                  .PLAYERS[striker_index].SIX + 1,
            },
          }
        );
      }
      console.log("INDIVIDUAL SCORE Updated");
      //check striker
      console.log("Starting STRIKER CHECK");
      if (
        req.body.score == "1" ||
        req.body.score == "3" ||
        req.body.score == "5"
      ) {
        //change striker
        await score.updateOne(
          { TOURNAMENT_ID: req.body.TOURNAMENT_ID },
          {
            $set: {
              [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.INNING.${inning_no}.BATTING_DETAILS.STRIKER`]:
                checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[
                  inning_no
                ].BATTING_DETAILS.NON_STRIKER,

              [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.INNING.${inning_no}.BATTING_DETAILS.NON_STRIKER`]:
                checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[
                  inning_no
                ].BATTING_DETAILS.STRIKER,
            },
          }
        );
      }
      console.log("STRIKER CHECK DONE");
      res.status(200).send("Score Updated");
    } else {
      res.status(400).send("Wrong Tournament ID");
    }
  } catch (e) {
    console.log("Error Occured", e);
    await score.updateOne(
      { TOURNAMENT_ID: req.body.TOURNAMENT_ID },
      checkExists
    );
    res.status(400).send("Error Occured");
  }
});
ScoringRouter.post("/changeOverCricket", async (req, res) => {
  var checkExists = {};
  try {
    checkExists = await score.findOne({
      TOURNAMENT_ID: req.body.TOURNAMENT_ID,
    });
    if (checkExists) {
      var first =
        checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].FIRST_INNING_DONE;
      var inning_no = 0;
      if (first) inning_no = 1;
      var striker_index = -1;
      for (
        var i = 0;
        i <
        checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[0].PLAYERS
          .length;
        i++
      ) {
        if (
          checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[1]
            .PLAYERS[i].USERID ==
          checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[
            inning_no
          ].BALLER.USERID
        ) {
          striker_index = i;
          break;
        }
      }
      if (
        checkExists.TOTAL_OVERS !=
        checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[inning_no]
          .OVERS_DONE
      ) {
        await score.updateOne(
          { TOURNAMENT_ID: req.body.TOURNAMENT_ID },
          {
            $push: {
              [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.INNING.${inning_no}.COMPLETED_OVER_DETAILS`]:
                checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[
                  inning_no
                ].CURRENT_OVER,
            },
          }
        );
        await score.updateOne(
          { TOURNAMENT_ID: req.body.TOURNAMENT_ID },
          {
            $set: {
              [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.INNING.${inning_no}.CURRENT_OVER`]:
                "",
              [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.INNING.${inning_no}.OVERS_DONE`]:
                checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[
                  inning_no
                ].OVERS_DONE + 1,
              [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.INNING.${inning_no}.BATTING_DETAILS.STRIKER`]:
                checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[
                  inning_no
                ].BATTING_DETAILS.NON_STRIKER,
              [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.INNING.${inning_no}.BATTING_DETAILS.NON_STRIKER`]:
                checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[
                  inning_no
                ].BATTING_DETAILS.STRIKER,
              [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.INNING.${inning_no}.BALLER`]:
                checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[1]
                  .PLAYERS[req.body.baller_index],
              [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.TEAMS.1.PLAYERS.${striker_index}.BALLS`]:
                checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[1]
                  .PLAYERS[striker_index].BALLS + 1,
            },
          }
        );
        res.status(200).send("Over Changed Successfully");
      } else {
        res.status(200).send("INNINGS IS COMPLETED");
      }
    } else {
      console.log("Wrong Tournament ID");
      res.status(400).send("Wrong Tournament ID");
    }
  } catch (e) {
    console.log("Error Occured" + e);
    await score.updateOne(
      { TOURNAMENT_ID: req.body.TOURNAMENT_ID },
      checkExists
    );
    res.status(400).send("Error Occured");
  }
});

//CHANGE OVER ALSO
ScoringRouter.post("/changeInningCricket", async (req, res) => {
  var checkExists = {};
  try {
    checkExists = await score.findOne({
      TOURNAMENT_ID: req.body.TOURNAMENT_ID,
    });
    if (checkExists) {
      if (
        checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER]
          .FIRST_INNING_DONE == false
      ) {
        await score.updateOne(
          { TOURNAMENT_ID: req.body.TOURNAMENT_ID },
          {
            $set: {
              [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.FIRST_INNING_DONE`]: true,
              [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.TEAMS.0`]:
                checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[1],
              [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.TEAMS.1`]:
                checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[0],
            },
          }
        );
        res.status(200).send("First Inning Completed");
      } else {
        res.status(200).send("Next Inning Has Already Started");
      }
    } else {
      res.status(200).send("Wrong Tournament Id");
    }
  } catch (e) {
    console.log(e);
    await score.updateOne(
      { TOURNAMENT_ID: req.body.TOURNAMENT_ID },
      checkExists
    );
    res.status(400).send("Error Occured");
  }
});
ScoringRouter.post("/outScore", async (req, res) => {
  //Update Balls Count
  var checkExists = {};
  var ways = {
    LBW: "LBW",
    Bowled: "B",
    "Catch Out": "C",
    "Stricker Run Out": "RO",
    "Non Stricker Run Out": "RO",
    Stumped: "ST",
    "Hit Wicket": "HW",
  };
  try {
    checkExists = await score.findOne({
      TOURNAMENT_ID: req.body.TOURNAMENT_ID,
    });
    if (checkExists) {
      var first =
        checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].FIRST_INNING_DONE;
      var inning_no = 0;
      if (first) inning_no = 1;

      var baller_index = -1;

      for (
        var i = 0;
        i <
        checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[1].PLAYERS
          .length;
        i++
      ) {
        if (
          checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[1]
            .PLAYERS[i].USERID ==
          checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[
            inning_no
          ].BALLER.USERID
        ) {
          baller_index = i;
          break;
        }
      }

      if (req.body.remarks == "Non Stricker Run Out") {
        var non_striker_index = -1;

        for (
          var i = 0;
          i <
          checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[0].PLAYERS
            .length;
          i++
        ) {
          if (
            checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[0]
              .PLAYERS[i].USERID ==
            checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[
              inning_no
            ].BATTING_DETAILS.NON_STRIKER.USERID
          ) {
            non_striker_index = i;
            break;
          }
        }
        await score.updateOne(
          { TOURNAMENT_ID: req.body.TOURNAMENT_ID },
          {
            $set: {
              [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.TEAMS.1.PLAYERS.${baller_index}.WICKETS`]:
                checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[1]
                  .PLAYERS[baller_index].WICKETS + 1,
              [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.INNING.${inning_no}.BATTING_DETAILS.NON_STRIKER`]:
                checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[0]
                  .PLAYERS[req.body.index],
              [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.INNING.${inning_no}.CURRENT_OVER`]:
                checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[
                  inning_no
                ].CURRENT_OVER +
                ways[req.body.remarks] +
                "-",
              [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.INNING.${inning_no}.WICKETS`]:
                checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[
                  inning_no
                ].WICKETS + 1,

              [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.TEAMS.1.PLAYERS.${baller_index}.BALLS`]:
                checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[1]
                  .PLAYERS[baller_index].BALLS + 1,

              [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.TEAMS.0.PLAYERS.${non_striker_index}.BALLS_USED`]:
                checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[0]
                  .PLAYERS[non_striker_index].BALLS_USED + 1,
            },
          }
        );
      } else {
        var striker_index = -1;

        for (
          var i = 0;
          i <
          checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[0].PLAYERS
            .length;
          i++
        ) {
          if (
            checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[0]
              .PLAYERS[i].USERID ==
            checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[
              inning_no
            ].BATTING_DETAILS.STRIKER.USERID
          ) {
            striker_index = i;
            break;
          }
        }

        await score.updateOne(
          { TOURNAMENT_ID: req.body.TOURNAMENT_ID },
          {
            $set: {
              [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.TEAMS.1.PLAYERS.${baller_index}.WICKETS`]:
                checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[1]
                  .PLAYERS[baller_index].WICKETS + 1,
              [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.INNING.${inning_no}.BATTING_DETAILS.STRIKER`]:
                checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[0]
                  .PLAYERS[req.body.index],
              [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.INNING.${inning_no}.CURRENT_OVER`]:
                checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[
                  inning_no
                ].CURRENT_OVER +
                ways[req.body.remarks] +
                "-",
              [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.INNING.${inning_no}.WICKETS`]:
                checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[
                  inning_no
                ].WICKETS + 1,

              [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.TEAMS.1.PLAYERS.${baller_index}.BALLS`]:
                checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[1]
                  .PLAYERS[baller_index].BALLS + 1,

              [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.TEAMS.0.PLAYERS.${striker_index}.BALLS_USED}`]:
                checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[0]
                  .PLAYERS[striker_index].BALLS_USED + 1,
            },
          }
        );
      }
      res.status(200).send("Out Managed");
    } else {
      res.status(400).send("Wrong Tournament ID");
    }
  } catch (e) {
    console.log(e);
    await score.updateOne(
      { TOURNAMENT_ID: req.body.TOURNAMENT_ID },
      checkExists
    );
    res.status(400).send("Error Occured");
  }
});
ScoringRouter.post("/specialRuns", async (req, res) => {
  var checkExists = {};
  var ways = {
    "No Ball": "NB",
    "Wide Ball": "WD",
    "Bye Ball": "Bye",
  };
  var runs = {
    "No Ball": 1,
    "Wide Ball": 1,
    "Bye Ball": 0,
  };
  try {
    checkExists = await score.findOne({
      TOURNAMENT_ID: req.body.TOURNAMENT_ID,
    });
    if (checkExists) {
      var first =
        checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].FIRST_INNING_DONE;
      var inning_no = 0;
      if (first) inning_no = 1;

      var striker_index = -1;

      for (
        var i = 0;
        i <
        checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[0].PLAYERS
          .length;
        i++
      ) {
        if (
          checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[0]
            .PLAYERS[i].USERID ==
          checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[
            inning_no
          ].BATTING_DETAILS.STRIKER.USERID
        ) {
          striker_index = i;
          break;
        }
      }

      var baller_index = -1;

      for (
        var i = 0;
        i <
        checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[1].PLAYERS
          .length;
        i++
      ) {
        if (
          checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[1]
            .PLAYERS[i].USERID ==
          checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[
            inning_no
          ].BALLER.USERID
        ) {
          baller_index = i;
          break;
        }
      }
      console.log(baller_index);

      await score.updateOne(
        { TOURNAMENT_ID: req.body.TOURNAMENT_ID },
        {
          $set: {
            [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.INNING.${inning_no}.CURRENT_OVER`]:
              checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[
                inning_no
              ].CURRENT_OVER +
              ways[req.body.remarks] +
              "-",

            [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.INNING.${inning_no}.BATTING_DETAILS.SCORE`]:
              checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[
                inning_no
              ].BATTING_DETAILS.SCORE +
              req.body.score +
              runs[req.body.remarks],

            [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.TEAMS.0.PLAYERS.${striker_index}.SCORE`]:
              checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[0]
                .PLAYERS[striker_index].SCORE + req.body.score,

            [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.TEAMS.1.PLAYERS.${baller_index}.RUNS`]:
              checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[1][
                "PLAYERS"
              ][baller_index].RUNS +
              req.body.score +
              runs[req.body.remarks],

            [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.TEAMS.1.PLAYERS.${baller_index}.BALLS`]:
              checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[1]
                .PLAYERS[baller_index].BALLS + 1,
          },
        }
      );

      if (req.body.score % 2 == 1) {
        await score.updateOne(
          { TOURNAMENT_ID: req.body.TOURNAMENT_ID },
          {
            $set: {
              [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.INNING.${inning_no}.BATTING_DETAILS.STRIKER`]:
                checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[
                  inning_no
                ].BATTING_DETAILS.NON_STRIKER,
              [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.INNING.${inning_no}.BATTING_DETAILS.NON_STRIKER`]:
                checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[
                  inning_no
                ].BATTING_DETAILS.STRIKER,
            },
          }
        );
      }
      res.status(200).send("Special Runs Managed");
    } else {
      console.log("Invalid Tournament ID");
      res.status(400).send("Invalid Tournament ID");
    }
  } catch (e) {
    console.log(e);
    await score.updateOne(
      { TOURNAMENT_ID: req.body.TOURNAMENT_ID },
      checkExists
    );
    res.status(400).send("Error Occured");
  }
});
ScoringRouter.post("/endMatchCricket", async (req, res) => {
  var checkExists = {};
  try {
    checkExists = await score.findOne({
      TOURNAMENT_ID: req.body.TOURNAMENT_ID,
    });
    if (checkExists) {
      console.log(
        checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[0].TEAM_NAME
      );
      if (
        checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[0]
          .TEAM_NAME == req.body.batting_team_name
      ) {
        await score.updateOne(
          { TOURNAMENT_ID: req.body.TOURNAMENT_ID },
          {
            $set: {
              CURRENT_MATCH_NUMBER: checkExists.CURRENT_MATCH_NUMBER + 1,
            },
          }
        );

        //Check Who Won
        var firstInningScore =
          checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[0]
            .BATTING_DETAILS.SCORE;
        var secondInningScore =
          checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[1]
            .BATTING_DETAILS.SCORE;

        var winningTeam = {};
        if (firstInningScore > secondInningScore) {
          await score.updateOne(
            { TOURNAMENT_ID: req.body.TOURNAMENT_ID },
            {
              $set: {
                [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.WINNER`]:
                  checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER]
                    .TEAMS[1],
              },
            }
          );
          winningTeam =
            checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[1];
          res.status(200).send(winningTeam.TEAM_NAME);
        } else {
          await score.updateOne(
            {
              TOURNAMENT_ID: req.body.TOURNAMENT_ID,
            },
            {
              $set: {
                [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.WINNER`]:
                  checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER]
                    .TEAMS[0],
              },
            }
          );
          winningTeam =
            checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].TEAMS[0];
          res.status(200).send(winningTeam.TEAM_NAME);
        }

        if (checkExists.CURRENT_MATCH_NUMBER % 2 == 1) {
          var inningArray = [];
          for (var i = 0; i < 2; i += 1) {
            inningArray.push({
              COMPLETED_OVER_DETAILS: [],
              CURRENT_OVER: "",
              BATTING_DETAILS: {
                STRIKER: {
                  NAME: "",
                  USERID: "",
                },
                NON_STRIKER: {
                  NAME: "",
                  USERID: "",
                },
                SCORE: 0,
              },
              BALLER: {
                NAME: "",
                USERID: "",
              },
              OVERS_DONE: 0,
              WICKETS: 0,
            });
          }
          await score.updateOne(
            { TOURNAMENT_ID: req.body.TOURNAMENT_ID },
            {
              $push: {
                MATCHES: {
                  MATCH_ID: checkExists.MATCHES.length + 1,
                  TOURNAMENT_ID: req.body.TOURNAMENT_ID,
                  TEAMS: [
                    checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER - 1]
                      .WINNER,
                    winningTeam,
                  ],
                  INNING: inningArray,
                },
              },
            }
          );
          console.log("Added a new Match");
        }
      } else {
        console.log(
          "Already Done End Match Once. Cant Do Again. Go to Score a challenge page, enter tournament id and play a new match"
        );
        res
          .status(200)
          .send(
            "Already Done End Match Once. Cant Do Again. Go to Score a challenge page, enter tournament id and play a new match"
          );
      }
    } else {
      res.status(400).send("Invalid Tournament ID");
    }
  } catch (e) {
    console.log(e);
    await score.updateOne(
      { TOURNAMENT_ID: req.body.TOURNAMENT_ID },
      checkExists
    );
    res.status(400).send("Error Occured");
  }
});
ScoringRouter.post("/changeStrike", async (req, res) => {
  var checkExists = {};
  try {
    checkExists = await score.findOne({
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
            [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.INNING.${inning_no}.BATTING_DETAILS.STRIKER`]:
              checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[
                inning_no
              ].BATTING_DETAILS.NON_STRIKER,

            [`MATCHES.${checkExists.CURRENT_MATCH_NUMBER}.INNING.${inning_no}.BATTING_DETAILS.NON_STRIKER`]:
              checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[
                inning_no
              ].BATTING_DETAILS.STRIKER,
          },
        }
      );
      res.status(200).send("Striker, Non-Striker Changed");
    } else {
      res.status(200).send("Wrong Tournament Id");
    }
  } catch (e) {
    console.log("Error Occured");
    await score.updateOne(
      { TOURNAMENT_ID: req.body.TOURNAMENT_ID },
      checkExists
    );
    res.status(400).send("Error Occured");
  }
});
ScoringRouter.post("/getScoreCard", async (req, res) => {
  var checkExists = {};
  try {
    checkExists = await score.findOne({
      TOURNAMENT_ID: req.body.TOURNAMENT_ID,
    });
    if (checkExists) {
      checkExists.CURRENT_MATCH_NUMBER -= 1;

      var returnVal = {
        scoreCard: [
          {
            TeamName: "",
            TeamTotal: 0,
            TeamWickets: 0,
            TeamOvers: 0,
          },
          {
            TeamName: "",
            TeamTotal: 0,
            TeamWickets: 0,
            TeamOvers: 0,
          },
        ],
        WinnerTeam: "",
      };

      returnVal.scoreCard[0].TeamName =
        checkExists.MATCHES[
          checkExists.CURRENT_MATCH_NUMBER
        ].TEAMS[1].TEAM_NAME;
      returnVal.scoreCard[0].TeamTotal =
        checkExists.MATCHES[
          checkExists.CURRENT_MATCH_NUMBER
        ].INNING[0].BATTING_DETAILS.SCORE;
      returnVal.scoreCard[0].TeamWickets =
        checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[0].WICKETS;
      returnVal.scoreCard[0].TeamOvers =
        checkExists.MATCHES[
          checkExists.CURRENT_MATCH_NUMBER
        ].INNING[0].OVERS_DONE;

      var extraOvers =
        checkExists.MATCHES[
          checkExists.CURRENT_MATCH_NUMBER
        ].INNING[0].CURRENT_OVER.split("-");
      var countExtra = 0;
      for (var i = 0; i < extraOvers.length - 1; i += 1) {
        if (
          extraOvers[i] == "0" ||
          extraOvers[i] == "1" ||
          extraOvers[i] == "2" ||
          extraOvers[i] == "3" ||
          extraOvers[i] == "4" ||
          extraOvers[i] == "5" ||
          extraOvers[i] == "6" ||
          extraOvers[i] == "Bye"
        ) {
          countExtra += 0.1;
        }
      }
      if (countExtra < 0.6) {
        returnVal.scoreCard[0].TeamOvers += countExtra;
      } else {
        returnVal.scoreCard[0].TeamOvers += 1;
      }

      returnVal.scoreCard[1].TeamName =
        checkExists.MATCHES[
          checkExists.CURRENT_MATCH_NUMBER
        ].TEAMS[0].TEAM_NAME;
      returnVal.scoreCard[1].TeamTotal =
        checkExists.MATCHES[
          checkExists.CURRENT_MATCH_NUMBER
        ].INNING[1].BATTING_DETAILS.SCORE;
      returnVal.scoreCard[1].TeamWickets =
        checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[1].WICKETS;
      returnVal.scoreCard[1].TeamOvers =
        checkExists.MATCHES[
          checkExists.CURRENT_MATCH_NUMBER
        ].INNING[1].OVERS_DONE;

      var extraOvers =
        checkExists.MATCHES[
          checkExists.CURRENT_MATCH_NUMBER
        ].INNING[1].CURRENT_OVER.split("-");
      var countExtra = 0;
      for (var i = 0; i < extraOvers.length - 1; i += 1) {
        if (
          extraOvers[i] == "0" ||
          extraOvers[i] == "1" ||
          extraOvers[i] == "2" ||
          extraOvers[i] == "3" ||
          extraOvers[i] == "4" ||
          extraOvers[i] == "5" ||
          extraOvers[i] == "6" ||
          extraOvers[i] == "Bye"
        ) {
          countExtra += 0.1;
        }
      }

      if (countExtra < 0.6) {
        returnVal.scoreCard[1].TeamOvers += countExtra;
      } else {
        returnVal.scoreCard[1].TeamOvers += 1;
      }

      var firstInningScore =
        checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[0]
          .BATTING_DETAILS.SCORE;
      var secondInningScore =
        checkExists.MATCHES[checkExists.CURRENT_MATCH_NUMBER].INNING[1]
          .BATTING_DETAILS.SCORE;

      if (firstInningScore > secondInningScore) {
        returnVal.WinnerTeam =
          checkExists.MATCHES[
            checkExists.CURRENT_MATCH_NUMBER
          ].TEAMS[1].TEAM_NAME;
      } else {
        returnVal.WinnerTeam =
          checkExists.MATCHES[
            checkExists.CURRENT_MATCH_NUMBER
          ].TEAMS[0].TEAM_NAME;
      }

      res.status(200).send(returnVal);
    } else {
      res.status(200).send("Wrong Tournament Id");
    }
  } catch (e) {
    console.log("Error Occured");
    await score.updateOne(
      { TOURNAMENT_ID: req.body.TOURNAMENT_ID },
      checkExists
    );
    res.status(400).send("Error Occured");
  }
});

module.exports = ScoringRouter;
