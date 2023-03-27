ScoringRouter.post("/changeStrike", async (req, res) => {
    var checkExists = {};
    try {
      checkExists = await score.findOne({
        TOURNAMENT_ID: req.body.TOURNAMENT_ID,
      });
      if (checkExists) {
        var first =
          checkExists.MATCHES[req.body.MATCH_ID].FIRST_INNING_DONE;
        var inning_no = 0;
        if (first) inning_no = 1;
  
        await score.updateOne(
          { TOURNAMENT_ID: req.body.TOURNAMENT_ID },
          {
            $set: {
              [`MATCHES.${req.body.MATCH_ID}.INNING.${inning_no}.BATTING_DETAILS.STRIKER`]:
                checkExists.MATCHES[req.body.MATCH_ID].INNING[
                  inning_no
                ].BATTING_DETAILS.NON_STRIKER,
  
              [`MATCHES.${req.body.MATCH_ID}.INNING.${inning_no}.BATTING_DETAILS.NON_STRIKER`]:
                checkExists.MATCHES[req.body.MATCH_ID].INNING[
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