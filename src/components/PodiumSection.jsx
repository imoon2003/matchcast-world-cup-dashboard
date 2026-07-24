function normalizeStage(match) {
  return String(
    match?.apiData?.stageCode ||
      match?.apiData?.stage ||
      match?.apiData?.round ||
      ""
  )
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function findPlacementMatches(matches = []) {
  const finalMatch = matches.find((match) => {
    const stage = normalizeStage(match);

    return (
      stage === "final" ||
      stage.includes("championshipfinal")
    );
  });

  const thirdPlaceMatch = matches.find((match) => {
    const stage = normalizeStage(match);

    return (
      stage === "third" ||
      stage.includes("thirdplace")
    );
  });

  return {
    finalMatch,
    thirdPlaceMatch,
  };
}

function getMatchPlacements(match) {
  if (!match?.apiData) {
    return {
      winner: null,
      loser: null,
    };
  }

  const homeTeam = match.apiData.homeTeam;
  const awayTeam = match.apiData.awayTeam;

  const homeGoals = match.apiData.goals?.home;
  const awayGoals = match.apiData.goals?.away;

  if (homeTeam?.winner === true) {
    return {
      winner: homeTeam,
      loser: awayTeam,
    };
  }

  if (awayTeam?.winner === true) {
    return {
      winner: awayTeam,
      loser: homeTeam,
    };
  }

  if (
    Number.isFinite(homeGoals) &&
    Number.isFinite(awayGoals)
  ) {
    if (homeGoals > awayGoals) {
      return {
        winner: homeTeam,
        loser: awayTeam,
      };
    }

    if (awayGoals > homeGoals) {
      return {
        winner: awayTeam,
        loser: homeTeam,
      };
    }
  }

  return {
    winner: null,
    loser: null,
  };
}

function TeamLogo({
  team,
  champion = false,
}) {
  const logo = team?.flag || team?.logo;

  return (
    <div
      className={
        champion
          ? "podium-logo-frame podium-logo-frame--champion"
          : "podium-logo-frame"
      }
    >
      {logo ? (
        <img
          className="podium-team-logo"
          src={logo}
          alt={`${team?.name || "Team"} flag`}
        />
      ) : (
        <span
          className="podium-team-placeholder"
          aria-hidden="true"
        >
          ⚽
        </span>
      )}
    </div>
  );
}

function PlacementCard({
  placement,
  medal,
  team,
}) {
  return (
    <article className="placement-card">
      <div className="placement-top">
        <span className="placement-medal">
          {medal}
        </span>

        <TeamLogo team={team} />
      </div>

      <div className="placement-copy">
        <span className="placement-label">
          {placement}
        </span>

        <h3 className="placement-country">
          {team?.name || "Result unavailable"}
        </h3>
      </div>
    </article>
  );
}

function PodiumSection({
  matches = [],
}) {
  const {
    finalMatch,
    thirdPlaceMatch,
  } = findPlacementMatches(matches);

  const finalPlacements =
    getMatchPlacements(finalMatch);

  const thirdPlacePlacements =
    getMatchPlacements(thirdPlaceMatch);

  const champion = finalPlacements.winner;
  const runnerUp = finalPlacements.loser;
  const thirdPlace =
    thirdPlacePlacements.winner;
  const fourthPlace =
    thirdPlacePlacements.loser;

  if (!finalMatch && !thirdPlaceMatch) {
    return null;
  }

  return (
    <section
      className="podium-section"
      aria-labelledby="podium-title"
    >
      <article className="champion-card">
        <p className="champion-label">
          World Champions
        </p>

        <div className="champion-mainline">
          <div className="champion-identity">
            <span
              className="champion-trophy"
              aria-hidden="true"
            >
              🏆
            </span>

            <h2
              id="podium-title"
              className="champion-country"
            >
              {champion?.name ||
                "Champion unavailable"}
            </h2>
          </div>

          <TeamLogo
            team={champion}
            champion
          />
        </div>
      </article>

      <div className="podium-placements">
        <PlacementCard
          placement="Runner-up"
          medal="🥈"
          team={runnerUp}
        />

        <PlacementCard
          placement="Third Place"
          medal="🥉"
          team={thirdPlace}
        />

        <PlacementCard
          placement="Fourth Place"
          medal="4️⃣"
          team={fourthPlace}
        />
      </div>
    </section>
  );
}

export default PodiumSection;