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
      match.type === "group" &&
      match.group &&
      match.group !== "null" &&
      /^[A-L]$/i.test(String(match.group))
        ? String(match.group).toUpperCase()
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

function formatDateKey(date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function getCatalogDateKey(match) {
  if (!match.localDate) {
    return null;
  }

  const [datePart] = match.localDate.split(" ");
  const [month, day, year] = datePart.split("/");

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function getApiDateKey(fixture) {
  if (!fixture.date) {
    return null;
  }

  return formatDateKey(new Date(fixture.date));
}

function applyApiFixtureToCatalogMatch(catalogMatch, apiFixture) {
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
      code:
        apiFixture.homeTeam?.code ||
        catalogMatch.homeTeam.code,
      logo:
        apiFixture.homeTeam?.logo ||
        apiFixture.homeTeam?.flag ||
        null,
      flag:
        apiFixture.homeTeam?.flag ||
        apiFixture.homeTeam?.logo ||
        catalogMatch.homeTeam.flag ||
        null,
      winner:
        apiFixture.homeTeam?.winner ?? null,
      confirmed: true,
    },

    awayTeam: {
      ...catalogMatch.awayTeam,
      apiId: apiFixture.awayTeam?.id || null,
      name:
        apiFixture.awayTeam?.name ||
        catalogMatch.awayTeam.name,
      code:
        apiFixture.awayTeam?.code ||
        catalogMatch.awayTeam.code,
      logo:
        apiFixture.awayTeam?.logo ||
        apiFixture.awayTeam?.flag ||
        null,
      flag:
        apiFixture.awayTeam?.flag ||
        apiFixture.awayTeam?.logo ||
        catalogMatch.awayTeam.flag ||
        null,
      winner:
        apiFixture.awayTeam?.winner ?? null,
      confirmed: true,
    },

    // Keep catalog venue/city for fan festival matching.
    venue: {
      ...catalogMatch.venue,
    },

    status: apiFixture.status,
    goals: apiFixture.goals,
    score: apiFixture.score,

    dataSource:
      "football-data.org + schedule catalog",

    liveDataAvailable: true,
  };
}

export function mergeScheduleWithApiFixtures(
  catalogMatches,
  apiFixtures
) {
  const fixtureByTeams = new Map();
  const usedFixtureIds = new Set();

  apiFixtures.forEach((fixture) => {
    const key = createFixtureKey(
      fixture.homeTeam?.name,
      fixture.awayTeam?.name
    );

    fixtureByTeams.set(key, fixture);
  });

  return catalogMatches.map((catalogMatch) => {
    const teamKey = createFixtureKey(
      catalogMatch.homeTeam?.name,
      catalogMatch.awayTeam?.name
    );

    let apiFixture = fixtureByTeams.get(teamKey);

    // Knockout catalog rows often say "Winner Match..." instead of real teams.
    // If team matching fails, fall back to stage + date.
    if (!apiFixture) {
      const catalogDateKey = getCatalogDateKey(catalogMatch);

      apiFixture = apiFixtures.find((fixture) => {
        if (usedFixtureIds.has(fixture.id)) {
          return false;
        }

        return (
          fixture.stageCode === catalogMatch.stageCode &&
          getApiDateKey(fixture) === catalogDateKey
        );
      });
    }

    if (!apiFixture) {
      return catalogMatch;
    }

    usedFixtureIds.add(apiFixture.id);

    return applyApiFixtureToCatalogMatch(
      catalogMatch,
      apiFixture
    );
  });
}
