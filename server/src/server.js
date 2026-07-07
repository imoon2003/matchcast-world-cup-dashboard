import "dotenv/config";

import cors from "cors";
import express from "express";

import {
  getScheduleCatalog,
  getScheduleMetadata,
  mergeScheduleWithApiFixtures,
} from "./services/scheduleCatalog.js";

import {
  getFanEvents,
  getFanEventMetadata,
} from "./services/fanEvents.js";

const apiCache = new Map();

function getCachedResponse(key) {
  const cached = apiCache.get(key);

  if (!cached) {
    return null;
  }

  if (Date.now() > cached.expiresAt) {
    apiCache.delete(key);
    return null;
  }

  return cached.data;
}

function setCachedResponse(key, data, ttlMs) {
  apiCache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

const app = express();

const port = Number(process.env.PORT) || 5050;

const footballDataKey = process.env.FOOTBALL_DATA_KEY;

const footballDataBaseUrl =
  process.env.FOOTBALL_DATA_BASE_URL ||
  "https://api.football-data.org/v4";

const WORLD_CUP_SEASON =
  Number(process.env.WORLD_CUP_SEASON) || 2026;

// Keep each API response for 15 minutes.
const CACHE_DURATION = 15 * 60 * 1000;

const fixtureCache = new Map();

app.use(
  cors({
    origin:
      process.env.CLIENT_ORIGIN ||
      "http://localhost:5173",
  })
);

app.use(express.json());

function formatNewYorkDate(date) {
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

function getAllowedDates() {
  const currentTime = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  return {
    yesterday: formatNewYorkDate(
      new Date(currentTime - oneDay)
    ),
    today: formatNewYorkDate(new Date(currentTime)),
    tomorrow: formatNewYorkDate(
      new Date(currentTime + oneDay)
    ),
  };
}

function formatFootballDataStage(stage) {
  const stageLabels = {
    GROUP_STAGE: "Group Stage",
    LAST_32: "Round of 32",
    LAST_16: "Round of 16",
    ROUND_OF_16: "Round of 16",
    QUARTER_FINALS: "Quarterfinal",
    SEMI_FINALS: "Semifinal",
    THIRD_PLACE: "Third Place Playoff",
    FINAL: "Final",
  };

  return (
    stageLabels[stage] ||
    String(stage || "World Cup").replace(/_/g, " ")
  );
}

function formatFootballDataGroup(group) {
  if (!group) {
    return null;
  }

  const match = String(group).match(/GROUP_([A-L])/);

  return match ? match[1] : null;
}

function getFootballDataStageCode(stage) {
  const stageCodes = {
    GROUP_STAGE: "group",
    LAST_32: "r32",
    LAST_16: "r16",
    ROUND_OF_16: "r16",
    QUARTER_FINALS: "qf",
    SEMI_FINALS: "sf",
    THIRD_PLACE: "third",
    FINAL: "final",
  };

  return stageCodes[stage] || "knockout";
}

function normalizeFootballDataStatus(status) {
  const statusLabels = {
    TIMED: "Scheduled",
    SCHEDULED: "Scheduled",
    LIVE: "Live",
    IN_PLAY: "Live",
    PAUSED: "Halftime",
    FINISHED: "Full Time",
    POSTPONED: "Postponed",
    SUSPENDED: "Suspended",
    CANCELED: "Canceled",
  };

  return {
    long: statusLabels[status] || status || "Scheduled",
    short: status || "SCHEDULED",
    elapsed: null,
  };
}

async function fetchFromFootballData(endpoint, parameters = {}) {
  if (!footballDataKey) {
    throw new Error(
      "FOOTBALL_DATA_KEY is missing from the server environment."
    );
  }

  const cleanBaseUrl = footballDataBaseUrl.replace(/\/$/, "");
  const cleanEndpoint = endpoint.replace(/^\//, "");

  const url = new URL(`${cleanBaseUrl}/${cleanEndpoint}`);

  Object.entries(parameters).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "X-Auth-Token": footballDataKey,
    },
  });

  const payload = await response.json();

  if (!response.ok) {
    const error = new Error(
      `football-data.org request failed with status ${response.status}.`
    );

    error.status = response.status;
    error.details = payload;

    throw error;
  }

  return payload;
}

