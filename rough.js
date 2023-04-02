let secondInningsStrikerDetails = data["SECOND_INNING"]["STRIKER"];
$(".secondInningsBatsmenScoreDetails").append(
  `<tr>
                <td>${secondInningsStrikerDetails.NAME}<br><strong>${
    secondInningsStrikerDetails.OUT ? "Out" : "Not out"
  }</strong></td>
                <td>${secondInningsStrikerDetails.SCORE}</td>
                <td>${secondInningsStrikerDetails.BALLS_USED}</td>
                <td>${secondInningsStrikerDetails.FOURS}</td>
                <td>${secondInningsStrikerDetails.SIX}</td>
                <td>${secondInningsStrikerDetails.sr}</td>
            </tr>`
);
let secondInningsNonStrikerDetails = data["SECOND_INNING"]["NON_STRIKER"];
$(".secondInningsBatsmenScoreDetails").append(
  `<tr>
                <td>${secondInningsNonStrikerDetails.NAME}<br><strong>${
    secondInningsNonStrikerDetails.OUT ? "Out" : "Not out"
  }</strong></td>
                <td>${secondInningsNonStrikerDetails.SCORE}</td>
                <td>${secondInningsNonStrikerDetails.BALLS_USED}</td>
                <td>${secondInningsNonStrikerDetails.FOURS}</td>
                <td>${secondInningsNonStrikerDetails.SIX}</td>
                <td>${secondInningsNonStrikerDetails.sr}</td>
            </tr>`
);
for (var i = 0; i < data["SECOND_INNING"]["OUTPLAYERS"].length; i++) {
  $(".secondInningsBatsmenScoreDetails").append(
    `<tr>
                    <td>${
                      data["SECOND_INNING"]["OUTPLAYERS"][i].NAME
                    }<br><strong>Out</strong></td>
                    <td>${data["SECOND_INNING"]["OUTPLAYERS"][i].SCORE}</td>
                    <td>${data["SECOND_INNING"]["OUTPLAYERS"][i].BALLS_USED}</td>
                    <td>${data["SECOND_INNING"]["OUTPLAYERS"][i].FOURS}</td>
                    <td>${data["SECOND_INNING"]["OUTPLAYERS"][i].SIX}</td>
                    <td>${data["SECOND_INNING"]["OUTPLAYERS"][i].sr}</td>
                </tr>`
  );
}
$(".secondInningsBowlerDetails").append(
  `
            <tr>
                <td>${data["SECOND_INNING"]["BALLER"].NAME}</td>
                <td>${data["SECOND_INNING"]["BALLER"].OVERS}</td>
                <td>${data["SECOND_INNING"]["BALLER"].RUNS}</td>
                <td>${data["SECOND_INNING"]["BALLER"].WICKETS}</td>
                <td>${data["SECOND_INNING"]["BALLER"].ECON}</td>
            `
);
for (var i = 0; i < data["SECOND_INNING"]["BALLER"].length; i++) {
  $(".secondInningsBowlerPerformance").append(
    `
                <tr>
                    <td>${data["SECOND_INNING"]["BALLER"][i].NAME}</td>
                    <td>${data["SECOND_INNING"]["BALLER"][i].OVERS}</td>
                    <td>${data["SECOND_INNING"]["BALLER"][i].RUNS}</td>
                    <td>${data["SECOND_INNING"]["BALLER"][i].WICKETS}</td>
                    <td>${data["SECOND_INNING"]["BALLER"][i].ECON}</td>
                </tr>
                `
  );
}
