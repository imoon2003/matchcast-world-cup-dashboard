import {
  ARCHIVE_METADATA,
  FINAL_TOURNAMENT_FIXTURES,
} from "../data/finalTournamentData.js";

import { FAN_EVENTS } from "../data/fanEvents.js";

const DATA_MODE =
  import.meta.env.VITE_DATA_MODE || "static";

const IS_STATIC_MODE =
  DATA_MODE === "static";

const ARCHIVE_FAN_SIGNALS = [98, 94, 95, 95, 91, 90, 90, 89, 86, 87, 88, 86];

const CARD_IMAGES = [
  "/images/stadium-night.jpg",
  "/images/fan-zone.jpg",
  "/images/pitch-aerial.jpg",
  "/images/stadium-lights.jpg",
];

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

function cleanTag(value = "") {
  return String(value).replace(/[^a-zA-Z0-9]/g, "");
}

function normalizeTeamName(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function getFanFestivalCity(city) {
  const aliases = {
    "Boston (Foxborough)": "Boston",
    "Los Angeles (Inglewood)": "Los Angeles",
    "Miami (Miami Gardens)": "Miami",
    "Dallas (Arlington, Texas)": "Dallas",
    "New York/New Jersey (East Rutherford)": "New York",
    "San Francisco Bay Area (Santa Clara)": "San Francisco Bay Area",
  };

  return aliases[city] || String(city || "").replace(/\s*\([^)]*\)/g, "").trim();
}

