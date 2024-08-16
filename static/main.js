let ascendingOrder = true; // Default sort order

// Function to fetch and display fixtures
function fetchAndDisplayFixtures(startGw, endGw) {
  fetch(`/fixtures?start_gw=${startGw}&end_gw=${endGw}`)
    .then((response) => response.json())
    .then((data) => {
      let tableBody = document.querySelector("#fixturesTable tbody");
      let tableHeadRow = document.querySelector("#fixturesTable thead tr");

      // Clear previous data
      tableBody.innerHTML = "";
      tableHeadRow.innerHTML =
        "<th class='team'>Team <svg id='sortIcon' xmlns='http://www.w3.org/2000/svg' width='10' height='11' viewBox='0 0 10 11' class='FDRHeadingCell__StyledSortIcon-sc-14k5dps-4 enRKnw'><path d='M1.62955224,0.229701493 C1.81146269,0.0477910448 2.10704478,0.0477910448 2.28895522,0.229701493 L2.28895522,0.229701493 L3.68820896,1.62953731 C3.8701194,1.81144776 3.8701194,2.10702985 3.68820896,2.2889403 C3.59726866,2.37989104 3.47773134,2.42536716 3.35822388,2.42536716 C3.23871642,2.42536716 3.11919104,2.37989104 3.02823881,2.2889403 L3.02823881,2.2889403 L2.42538806,1.68608955 L2.42538806,9.88802985 C2.42538806,10.1457313 2.21667164,10.3544478 1.95897015,10.3544478 C1.70126866,10.3544478 1.49255224,10.1457313 1.49255224,9.88802985 L1.49255224,9.88802985 L1.49255224,1.68608955 L0.889701493,2.28835821 C0.707791045,2.47026866 0.412208955,2.47026866 0.230298507,2.28835821 C0.0483880597,2.10644776 0.0483880597,1.81086567 0.230298507,1.62895522 L0.230298507,1.62895522 Z M9.42164179,8.48880597 C9.67934328,8.48880597 9.8880597,8.69752239 9.8880597,8.95522388 C9.8880597,9.21292537 9.67934328,9.42164179 9.42164179,9.42164179 L9.42164179,9.42164179 L4.75746269,9.42164179 C4.49976119,9.42164179 4.29104478,9.21292537 4.29104478,8.95522388 C4.29104478,8.69752239 4.49976119,8.48880597 4.75746269,8.48880597 Z M8.02238806,6.15671642 C8.28008955,6.15671642 8.48880597,6.36543284 8.48880597,6.62313433 C8.48880597,6.88083582 8.28008955,7.08955224 8.02238806,7.08955224 L8.02238806,7.08955224 L4.75746269,7.08955224 C4.49976119,7.08955224 4.29104478,6.88083582 4.29104478,6.62313433 C4.29104478,6.36543284 4.49976119,6.15671642 4.75746269,6.15671642 L4.75746269,6.15671642 Z M7.08955224,3.82462687 C7.34725373,3.82462687 7.55597015,4.03334328 7.55597015,4.29104478 C7.55597015,4.54874627 7.34725373,4.75746269 7.08955224,4.75746269 L7.08955224,4.75746269 L4.75746269,4.75746269 C4.49976119,4.75746269 4.29104478,4.54874627 4.29104478,4.29104478 C4.29104478,4.03334328 4.49976119,3.82462687 4.75746269,3.82462687 Z'></path></svg></th>";

      // Dynamically generate gameweek columns in the header
      for (let gw = startGw; gw <= endGw; gw++) {
        let th = document.createElement("th");
        th.classList.add("opponent");
        th.innerText = `GW${gw}`;
        tableHeadRow.appendChild(th);
      }

      // Generate rank numbers
      let teams = data.sorted_teams.map((team, index) => ({
        team: team,
        difficulty: data.team_difficulty[team],
        rank: index + 1,
      }));

      // Sort the teams based on the current order
      teams.sort((a, b) =>
        ascendingOrder
          ? a.difficulty - b.difficulty
          : b.difficulty - a.difficulty
      );

      // Populate table body with teams and their fixtures
      teams.forEach((teamObj) => {
        let team = teamObj.team;
        let rank = teamObj.rank;
        let fixtures = data.team_fixtures[team];
        let teamDifficulty = data.team_difficulty[team];

        let row = document.createElement("tr");

        let teamCell = document.createElement("td");
        teamCell.classList.add("team", "team-body-name");

        let teamLogo = document.createElement("img");
        teamLogo.classList.add("team-logo");

        let teamId = data.team_badge_ids[team];
        teamLogo.src = `https://resources.premierleague.com/premierleague/badges/70/t${teamId}.png`;

        let teamText = document.createElement("span");
        teamText.innerText = `${team} (${teamDifficulty})`;

        teamCell.appendChild(teamLogo);
        teamCell.appendChild(teamText);

        row.appendChild(teamCell);

        for (let gw = startGw; gw <= endGw; gw++) {
          let fixtureCell = document.createElement("td");
          let fixture = fixtures.find((f) => f[0] === parseInt(gw));
          fixtureCell.classList.add("opponent", "opponent-abbrv");

          if (fixture) {
            let opponent = fixture[1];
            let isHome = fixture[3];
            let difficulty = fixture[2];

            let location = isHome ? "(H)" : "(A)";
            fixtureCell.innerHTML = `${opponent} ${location}`;

            let bgColor;
            let color;
            switch (difficulty) {
              case 1:
                bgColor = "rgb(55,85,35)";
                color = "black";
                break;
              case 2:
                bgColor = "rgb(1,252,122)";
                color = "black";
                break;
              case 3:
                bgColor = "rgb(231, 231, 231)";
                color = "black";
                break;
              case 4:
                bgColor = "rgb(255, 23, 81)";
                color = "white";
                break;
              case 5:
                bgColor = "rgb(128, 7, 45)";
                color = "white";
                break;
            }

            fixtureCell.style.backgroundColor = bgColor;
            fixtureCell.style.color = color;
          } else {
            fixtureCell.innerHTML = "-";
          }

          row.appendChild(fixtureCell);
        }

        tableBody.appendChild(row);
      });

      let sortIcon = document.querySelector("#sortIcon");
      sortIcon.style.transform = ascendingOrder
        ? "rotate(0deg)"
        : "rotate(180deg)";
      sortIcon.addEventListener("click", () => {
        ascendingOrder = !ascendingOrder;
        fetchAndDisplayFixtures(startGw, endGw);

        sortIcon.style.transform = ascendingOrder
          ? "rotate(0deg)"
          : "rotate(180deg)";
      });
    });
}

const form = document.querySelector("#gameweekForm");

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const newStartGw = parseInt(document.querySelector("#start_gw").value);
  const newEndGw = parseInt(document.querySelector("#end_gw").value);

  if (newEndGw < newStartGw) {
    alert("End Gameweek cannot be less than the Start Gameweek.");
    return;
  }

  fetchAndDisplayFixtures(newStartGw, newEndGw);
});

window.onload = function () {
  fetchAndDisplayFixtures(startGw, endGw);
};
