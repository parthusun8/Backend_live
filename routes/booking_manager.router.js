const express = require("express");
const mongoose = require("mongoose");
const USER = require("../models/user.mongo");
const USERProfile = require("../models/userprofile.model");
const tournamentModel = require("../models/tournament.model");
const onlytourneys = require("../models/tourney.mongo");
const matchesmodel = require("../models/matches.mongo");
const BookingRouter = express.Router();
const S3 = require("aws-sdk/clients/s3");
const timings = require("../models/timings.mongo");
const matchtiming = require("../models/matchtimings.mongo");
const tourneyMongo = require("../models/tourney.mongo");
const cricketModel = require("../models/cricket.model");
const Player = require("../models/team.model");
const s3 = new S3({
  region: "ap-south-1",
  accessKeyId: "AKIAZCDZBASTOLTWPCVW",
  secretAccessKey: "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",
});

//working - tested
// this is to get the players doc for a tournament under a captain
BookingRouter.get("/getPlayers", async (req, res) => {
  try {
    const tournament_id = req.query.TOURNAMENT_ID;
    const captain_id = req.query.CAPTAIN;
    var result = await Player.findOne({
      TOURNAMENT_ID: tournament_id,
      CAPTAIN: captain_id,
    });
    console.log(result);
    if(!result){
      const nameFromEmail = await USER.findOne({EMAIL : req.query.CAPTAIN});
      await Player.create({
        TEAM_NAME: "",
        TOURNAMENT_ID: tournament_id,
        CAPTAIN: captain_id,
        PLAYERS: [{ USERID: captain_id, NAME: nameFromEmail.NAME}],
        SUBSTITUTE: [],
        TEAM_NAME : ""
      });
      result = await Player.findOne({TOURNAMENT_ID : tournament_id, CAPTAIN : captain_id})
    }
    if (result) {
      const result1 = {
        TOURNAMENT_ID: result.TOURNAMENT_ID,
        CAPTAIN: captain_id,
        PLAYERS: result.PLAYERS,
        SUBSTITUTE: result.SUBSTITUTE,
        TEAM_NAME : result.TEAM_NAME,
      };
      console.log(result1);
      res.status(200).send(result1);
    } else {
      res.status(201).send("Incorrect Tournament ID or User Id");
    }
  } catch (e) {
    console.log(e);
    res.status(400).send("Error Occured");
  }
});