function formatKickoff(dateString) {
  if (!dateString) {
    return "Tournament complete";
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

function getScoreText(fixture) {
  const homeGoals = fixture.goals?.home;
  const awayGoals = fixture.goals?.away;

  if (!Number.isFinite(homeGoals) || !Number.isFinite(awayGoals)) {
    return "Result unavailable";
  }

  const baseScore = `${homeGoals}–${awayGoals}`;
  const penalties = fixture.score?.penalties;

  if (
    Number.isFinite(penalties?.home) &&
    Number.isFinite(penalties?.away)
  ) {
    return `${baseScore} (${penalties.home}–${penalties.away} pens)`;
  }

  return baseScore;
}

function transformFixture(fixture, index) {
  const homeTeam = fixture.homeTeam?.name || "To be determined";
  const awayTeam = fixture.awayTeam?.name || "To be determined";
  const normalizedHome = normalizeTeamName(homeTeam);
  const normalizedAway = normalizeTeamName(awayTeam);
  const city = fixture.venue?.city || "Venue TBD";
  const venue = fixture.venue?.name || "Venue TBD";
  const stage = fixture.stage || fixture.round || "World Cup 2026";

  const isUSMatch =
    normalizedHome === "unitedstates" ||
    normalizedAway === "unitedstates" ||
    fixture.homeTeam?.code === "USA" ||
    fixture.awayTeam?.code === "USA";

  const isArabMatch =
    ARAB_TEAMS.has(normalizedHome) || ARAB_TEAMS.has(normalizedAway);

  const isAfricanMatch =
    AFRICAN_TEAMS.has(normalizedHome) ||
    AFRICAN_TEAMS.has(normalizedAway);

  return {
    id: fixture.apiFixtureId || fixture.catalogId || fixture.id,
    title: `${homeTeam} vs ${awayTeam}`,
    teams: `${homeTeam} vs ${awayTeam}`,
    category: "Matchday",
    city,
    fanFestivalCity: getFanFestivalCity(city),
    status: "Final",
    isUSMatch,
    isAfricanMatch,
    isArabMatch,
    priority:
      ["final", "third", "sf"].includes(fixture.stageCode)
        ? "High"
        : fixture.stageCode === "qf"
          ? "Medium"
          : "Low",
    fanScore: ARCHIVE_FAN_SIGNALS[index] ?? 85,
    viewers: "Archived result",
    progressValue: 100,
    progressLabel: "Full time",
    progressTitle: "Match Status",
    showProgressBar: true,
    scoreLabel: getScoreText(fixture),
    dataLabel: "Archived final result",
    image: CARD_IMAGES[index % CARD_IMAGES.length],
    imageAlt: `${homeTeam} versus ${awayTeam} World Cup match`,
    time: formatKickoff(fixture.date),
    coverage: "Final score, team information, venue, stage, and archived tournament result",
    tags: [
      "WorldCup2026",
      "Matchday",
      cleanTag(stage),
      cleanTag(homeTeam),
      cleanTag(awayTeam),
      cleanTag(city),
      "Final",
      ...(isUSMatch ? ["USMNT", "US Matches"] : []),
      ...(isAfricanMatch ? ["AfricanFocus", "African Teams"] : []),
      ...(isArabMatch ? ["ArabFocus", "Arab Teams"] : []),
    ],
    storylines: [
      stage,
      `${venue} • ${city}`,
      fixture.status?.long || "Archived final result",
    ],
    description: `Final result from ${venue} in ${city}.`,
    homeTeamLogo: fixture.homeTeam?.flag || fixture.homeTeam?.logo || null,
    awayTeamLogo: fixture.awayTeam?.flag || fixture.awayTeam?.logo || null,
    dataSource: fixture.dataSource || ARCHIVE_METADATA.source,
    liveDataAvailable: false,
    archived: true,
    apiData: fixture,
  };
}

function buildTrendingTopics(matches) {
  const counts = new Map();

  matches.forEach((match) => {
    [
      cleanTag(match.apiData?.stage),
      cleanTag(match.apiData?.homeTeam?.name),
      cleanTag(match.apiData?.awayTeam?.name),
    ]
      .filter(Boolean)
      .forEach((topic) => counts.set(topic, (counts.get(topic) || 0) + 1));
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8)
    .map(([topic]) => `#${topic}`);
}

function getArchivedDashboardData() {
  const matches = FINAL_TOURNAMENT_FIXTURES
    .map(transformFixture)
    .sort((a, b) => {
      const firstDate = a.apiData?.date || "";
      const secondDate = b.apiData?.date || "";
      return secondDate.localeCompare(firstDate);
    })
    .slice(0, 12);

  return {
    matches,
    trendingTopics: buildTrendingTopics(matches),
    lastUpdated: ARCHIVE_METADATA.archivedAt,
    source: ARCHIVE_METADATA.source,
    cached: true,
    archived: true,
    totalScheduleMatches: ARCHIVE_METADATA.totalMatches,
  };
}

export async function fetchMatchCastData() {
  if (IS_STATIC_MODE) {
    return getArchivedDashboardData();
  }

  const {
    fetchMatchCastData: fetchLiveMatchCastData,
  } = await import("./liveMatchCastApi.js");

  return fetchLiveMatchCastData();
}

function normalizeFilterValue(value) {
  return String(value || "").trim().toLowerCase();
}

function getCitySearchValues(city) {
  const normalized = normalizeFilterValue(city);
  const aliases = {
    philadelphia: ["philly"],
    philly: ["philadelphia"],
    "east rutherford": ["new york", "bronx", "new jersey"],
    "new york/new jersey": ["new york", "bronx", "new jersey"],
    "new york/new jersey (east rutherford)": ["new york", "bronx", "new jersey"],
    "miami gardens": ["miami"],
    "miami (miami gardens)": ["miami", "miami gardens"],
    inglewood: ["los angeles"],
    "los angeles (inglewood)": ["los angeles", "inglewood"],
    foxborough: ["boston"],
    "boston (foxborough)": ["boston", "foxborough"],
    arlington: ["dallas"],
    "dallas (arlington, texas)": ["dallas", "arlington"],
    "santa clara": ["san francisco bay area", "san francisco", "san jose"],
    "san francisco bay area": ["santa clara", "san francisco", "san jose", "oakland"],
    seattle: ["seattle stadium", "lumen field"],
  };

  return [normalized, ...(aliases[normalized] || [])].filter(Boolean);
}

function eventMatchesCity(event, city) {
  const cityValues = getCitySearchValues(city);

  if (cityValues.length === 0) {
    return true;
  }

  const searchable = [
    event.city,
    event.region,
    event.venue,
    event.locationDetail,
    event.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return cityValues.some((value) => searchable.includes(value));
}

export async function fetchFanEvents(filters = {}) {
  if (!IS_STATIC_MODE) {
    const {
      fetchFanEvents: fetchLiveFanEvents,
    } = await import("./liveMatchCastApi.js");

    return fetchLiveFanEvents(filters);
  }

  const query = filters.q ?? filters.query;

  const normalizedCountry = normalizeFilterValue(filters.country);
  const normalizedType = normalizeFilterValue(filters.type);
  const normalizedQuery = normalizeFilterValue(query);

  const events = FAN_EVENTS.filter((event) => {
    const searchable = [
      event.name,
      event.typeLabel,
      event.city,
      event.region,
      event.country,
      event.venue,
      event.locationDetail,
      event.description,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      eventMatchesCity(event, filters.city) &&
      (!normalizedCountry || normalizeFilterValue(event.country) === normalizedCountry) &&
      (!normalizedType || normalizeFilterValue(event.type) === normalizedType) &&
      (!filters.date || (event.startDate <= filters.date && event.endDate >= filters.date)) &&
      (filters.official === undefined || filters.official === null || event.official === filters.official) &&
      (!normalizedQuery || searchable.includes(normalizedQuery))
    );
  }).sort((a, b) => a.startDate.localeCompare(b.startDate));

  return {
    events,
    metadata: {
      totalEvents: FAN_EVENTS.length,
      officialEvents: FAN_EVENTS.filter((event) => event.official).length,
      archived: true,
    },
    filters: {
      city: filters.city || null,
      country: filters.country || null,
      type: filters.type || null,
      date: filters.date || null,
      official: filters.official ?? null,
      query: query || null,
    },
  };
}
