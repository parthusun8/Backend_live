const express = require("express");
const mongoose = require("mongoose");
const USER = require("../models/user.mongo");
const USERProfile = require("../models/userprofile.model");
const tournamentModel = require("../models/tournament.model");
const onlytournamentModel = require("../models/tourney.mongo");
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
    const result = await Player.findOne({
      TOURNAMENT_ID: tournament_id,
      CAPTAIN: captain_id,
    });
    console.log(result);
    if (result) {
      const result1 = {
        TOURNAMENT_ID: result.TOURNAMENT_ID,
        CAPTAIN: captain_id,
        PLAYERS: result.PLAYERS,
        SUBSTITUTE: result.SUBSTITUTE,
      };
      console.log(result1);
      res.status(200).send(result1);
    } else {
      res.status(201).send("Incorrect Tournament ID or User Id");
    }
  } catch (e) {
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
      Player.updateOne(
        { TOURNAMENT_ID: req.body.TOURNAMENT_ID, CAPTAIN: req.body.CAPTAIN },
        { $set: { TEAM_NAME: req.body.NAME } }
      );
      res.status(200).send("Team Name Updated");
    } else {
      res.status(201).send("Incorrect Tournament ID");
    }
  } catch (e) {
    console.log("Error Occured");
    res.status(400).send("Something Went Wrong");
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
    res.status(400).send("Something Went Wrong");
  }
});

BookingRouter.post("/addSubstitutePlayers", async (req, res) => {
  try {
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

BookingRouter.post("/removePlayer", async (req, res) => {});
BookingRouter.post("/removeSubstitute", async (req, res) => {});
BookingRouter.post("/submitTeam", async (req, res) => {});
module.exports = BookingRouter;