function normalizeFixture(item) {
  const date = item.utcDate;
  const timestamp = date
    ? Math.floor(new Date(date).getTime() / 1000)
    : null;

  const stage = formatFootballDataStage(item.stage);
  const group = formatFootballDataGroup(item.group);

  return {
    id: item.id,
    date,
    timestamp,
    timezone: "UTC",

    status: normalizeFootballDataStatus(item.status),

    round: stage,
    stage,
    stageCode: getFootballDataStageCode(item.stage),
    group,
    matchday: item.matchday,

    venue: {
      id: null,
      name: "Published venue",
      city: "TBD",
    },

    homeTeam: {
      id: item.homeTeam?.id || null,
      name: item.homeTeam?.name || "TBD",
      code: item.homeTeam?.tla || null,
      logo: item.homeTeam?.crest || null,
      flag: item.homeTeam?.crest || null,
      winner: item.score?.winner === "HOME_TEAM",
    },

    awayTeam: {
      id: item.awayTeam?.id || null,
      name: item.awayTeam?.name || "TBD",
      code: item.awayTeam?.tla || null,
      logo: item.awayTeam?.crest || null,
      flag: item.awayTeam?.crest || null,
      winner: item.score?.winner === "AWAY_TEAM",
    },

    goals: {
      home: item.score?.fullTime?.home ?? null,
      away: item.score?.fullTime?.away ?? null,
    },

    score: item.score,
    dataSource: "football-data.org",
    liveDataAvailable: true,
  };
}

async function getWorldCupFixtures(date) {
  const cacheKey = date || "all";
  const cachedResult = fixtureCache.get(cacheKey);
  const currentTime = Date.now();

  if (
    cachedResult &&
    cachedResult.expiresAt > currentTime
  ) {
    return {
      data: cachedResult.data,
      fetchedAt: cachedResult.fetchedAt,
      cached: true,
    };
  }

  const payload = await fetchFromFootballData(
    "competitions/WC/matches",
    {
      season: WORLD_CUP_SEASON,
    }
  );

  const fixtures = payload.matches
    .map(normalizeFixture)
    .filter((fixture) => {
      if (!date) {
        return true;
      }

      return fixture.date?.startsWith(date);
    });

  const fetchedAt = new Date().toISOString();

  fixtureCache.set(cacheKey, {
    data: fixtures,
    fetchedAt,
    expiresAt: currentTime + CACHE_DURATION,
  });

  return {
    data: fixtures,
    fetchedAt,
    cached: false,
  };
}

function sendFixtureResponse(res, date, result) {
  res.json({
    success: true,
    source: "football-data.org",
    competition: "FIFA World Cup 2026",
    date,
    count: result.data.length,
    cached: result.cached,
    fetchedAt: result.fetchedAt,
    data: result.data,
  });
}

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    service: "MatchCast API",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

app.get(
  "/api/world-cup/fixtures",
  async (req, res, next) => {
    try {
      const allowedDates = getAllowedDates();
      const requestedDate =
        req.query.date || allowedDates.today;

      const validDates = Object.values(allowedDates);

      if (!validDates.includes(requestedDate)) {
        return res.status(400).json({
          success: false,
          message:
            "The free plan only supports yesterday, today, or tomorrow.",
          allowedDates,
        });
      }

      const result =
        await getWorldCupFixtures(requestedDate);

      sendFixtureResponse(
        res,
        requestedDate,
        result
      );
    } catch (error) {
      next(error);
    }
  }
);

app.get(
  "/api/world-cup/today",
  async (req, res, next) => {
    try {
      const { today } = getAllowedDates();

      const result =
        await getWorldCupFixtures(today);

      sendFixtureResponse(res, today, result);
    } catch (error) {
      next(error);
    }
  }
);

app.delete("/api/cache", (req, res) => {
  fixtureCache.clear();

  res.json({
    success: true,
    message: "MatchCast API cache cleared.",
  });
});

