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

const liveApiProvider =
  process.env.LIVE_API_PROVIDER || "espn";

const useLiveApi =
  process.env.USE_LIVE_API !== "false";

const espnSoccerBaseUrl =
  process.env.ESPN_SOCCER_BASE_URL ||
  "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world";


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

function hasApiErrors(errors) {
  if (Array.isArray(errors)) {
    return errors.length > 0;
  }

  return Boolean(
    errors &&
      typeof errors === "object" &&
      Object.keys(errors).length > 0
  );
}

function formatEspnScoreboardDate(date) {
  return date.replace(/-/g, "");
}

const ESPN_TEAM_NAME_ALIASES = {
  "Bosnia-Herzegovina": "Bosnia and Herzegovina",
  "Congo DR": "DR Congo",
  "Côte d'Ivoire": "Ivory Coast",
};

function cleanEspnTeamName(name) {
  return ESPN_TEAM_NAME_ALIASES[name] || name || "TBD";
}

function getEspnScore(competitor, statusType) {
  if (!competitor || statusType?.state === "pre") {
    return null;
  }

  const score = competitor.score;

  if (score === undefined || score === null || score === "") {
    return null;
  }

  const numericScore = Number(score);

  return Number.isNaN(numericScore) ? null : numericScore;
}

function normalizeEspnStatus(statusType = {}) {
  const description =
    statusType.description ||
    statusType.detail ||
    "Scheduled";

  let short = "NS";

  if (statusType.state === "in") {
    short = "LIVE";
  } else if (
    statusType.completed ||
    statusType.state === "post"
  ) {
    short = "FT";
  }

  return {
    long: description,
    short,
    elapsed: null,
  };
}

async function fetchFromEspnScoreboard(date) {
  const cleanBaseUrl = espnSoccerBaseUrl.replace(/\/$/, "");
  const scoreboardDate = formatEspnScoreboardDate(date);

  const url = new URL(`${cleanBaseUrl}/scoreboard`);
  url.searchParams.set("dates", scoreboardDate);

  const response = await fetch(url);
  const payload = await response.json();

  if (!response.ok) {
    const error = new Error(
      `ESPN scoreboard request failed with status ${response.status}.`
    );

    error.status = response.status;
    error.details = payload;

    throw error;
  }

  return payload.events || [];
}


function normalizeEspnEvent(event) {
  const competition = event.competitions?.[0];
  const competitors = competition?.competitors || [];

  const home = competitors.find(
    (competitor) => competitor.homeAway === "home"
  );

  const away = competitors.find(
    (competitor) => competitor.homeAway === "away"
  );

  const statusType = event.status?.type || {};
  const homeScore = getEspnScore(home, statusType);
  const awayScore = getEspnScore(away, statusType);

  return {
    id: Number(event.id),
    date: event.date,
    timestamp: event.date
      ? Math.floor(new Date(event.date).getTime() / 1000)
      : null,

    venue: {
      name:
        competition?.venue?.fullName ||
        competition?.venue?.displayName ||
        null,
      city:
        competition?.venue?.address?.city ||
        null,
    },

    status: normalizeEspnStatus(statusType),

    league: {
      id: "espn-fifa-world",
      name: "FIFA World Cup",
      season: 2026,
      round: event.season?.slug || null,
    },

    teams: {
      home: {
        id: home?.team?.id || null,
        name: cleanEspnTeamName(
          home?.team?.displayName ||
            home?.team?.name
        ),
        logo: home?.team?.logo || null,
        winner: home?.winner ?? null,
      },
      away: {
        id: away?.team?.id || null,
        name: cleanEspnTeamName(
          away?.team?.displayName ||
            away?.team?.name
        ),
        logo: away?.team?.logo || null,
        winner: away?.winner ?? null,
      },
    },

    goals: {
      home: homeScore,
      away: awayScore,
    },

    score: {
      halftime: {
        home: null,
        away: null,
      },
      fulltime: {
        home: homeScore,
        away: awayScore,
      },
      extratime: {
        home: null,
        away: null,
      },
      penalty: {
        home: null,
        away: null,
      },
    },

    source: "ESPN",
  };
}

