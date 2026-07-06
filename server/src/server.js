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

const apiKey = process.env.API_FOOTBALL_KEY;

const apiBaseUrl =
  process.env.API_FOOTBALL_BASE_URL ||
  "https://v3.football.api-sports.io";

const WORLD_CUP_LEAGUE_ID = 1;
const WORLD_CUP_SEASON = 2026;

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

async function fetchFromApiFootball(
  endpoint,
  parameters = {}
) {
  if (!apiKey) {
    throw new Error(
      "API_FOOTBALL_KEY is missing from the server environment."
    );
  }

  const cleanBaseUrl = apiBaseUrl.replace(/\/$/, "");
  const cleanEndpoint = endpoint.replace(/^\//, "");

  const url = new URL(
    `${cleanBaseUrl}/${cleanEndpoint}`
  );

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
      "x-apisports-key": apiKey,
    },
  });

  const payload = await response.json();

  if (!response.ok) {
    const error = new Error(
      `API-Football request failed with status ${response.status}.`
    );

    error.status = response.status;
    error.details = payload;

    throw error;
  }

  if (hasApiErrors(payload.errors)) {
    const error = new Error(
      `API-Football error: ${JSON.stringify(
        payload.errors
      )}`
    );

    error.status = 502;

    throw error;
  }

  return payload;
}

function normalizeFixture(item) {
  return {
    id: item.fixture.id,
    date: item.fixture.date,
    timestamp: item.fixture.timestamp,
    timezone: item.fixture.timezone,

    status: {
      long: item.fixture.status.long,
      short: item.fixture.status.short,
      elapsed: item.fixture.status.elapsed,
    },

    round: item.league.round,

    venue: {
      id: item.fixture.venue?.id || null,
      name: item.fixture.venue?.name || "TBD",
      city: item.fixture.venue?.city || "TBD",
    },

    homeTeam: {
      id: item.teams.home.id,
      name: item.teams.home.name,
      logo: item.teams.home.logo,
      winner: item.teams.home.winner,
    },

    awayTeam: {
      id: item.teams.away.id,
      name: item.teams.away.name,
      logo: item.teams.away.logo,
      winner: item.teams.away.winner,
    },

    goals: {
      home: item.goals.home,
      away: item.goals.away,
    },

    score: item.score,
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
    };
  }

  const payload = await fetchFromApiFootball(
    "fixtures",
    {
      date,
      timezone: "America/New_York",
    }
  );

  const fixtures = payload.response
    .filter(
      (item) =>
        item.league?.id === WORLD_CUP_LEAGUE_ID &&
        Number(item.league?.season) ===
          WORLD_CUP_SEASON
    )
    .map(normalizeFixture);

  const fetchedAt = new Date().toISOString();

  fixtureCache.set(date, {
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
    source: "API-Football",
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