//working - tested
//this is to validate if a player is already playing in another team
//also checks if player exists or not?
BookingRouter.post("/validatePlayerCricket", async (req, res) => {
  function search(set, key) {
    for (const player of set.entries()) {
      if (player[0] == key) {
        return true;
      }
    }
    return false;
  }

  const usr_to_be_found = await USER.findOne({
    USERID: req.body.player,
  });

  console.log(usr_to_be_found);
  if (usr_to_be_found) {
    console.log("User Exists : ");
    const all = await Player.find({ TOURNAMENT_ID: req.body.TOURNAMENT_ID });
    console.log("Tournament Exists ");
    const allPlayers = new Set();
    console.log("Empty allPlayers : ", allPlayers);
    for (var i = 0; i < all.length; i++) {
      for (var j = 0; j < all[i].PLAYERS.length; j++) {
        allPlayers.add(all[i].PLAYERS[j].USERID);
        console.log(all[i].PLAYERS[j].USERID);
      }
    }
    console.log("All Players are " + allPlayers);
    if (!search(allPlayers, req.body.player)) {
      res.status(200).send({
        Message: "Can Add Player",
        USERID: req.body.player,
        NAME: usr_to_be_found.NAME,
      });
    } else {
      res.status(300).send({
        Message: "Player Already Playing in Another Team",
      });
    }
    console.log(all);
  } else {
    res.status(404).send({
      Message: "Player not found",
    });
  }
});
// TEAM_NAME
BookingRouter.post("/cricketTeamName", async (req, res) => {
  try {
    const result1 = await Player.findOne({
      TOURNAMENT_ID: req.body.TOURNAMENT_ID,
      CAPTAIN: req.body.CAPTAIN,
    });
    if (result1) {
      await Player.findOneAndUpdate(
        { TOURNAMENT_ID: req.body.TOURNAMENT_ID, CAPTAIN: req.body.CAPTAIN },
        { TEAM_NAME: req.body.NAME }
      );
      res.status(200).send("Team Name Added");
    }
  } catch (e) {
    console.log("Error Occured");
    res.status(400).send("Error Occured");
  }
});
BookingRouter.post("/getCricketTourneyDetails", async (req, res) => {
  try {
    const result1 = await cricketModel.findOne({
      TOURNAMENT_ID: req.body.TOURNAMENT_ID,
    });
    if (result1) {
      res.status(200).send(result1);
    } else {
      res.status(201).send("Incorrect Tournament ID");
    }
  } catch (e) {
    console.log("Error Occured");
    res.status(400).send("Something Went Wrong");
  }
});
BookingRouter.post("/addTeamPlayers", async (req, res) => {
  try {
    if(!req.body.player.NAME || !req.body.player.USERID || req.body.player.NAME == "" || req.body.player.USERID == ""){
      res.status(400).send("Player Name or Player ID is missing");
      return;
    }
    const result1 = await Player.findOne({
      TOURNAMENT_ID: req.body.TOURNAMENT_ID,
      CAPTAIN: req.body.CAPTAIN,
    });
    console.log(result1);
    if (!result1) {
      await Player.create({
        TEAM_NAME: "",
        TOURNAMENT_ID: req.body.TOURNAMENT_ID,
        CAPTAIN: req.body.CAPTAIN,
        PLAYERS: [{ USERID: req.body.CAPTAIN, NAME: req.body.CAPTAIN }],
        SUBSTITUTE: [],
        TEAM_NAME : ""
      });
    }
    const player = req.body.player;
    await Player.findOneAndUpdate(
      { TOURNAMENT_ID: req.body.TOURNAMENT_ID, CAPTAIN: req.body.CAPTAIN },
      { $push: { PLAYERS: player } }
    );
    res.status(200).send("Player Added");
  } catch (e) {
    console.log("Error Occured");
    console.log(e);
    res.status(400).send("Something Went Wrong");
  }
});
BookingRouter.post("/addSubstitutePlayers", async (req, res) => {
  try {
    if(!req.body.substitute.NAME || !req.body.substitute.USERID || req.body.substitute.NAME == "" || req.body.substitute.USERID == ""){
      res.status(400).send("Player Name or Player ID is missing");
      return;
    }
    const result1 = await Player.findOne({
      TOURNAMENT_ID: req.body.TOURNAMENT_ID,
      CAPTAIN: req.body.CAPTAIN,
    });
    if (!result1) {
      await Player.create({
        TOURNAMENT_ID: req.body.TOURNAMENT_ID,
        CAPTAIN: req.body.CAPTAIN,
        PLAYERS: [{ USERID: req.body.CAPTAIN, NAME: req.body.CAPTAIN }],
        SUBSTITUTE: [],
        TEAM_NAME : "",
      });
    }
    const subs = req.body.substitute;
    await Player.findOneAndUpdate(
      { TOURNAMENT_ID: req.body.TOURNAMENT_ID, CAPTAIN: req.body.CAPTAIN },
      { $push: { SUBSTITUTE: subs } }
    );
    res.status(200).send("Substitute Added");
  } catch (e) {
    console.log("Error Occured");
    res.status(400).send("Something Went Wrong");
  }
});
BookingRouter.post("/removePlayer", async (req, res) => {
  try {
    var request = {
      TOURNAMENT_ID: req.body.TOURNAMENT_ID,
      CAPTAIN: req.body.CAPTAIN,
      NAME: req.body.NAME,
    };
    const result1 = await Player.findOne({
      TOURNAMENT_ID: request.TOURNAMENT_ID,
      CAPTAIN: request.CAPTAIN,
    });
    if (result1) {
      const result = await Player.updateOne(
        { TOURNAMENT_ID: req.body.TOURNAMENT_ID, CAPTAIN: req.body.CAPTAIN },
        { $pull: { PLAYERS: { NAME: req.body.NAME } } }
      );
      if (result) res.status(200).send("Player Removed");
      else
        res.status(201).send("Looks like you have already removed the player");
    } else {
      res.status(201).send("Incorrect Tournament ID");
    }
  } catch (e) {
    console.log("Error Occured");
    res.status(400).send("Something Went Wrong");
  }
});
BookingRouter.post("/removeSubstitue", async (req, res) => {
  try {
    var request = {
      TOURNAMENT_ID: req.body.TOURNAMENT_ID,
      CAPTAIN: req.body.CAPTAIN,
      NAME: req.body.NAME,
    };
    const result1 = await Player.findOne({
      TOURNAMENT_ID: request.TOURNAMENT_ID,
      CAPTAIN: request.CAPTAIN,
    });
    console.log(result1);
    if (result1) {
      const result = await Player.updateOne(
        { TOURNAMENT_ID: req.body.TOURNAMENT_ID, CAPTAIN: req.body.CAPTAIN },
        { $pull: { SUBSTITUTE: { NAME: req.body.NAME } } }
        );
      console.log(result);
      if (result) res.status(200).send("Substitute Removed");
      else
        res.status(201).send("Looks like you have already removed the Substitute");
    } else {
      res.status(201).send("Incorrect Tournament ID");
    }
  } catch (e) {
    console.log("Error Occured");
    res.status(400).send("Something Went Wrong");
  }
});
BookingRouter.get("/hasTourneyStarted", async (req, res) => {
  try{
    console.log(req.query.TOURNAMENT_ID.split('-')[0]);
    var checkExists = await onlytourneys.findOne({TOURNAMENT_ID : req.query.TOURNAMENT_ID.split('-')[0]});
    console.log(checkExists);
    if(checkExists){
      console.log(checkExists.REGISTRATION_CLOSES_BEFORE);
      if(checkExists.REGISTRATION_CLOSES_BEFORE == 0){
        res.status(200).send("Tournament Has Started. Can't edit Team");
      } else{
        res.status(200).send("false");
      }
    } else{
      console.log("Wrong Tournament Id");
      res.status(200).send("Wrong Tournament Id");
    }
  }catch(e){
    res.status(400).send("Error Occured");
  }
});
module.exports = BookingRouter;