app.get(
  "/api/world-cup/schedule",
  async (req, res, next) => {
    try {
      const { stage, group } = req.query;

      const overlay = String(
        req.query.overlay || "today"
      ).toLowerCase();

      const validOverlayValues = [
        "yesterday",
        "today",
        "tomorrow",
        "upcoming",
        "none",
        "all",
      ];

      if (!validOverlayValues.includes(overlay)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid overlay. Use yesterday, today, tomorrow, upcoming, none, or all.",
          validOverlayValues,
        });
      }

      const allowedDates = getAllowedDates();
      const oneDay = 24 * 60 * 60 * 1000;
      const upcomingEndDate = formatNewYorkDate(
        new Date(Date.now() + 8 * oneDay)
      );

      const catalogMatches = getScheduleCatalog({
        stage,
        group,
      });

      const result = await getWorldCupFixtures();

      let schedule = mergeScheduleWithApiFixtures(
        catalogMatches,
        result.data
      );

      const getMatchDateKey = (match) => {
        if (match.date) {
          return formatNewYorkDate(new Date(match.date));
        }

        if (match.localDate) {
          const [datePart] = match.localDate.split(" ");
          const [month, day, year] = datePart.split("/");
          return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        }

        return null;
      };

      const hasRealTeams = (match) => {
        const homeName = match.homeTeam?.name || "";
        const awayName = match.awayTeam?.name || "";

        return ![homeName, awayName].some((name) =>
          /^(TBD|Winner|Loser|To be determined)/i.test(name)
        );
      };

      schedule = schedule.filter(hasRealTeams);

      if (overlay === "yesterday") {
        schedule = schedule.filter(
          (match) =>
            getMatchDateKey(match) === allowedDates.yesterday
        );
      }

      if (overlay === "tomorrow") {
        schedule = schedule.filter(
          (match) =>
            getMatchDateKey(match) === allowedDates.tomorrow
        );
      }

      if (overlay === "today" || overlay === "upcoming") {
        schedule = schedule.filter((match) => {
          const matchDate = getMatchDateKey(match);

          return (
            matchDate &&
            matchDate >= allowedDates.today &&
            matchDate <= upcomingEndDate
          );
        });
      }

      schedule = schedule
        .sort((a, b) => {
          const first = a.date
            ? new Date(a.date).getTime()
            : a.catalogId || 9999;

          const second = b.date
            ? new Date(b.date).getTime()
            : b.catalogId || 9999;

          return first - second;
        })
        .slice(0, 12);

      res.json({
        success: true,
        competition: "FIFA World Cup 2026",
        source: "football-data.org + schedule catalog",
        filters: {
          stage: stage || null,
          group: group || null,
          overlay,
        },
        overlay: {
          enabled: overlay !== "none" && overlay !== "all",
          period: overlay,
          date: allowedDates.today,
          cached: result.cached,
          fetchedAt: result.fetchedAt,
          apiFixturesReturned: result.data.length,
          matchedFixtures: schedule.filter(
            (match) => match.liveDataAvailable
          ).length,
        },
        metadata: getScheduleMetadata(),
        count: schedule.length,
        data: schedule,
      });
    } catch (error) {
      next(error);
    }
  }
);

app.get("/api/fan-events", (req, res) => {
  const {
    city,
    country,
    type,
    date,
    official,
    q,
  } = req.query;

  if (
    date &&
    !/^\d{4}-\d{2}-\d{2}$/.test(date)
  ) {
    return res.status(400).json({
      success: false,
      message:
        "date must use YYYY-MM-DD format.",
    });
  }

  let officialFilter;

  if (official !== undefined) {
    const normalizedOfficial =
      String(official).toLowerCase();

    if (
      !["true", "false"].includes(
        normalizedOfficial
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "official must be true or false.",
      });
    }

    officialFilter =
      normalizedOfficial === "true";
  }

  const events = getFanEvents({
    city,
    country,
    type,
    date,
    official: officialFilter,
    query: q,
  });

  res.json({
    success: true,
    source:
      "Curated official FIFA and host-city sources",

    filters: {
      city: city || null,
      country: country || null,
      type: type || null,
      date: date || null,
      official:
        officialFilter ?? null,
      query: q || null,
    },

    metadata: getFanEventMetadata(),

    count: events.length,
    data: events,
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  res.status(error.status || 500).json({
    success: false,
    message:
      error.message ||
      "An unexpected server error occurred.",
  });
});

app.listen(port, () => {
  console.log(
    `MatchCast API running at http://localhost:${port}`
  );
});