async function getWorldCupFixtures(date) {
  const cachedResult = fixtureCache.get(date);
  const currentTime = Date.now();

  if (
    cachedResult &&
    cachedResult.expiresAt > currentTime
  ) {
    return {
      data: cachedResult.data,
      fetchedAt: cachedResult.fetchedAt,
      cached: true,
      source: cachedResult.source,
    };
  }

  if (!useLiveApi || liveApiProvider !== "espn") {
    return {
      data: [],
      fetchedAt: null,
      cached: false,
      source: "fallback",
    };
  }

  try {
    const espnEvents = await fetchFromEspnScoreboard(date);
    const fixtures = espnEvents.map(normalizeEspnEvent);
    const fetchedAt = new Date().toISOString();

    fixtureCache.set(date, {
      data: fixtures,
      fetchedAt,
      source: "ESPN",
      expiresAt: currentTime + CACHE_DURATION,
    });

    return {
      data: fixtures,
      fetchedAt,
      cached: false,
      source: "ESPN",
    };
  } catch (error) {
    console.warn(
      "ESPN live provider failed. Using fallback MatchCast data:",
      error.message
    );

    return {
      data: [],
      fetchedAt: null,
      cached: false,
      source: "fallback",
      providerError: error.message,
    };
  }
}

function sendFixtureResponse(res, date, result) {
  res.json({
    success: true,
    source: result.source || "ESPN",
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
        "none",
      ];

      if (!validOverlayValues.includes(overlay)) {
        return res.status(400).json({
          success: false,
          message:
            "overlay must be yesterday, today, tomorrow, or none.",
          allowedOverlayValues: validOverlayValues,
        });
      }

      const cacheKey = req.originalUrl;
      const cachedResponse =
        getCachedResponse(cacheKey);

      if (cachedResponse) {
        res.set("X-MatchCast-Cache", "HIT");
        return res.json(cachedResponse);
      }

      const catalogSchedule =
        getScheduleCatalog({
          stage,
          group,
        });

      let schedule = catalogSchedule;

      let overlayInformation = {
        enabled: false,
        date: null,
        cached: null,
        fetchedAt: null,
        matchedFixtures: 0,
      };

      if (overlay !== "none") {
        const allowedDates =
          getAllowedDates();

        const overlayDate =
          allowedDates[overlay];

        const apiResult =
          await getWorldCupFixtures(
            overlayDate
          );

        schedule =
          mergeScheduleWithApiFixtures(
            catalogSchedule,
            apiResult.data
          );

        const matchedFixtures =
          schedule.filter(
            (match) =>
              match.liveDataAvailable
          ).length;

        overlayInformation = {
          enabled: true,
          period: overlay,
          date: overlayDate,
          cached: apiResult.cached,
          fetchedAt: apiResult.fetchedAt,
          apiFixturesReturned:
            apiResult.data.length,
          matchedFixtures,
        };
      }

      const hasLiveMatch = schedule.some(
        (match) => match.status === "Live"
      );

      const ttlMs = hasLiveMatch
        ? 60_000
        : 10 * 60_000;

      const payload = {
        success: true,

        competition:
          "FIFA World Cup 2026",

        source:
          overlay === "none"
            ? "Local published-schedule catalog"
            : "Schedule catalog with API-Football overlay",

        filters: {
          stage: stage || null,
          group: group || null,
          overlay,
        },

        overlay: overlayInformation,

        metadata:
          getScheduleMetadata(),

        count: schedule.length,
        data: schedule,
      };

      setCachedResponse(
        cacheKey,
        payload,
        ttlMs
      );

      res.set("X-MatchCast-Cache", "MISS");
      return res.json(payload);
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