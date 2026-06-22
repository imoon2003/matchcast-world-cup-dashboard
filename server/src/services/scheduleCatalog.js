import fs from "node:fs";

const matchesFile = new URL(
  "../data/worldCupMatches.json",
  import.meta.url
);

const teamsFile = new URL(
  "../data/worldCupTeams.json",
  import.meta.url
);

const stadiumsFile = new URL(
  "../data/worldCupStadiums.json",
  import.meta.url
);

function readJsonFile(fileUrl) {
  return JSON.parse(
    fs.readFileSync(fileUrl, "utf8")
  );
}

const rawMatches = readJsonFile(matchesFile);
const rawTeams = readJsonFile(teamsFile);
const rawStadiums = readJsonFile(stadiumsFile);

const teamById = new Map(
  rawTeams.map((team) => [
    String(team.id),
    team,
  ])
);

const stadiumById = new Map(
  rawStadiums.map((stadium) => [
    String(stadium.id),
    stadium,
  ])
);

function normalizeStage(type) {
  const stages = {
    group: "Group Stage",
    r32: "Round of 32",
    r16: "Round of 16",
    qf: "Quarterfinal",
    sf: "Semifinal",
    third: "Third Place",
    final: "Final",
  };

  return stages[type] || type || "Unknown";
}

function resolveTeam(match, side) {
  const teamId =
    match[`${side}_team_id`];

  const placeholder =
    match[`${side}_team_label`];

  const team = teamById.get(
    String(teamId)
  );

  if (team) {
    return {
      id: team.id,
      name: team.name_en,
      code: team.fifa_code || null,
      flag: team.flag || null,
      group: team.groups || null,
      confirmed: true,
    };
  }

  return {
    id: null,
    name: placeholder || "To be determined",
    code: null,
    flag: null,
    group: null,
    confirmed: false,
  };
}

function resolveVenue(stadiumId) {
  const stadium = stadiumById.get(
    String(stadiumId)
  );

  if (!stadium) {
    return {
      id: null,
      name: "Venue TBD",
      fifaName: "Venue TBD",
      city: "City TBD",
      country: null,
      capacity: null,
    };
  }

  return {
    id: stadium.id,
    name: stadium.name_en,
    fifaName:
      stadium.fifa_name ||
      stadium.name_en,
    city: stadium.city_en,
    country: stadium.country_en,
    capacity: stadium.capacity,
  };
}

function getCatalogStatus(match) {
  if (
    String(match.finished).toUpperCase() ===
    "TRUE"
  ) {
    return "Final";
  }

  if (
    match.time_elapsed &&
    match.time_elapsed !== "notstarted"
  ) {
    return "Live";
  }

  return "Scheduled";
}

function normalizeCatalogMatch(match) {
  return {
    catalogId: Number(match.id),

    stageCode: match.type,
    stage: normalizeStage(match.type),

    group:
      match.group &&
      match.group !== "null"
        ? match.group
        : null,

    matchday: Number(match.matchday) || null,

    // This value represents the venue's local date/time.
    localDate: match.local_date || null,
    timeLabel: "Venue local time",

    homeTeam: resolveTeam(match, "home"),
    awayTeam: resolveTeam(match, "away"),

    venue: resolveVenue(match.stadium_id),

    status: {
      long: getCatalogStatus(match),
      short:
        getCatalogStatus(match) === "Final"
          ? "FT"
          : getCatalogStatus(match) === "Live"
            ? "LIVE"
            : "NS",
      elapsed:
        match.time_elapsed === "notstarted"
          ? null
          : Number(match.time_elapsed) || null,
    },

    goals: {
      home:
        getCatalogStatus(match) ===
        "Scheduled"
          ? null
          : Number(match.home_score),
      away:
        getCatalogStatus(match) ===
        "Scheduled"
          ? null
          : Number(match.away_score),
    },

    dataSource: "Schedule catalog",
    liveDataAvailable: false,
  };
}

