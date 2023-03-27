ScoringRouter.post("/getScoreCard", async (req, res) => {
    var checkExists = {};
    try {
      checkExists = await score.findOne({
        TOURNAMENT_ID: req.body.TOURNAMENT_ID,
      });
      if (checkExists) {
        req.body.MATCH_ID -= 1;
  
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
            req.body.MATCH_ID
          ].TEAMS[1].TEAM_NAME;
        returnVal.scoreCard[0].TeamTotal =
          checkExists.MATCHES[
            req.body.MATCH_ID
          ].INNING[0].BATTING_DETAILS.SCORE;
        returnVal.scoreCard[0].TeamWickets =
          checkExists.MATCHES[req.body.MATCH_ID].INNING[0].WICKETS;
        returnVal.scoreCard[0].TeamOvers =
          checkExists.MATCHES[
            req.body.MATCH_ID
          ].INNING[0].OVERS_DONE;
  
        var extraOvers =
          checkExists.MATCHES[
            req.body.MATCH_ID
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
            req.body.MATCH_ID
          ].TEAMS[0].TEAM_NAME;
        returnVal.scoreCard[1].TeamTotal =
          checkExists.MATCHES[
            req.body.MATCH_ID
          ].INNING[1].BATTING_DETAILS.SCORE;
        returnVal.scoreCard[1].TeamWickets =
          checkExists.MATCHES[req.body.MATCH_ID].INNING[1].WICKETS;
        returnVal.scoreCard[1].TeamOvers =
          checkExists.MATCHES[
            req.body.MATCH_ID
          ].INNING[1].OVERS_DONE;
  
        var extraOvers =
          checkExists.MATCHES[
            req.body.MATCH_ID
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
          checkExists.MATCHES[req.body.MATCH_ID].INNING[0]
            .BATTING_DETAILS.SCORE;
        var secondInningScore =
          checkExists.MATCHES[req.body.MATCH_ID].INNING[1]
            .BATTING_DETAILS.SCORE;
  
        if (firstInningScore > secondInningScore) {
          returnVal.WinnerTeam =
            checkExists.MATCHES[
              req.body.MATCH_ID
            ].TEAMS[1].TEAM_NAME;
        } else {
          returnVal.WinnerTeam =
            checkExists.MATCHES[
              req.body.MATCH_ID
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