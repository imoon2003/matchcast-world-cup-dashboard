import {
  fetchMatchCastData as fetchMockMatchCastData,
} from "./mockSportsApi";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5050";

const USE_MOCK_FALLBACK =
  import.meta.env.VITE_USE_MOCK_FALLBACK !== "false";

const LIVE_STATUS_CODES = new Set([
  "1H",
  "HT",
  "2H",
  "ET",
  "BT",
  "P",
  "LIVE",
]);

const FINISHED_STATUS_CODES = new Set([
  "FT",
  "AET",
  "PEN",
]);

const CARD_IMAGES = [
  "/images/stadium-night.jpg",
  "/images/fan-zone.jpg",
  "/images/pitch-aerial.jpg",
  "/images/stadium-lights.jpg",
];

function cleanTag(value = "") {
  return String(value).replace(
    /[^a-zA-Z0-9]/g,
    ""
  );
}



function getTodayDateKey() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map(({ type, value }) => [
      type,
      value,
    ])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function getFixtureDateKey(fixture) {
  if (fixture.date) {
    return fixture.date.slice(0, 10);
  }

  const catalogDate = String(
    fixture.localDate || ""
  ).match(
    /^(\d{2})\/(\d{2})\/(\d{4})/
  );

  if (!catalogDate) {
    return null;
  }

  const [, month, day, year] = catalogDate;

  return `${year}-${month}-${day}`;
}

function getDisplayStatus(fixture) {
  const statusCode = fixture.status?.short;

  if (LIVE_STATUS_CODES.has(statusCode)) {
    return "Live";
  }

  if (FINISHED_STATUS_CODES.has(statusCode)) {
    return "Final";
  }

  return "Upcoming";
}

function formatApiKickoff(dateString) {
  if (!dateString) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
    timeZoneName: "short",
  }).format(new Date(dateString));
}

function formatCatalogKickoff(localDate) {
  const match = String(localDate || "").match(
    /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/
  );

  if (!match) {
    return "Kickoff TBD";
  }

  const [
    ,
    month,
    day,
    year,
    hour,
    minute,
  ] = match;

  /*
   * UTC is used here only to format the supplied
   * venue-local components without shifting them.
   */
  const displayDate = new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute)
    )
  );

  const formatted = new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "UTC",
    }
  ).format(displayDate);

  return `${formatted} venue time`;
}

function getScoreText(fixture, status) {
  const homeGoals = fixture.goals?.home;
  const awayGoals = fixture.goals?.away;

  const hasScore =
    Number.isFinite(homeGoals) &&
    Number.isFinite(awayGoals);

  if (!hasScore) {
    return "Scheduled";
  }

  const score = `${homeGoals}–${awayGoals}`;

  if (status === "Live") {
    return score;
  }

  if (status === "Final") {
    return score;;
  }

  return score;
}

function getMatchProgress(fixture, status) {
  if (status === "Final") {
    return 100;
  }

  if (status === "Live") {
    return Math.min(
      Math.max(
        Number(fixture.status?.elapsed) || 1,
        1
      ),
      99
    );
  }

  return 0;
}

function getPriority(status) {
  if (status === "Live") {
    return "High";
  }

  if (status === "Upcoming") {
    return "Medium";
  }

  return "Low";
}