const normalizedSchedule = rawMatches
  .map(normalizeCatalogMatch)
  .sort(
    (firstMatch, secondMatch) =>
      firstMatch.catalogId -
      secondMatch.catalogId
  );

export function getScheduleCatalog({
  stage,
  group,
} = {}) {
  let results = [...normalizedSchedule];

  if (stage) {
    const normalizedStage =
      stage.toLowerCase();

    results = results.filter(
      (match) =>
        match.stageCode.toLowerCase() ===
          normalizedStage ||
        match.stage.toLowerCase() ===
          normalizedStage
    );
  }

  if (group) {
    results = results.filter(
      (match) =>
        match.group?.toUpperCase() ===
        group.toUpperCase()
    );
  }

  return results;
}

export function getScheduleMetadata() {
  return {
    totalMatches: normalizedSchedule.length,
    totalTeams: rawTeams.length,
    totalStadiums: rawStadiums.length,
    groupStageMatches:
      normalizedSchedule.filter(
        (match) =>
          match.stageCode === "group"
      ).length,
    knockoutMatches:
      normalizedSchedule.filter(
        (match) =>
          match.stageCode !== "group"
      ).length,
  };
}

function normalizeTeamName(name) {
  const normalized = String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  const aliases = {
    usa: "unitedstates",
    unitedstatesofamerica: "unitedstates",

    turkiye: "turkey",

    drcongo: "congodr",
    democraticrepublicofthecongo: "congodr",
    congodemocraticrepublic: "congodr",

    korearepublic: "southkorea",

    cotedivoire: "ivorycoast",

    czechrepublic: "czechia",

    bosniaherzegovina: "bosniaandherzegovina",
  };

  return aliases[normalized] || normalized;
}

function createFixtureKey(homeTeamName, awayTeamName) {
  return [
    normalizeTeamName(homeTeamName),
    normalizeTeamName(awayTeamName),
  ].join("::");
}

export function mergeScheduleWithApiFixtures(
  catalogMatches,
  apiFixtures
) {
  const fixtureByTeams = new Map();

  apiFixtures.forEach((fixture) => {
    const key = createFixtureKey(
      fixture.homeTeam?.name,
      fixture.awayTeam?.name
    );

    fixtureByTeams.set(key, fixture);
  });

  return catalogMatches.map((catalogMatch) => {
    const key = createFixtureKey(
      catalogMatch.homeTeam?.name,
      catalogMatch.awayTeam?.name
    );

    const apiFixture = fixtureByTeams.get(key);

    if (!apiFixture) {
      return catalogMatch;
    }

    return {
      ...catalogMatch,

      apiFixtureId: apiFixture.id,

      date: apiFixture.date,
      timestamp: apiFixture.timestamp,
      timezone: apiFixture.timezone,

      homeTeam: {
        ...catalogMatch.homeTeam,
        apiId: apiFixture.homeTeam?.id || null,
        name:
          apiFixture.homeTeam?.name ||
          catalogMatch.homeTeam.name,
        logo: apiFixture.homeTeam?.logo || null,
        winner:
          apiFixture.homeTeam?.winner ?? null,
      },

      awayTeam: {
        ...catalogMatch.awayTeam,
        apiId: apiFixture.awayTeam?.id || null,
        name:
          apiFixture.awayTeam?.name ||
          catalogMatch.awayTeam.name,
        logo: apiFixture.awayTeam?.logo || null,
        winner:
          apiFixture.awayTeam?.winner ?? null,
      },

      venue: {
        ...catalogMatch.venue,
        apiId: apiFixture.venue?.id || null,
        name:
          apiFixture.venue?.name ||
          catalogMatch.venue.name,
        city:
          apiFixture.venue?.city ||
          catalogMatch.venue.city,
      },

      status: apiFixture.status,
      goals: apiFixture.goals,
      score: apiFixture.score,

      dataSource:
        "API-Football + schedule catalog",

      liveDataAvailable: true,
    };
  });
}