function normalizeTeamName(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

const ARAB_TEAMS = new Set([
  "algeria",
  "egypt",
  "iraq",
  "jordan",
  "morocco",
  "qatar",
  "saudiarabia",
  "tunisia",
]);

const AFRICAN_TEAMS = new Set([
  "algeria",
  "capeverde",
  "caboverde",
  "drcongo",
  "congodr",
  "democraticrepublicofthecongo",
  "egypt",
  "ghana",
  "ivorycoast",
  "cotedivoire",
  "morocco",
  "senegal",
  "southafrica",
  "tunisia",
]);

function transformFixture(fixture, index) {
  const status = getDisplayStatus(fixture);

  const homeTeam =
    fixture.homeTeam?.name ||
    "To be determined";

  const awayTeam =
    fixture.awayTeam?.name ||
    "To be determined";

  const normalizedHomeTeam =
    normalizeTeamName(homeTeam);

  const normalizedAwayTeam =
    normalizeTeamName(awayTeam);

  const isUSMatch =
    normalizedHomeTeam === "unitedstates" ||
    normalizedAwayTeam === "unitedstates" ||
    fixture.homeTeam?.code === "USA" ||
    fixture.awayTeam?.code === "USA";

  const isArabMatch =
    ARAB_TEAMS.has(normalizedHomeTeam) ||
    ARAB_TEAMS.has(normalizedAwayTeam);

  const isAfricanMatch =
    AFRICAN_TEAMS.has(normalizedHomeTeam) ||
    AFRICAN_TEAMS.has(normalizedAwayTeam);

  const city =
    fixture.venue?.city || "Venue TBD";

  const venue =
    fixture.venue?.name || "Venue TBD";

  const stage =
    fixture.stage ||
    fixture.round ||
    "World Cup 2026";

  const groupLabel = fixture.group
    ? `Group ${fixture.group}`
    : stage;

  const teamCodes = [
    fixture.homeTeam?.code,
    fixture.awayTeam?.code,
  ].filter(Boolean);

  const time = fixture.date
    ? formatApiKickoff(fixture.date)
    : formatCatalogKickoff(
        fixture.localDate
      );

  let description = `${groupLabel} fixture scheduled at ${venue} in ${city}.`;

  if (status === "Live") {
    description = `Live now from ${venue} in ${city}.`;
  }

  if (status === "Final") {
    description = `Final whistle at ${venue} in ${city}.`;
  }

  return {
    id:
      fixture.apiFixtureId ||
      fixture.catalogId ||
      fixture.id,

    title: `${homeTeam} vs ${awayTeam}`,
    teams: `${homeTeam} vs ${awayTeam}`,

    /*
     * Keep this compatible with the existing
     * App.jsx category list for now.
     */
    category: "Matchday",

    city,
    status,

    isUSMatch,
    isAfricanMatch,
    isArabMatch,

    priority: getPriority(status),

    progressValue: getMatchProgress(
      fixture,
      status
    ),

    progressLabel:
      status === "Live"
        ? fixture.status?.elapsed
          ? `${fixture.status.elapsed} min`
          : "Live"
        : status === "Final"
          ? "Full time"
          : "Scheduled",

    progressTitle:
      status === "Live"
        ? "Match Progress"
        : "Match Status",

    showProgressBar:
      status === "Live" ||
      status === "Final",

    scoreLabel: getScoreText(
      fixture,
      status
    ),

    dataLabel: fixture.liveDataAvailable
      ? "API-Football data"
      : "Published schedule",

    image:
      CARD_IMAGES[index % CARD_IMAGES.length],

    imageAlt:
      `${homeTeam} versus ${awayTeam} World Cup match`,

    time,

    coverage: fixture.liveDataAvailable
      ? "Live score, match clock, team information, venue, and API status"
      : "Published schedule, venue, stage, and matchup information",

    tags: [
      "WorldCup2026",
      "Matchday",

      fixture.group
        ? `Group${fixture.group}`
        : cleanTag(stage),

      cleanTag(homeTeam),
      cleanTag(awayTeam),
      cleanTag(city),
      status,

      ...(isUSMatch
        ? ["USMNT", "US Matches"]
        : []),

      ...(isAfricanMatch
        ? ["AfricanFocus", "African Teams"]
        : []),

      ...(isArabMatch
        ? ["ArabFocus", "Arab Teams"]
        : []),
    ],

    storylines: [
      groupLabel,
      `${venue} • ${city}`,
      fixture.liveDataAvailable
        ? fixture.status?.long ||
          "Live data available"
        : "Published tournament schedule",
    ],

    description,

    homeTeamLogo:
      fixture.homeTeam?.flag ||
      fixture.homeTeam?.logo ||
      null,

    awayTeamLogo:
      fixture.awayTeam?.flag ||
      fixture.awayTeam?.logo ||
      null,

    dataSource:
      fixture.dataSource ||
      "Schedule catalog",

    liveDataAvailable:
      Boolean(fixture.liveDataAvailable),

    apiData: fixture,
  };
}

function buildTrendingTopics(matches) {
  const topicCounts = new Map();
  const priorityTopics = [];

  function addPriorityTopic(topic) {
    if (
      topic &&
      !priorityTopics.includes(topic)
    ) {
      priorityTopics.push(topic);
    }
  }

  function countTopic(topic) {
    if (!topic) {
      return;
    }

    topicCounts.set(
      topic,
      (topicCounts.get(topic) || 0) + 1
    );
  }

  if (
    matches.some(
      (match) => match.status === "Live"
    )
  ) {
    addPriorityTopic("Live");
  }

  if (
    matches.some((match) =>
      /(^|\s)USA(\s|$)/i.test(
        `${match.title} ${match.teams}`
      )
    )
  ) {
    addPriorityTopic("USMNT");
  }

  matches.forEach((match) => {
    const groupTag =
      match.tags?.find((tag) =>
        /^Group[A-L]$/.test(tag)
      );

    countTopic(groupTag);

    countTopic(
      cleanTag(
        match.apiData?.homeTeam?.name
      )
    );

    countTopic(
      cleanTag(
        match.apiData?.awayTeam?.name
      )
    );
  });

  const rankedTopics = Array.from(
    topicCounts.entries()
  )
    .sort((a, b) => {
      const countDifference = b[1] - a[1];

      if (countDifference !== 0) {
        return countDifference;
      }

      return a[0].localeCompare(b[0]);
    })
    .map(([topic]) => topic);

  return Array.from(
    new Set([
      ...priorityTopics,
      ...rankedTopics,
    ])
  )
    .slice(0, 8)
    .map((topic) => `#${topic}`);
}

function sortDashboardMatches(
  firstMatch,
  secondMatch
) {
  const today = getTodayDateKey();

  function getMatchBucket(match) {
    const fixtureDate = getFixtureDateKey(
      match.apiData
    );

    const isToday = fixtureDate === today;

    if (
      isToday &&
      match.status === "Live"
    ) {
      return 0;
    }

    if (
      isToday &&
      match.status === "Final"
    ) {
      return 1;
    }

    if (
      isToday &&
      match.status === "Upcoming"
    ) {
      return 2;
    }

    if (match.status === "Upcoming") {
      return 3;
    }

    if (match.status === "Final") {
      return 4;
    }

    return 5;
  }

  const firstBucket =
    getMatchBucket(firstMatch);

  const secondBucket =
    getMatchBucket(secondMatch);

  if (firstBucket !== secondBucket) {
    return firstBucket - secondBucket;
  }

  const firstTimestamp =
    firstMatch.apiData?.timestamp;

  const secondTimestamp =
    secondMatch.apiData?.timestamp;

  if (
    Number.isFinite(firstTimestamp) &&
    Number.isFinite(secondTimestamp)
  ) {
    return firstTimestamp - secondTimestamp;
  }

  const firstDate =
    getFixtureDateKey(firstMatch.apiData) ||
    "9999-12-31";

  const secondDate =
    getFixtureDateKey(secondMatch.apiData) ||
    "9999-12-31";

  if (firstDate !== secondDate) {
    return firstDate.localeCompare(
      secondDate
    );
  }

  return (
    Number(firstMatch.apiData?.catalogId) -
    Number(secondMatch.apiData?.catalogId)
  );
}

async function fetchRealMatchCastData() {
  const response = await fetch(
    `${API_BASE_URL}/api/world-cup/schedule?overlay=today`
  );

  if (!response.ok) {
    let message =
      `MatchCast API returned HTTP ${response.status}.`;

    try {
      const errorPayload =
        await response.json();

      if (errorPayload.message) {
        message = errorPayload.message;
      }
    } catch {
      // Keep the HTTP status message.
    }

    throw new Error(message);
  }

  const payload = await response.json();

  if (
    !payload.success ||
    !Array.isArray(payload.data)
  ) {
    throw new Error(
      "MatchCast API returned an invalid schedule response."
    );
  }

  const today = getTodayDateKey();

  /*
   * Prevent old catalog matches from appearing as
   * upcoming when the Free API plan cannot backfill
   * results older than yesterday.
   */
  const relevantFixtures =
    payload.data.filter((fixture) => {
      const fixtureDate =
        getFixtureDateKey(fixture);

      return (
        fixture.liveDataAvailable ||
        (fixtureDate &&
          fixtureDate >= today)
      );
    });

  const transformedMatches =
    relevantFixtures.map(
      transformFixture
    );

  const dashboardMatches =
    transformedMatches
      .sort(sortDashboardMatches)
      .slice(0, 12);

  return {
    matches: dashboardMatches,

    trendingTopics:
      buildTrendingTopics(
        dashboardMatches
      ),

    lastUpdated:
      payload.overlay?.fetchedAt ||
      new Date().toISOString(),

    source: payload.source,

    cached:
      payload.overlay?.cached ?? false,

    totalScheduleMatches:
      payload.metadata?.totalMatches ??
      payload.data.length,
  };
}

export async function fetchMatchCastData() {
  try {
    return await fetchRealMatchCastData();
  } catch (error) {
    console.error(
      "Real MatchCast API request failed:",
      error
    );

    if (!USE_MOCK_FALLBACK) {
      throw error;
    }

    console.warn(
      "Using MatchCast mock fallback."
    );

    const fallback =
      await fetchMockMatchCastData();

    return {
      ...fallback,
      source: "Mock fallback",
      cached: false,
    };
  }
}

export async function fetchFanEvents(
  filters = {}
) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        params.set(key, String(value));
      }
    }
  );

  const queryString = params.toString();

  const response = await fetch(
    `${API_BASE_URL}/api/fan-events${
      queryString ? `?${queryString}` : ""
    }`
  );

  if (!response.ok) {
    throw new Error(
      `Fan-events API returned HTTP ${response.status}.`
    );
  }

  const payload = await response.json();

  if (
    !payload.success ||
    !Array.isArray(payload.data)
  ) {
    throw new Error(
      "Fan-events API returned an invalid response."
    );
  }

  return {
    events: payload.data,
    metadata: payload.metadata,
    filters: payload.filters,
  };
}