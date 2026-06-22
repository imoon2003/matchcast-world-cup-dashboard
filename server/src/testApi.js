import "dotenv/config";

const apiKey = process.env.API_FOOTBALL_KEY;
const baseUrl =
  process.env.API_FOOTBALL_BASE_URL ||
  "https://v3.football.api-sports.io";

if (!apiKey) {
  console.error("API_FOOTBALL_KEY is missing from server/.env");
  process.exit(1);
}

async function testApi() {
  console.log("Testing API-Football authentication...");

  const statusResponse = await fetch(`${baseUrl}/status`, {
    headers: {
      "x-apisports-key": apiKey,
    },
  });

  const statusData = await statusResponse.json();

  if (!statusResponse.ok) {
    throw new Error(
      `Authentication request failed: ${JSON.stringify(statusData)}`
    );
  }

  if (
    statusData.errors &&
    Object.keys(statusData.errors).length > 0
  ) {
    throw new Error(
      `API-Football error: ${JSON.stringify(statusData.errors)}`
    );
  }

  console.log("Authentication successful.");
  console.log(
    "Plan:",
    statusData.response?.subscription?.plan || "Unknown"
  );
  console.log(
    "Daily limit:",
    statusData.response?.requests?.limit_day || "Unknown"
  );
  console.log(
    "Requests used:",
    statusData.response?.requests?.current || 0
  );

  const today = new Date().toISOString().split("T")[0];

  console.log(`\nTesting fixtures for ${today}...`);

  const fixtureUrl = new URL(`${baseUrl}/fixtures`);
  fixtureUrl.searchParams.set("date", today);

  const fixtureResponse = await fetch(fixtureUrl, {
    headers: {
      "x-apisports-key": apiKey,
    },
  });

  const fixtureData = await fixtureResponse.json();

  if (!fixtureResponse.ok) {
    throw new Error(
      `Fixture request failed: ${JSON.stringify(fixtureData)}`
    );
  }

  if (
    fixtureData.errors &&
    Object.keys(fixtureData.errors).length > 0
  ) {
    throw new Error(
      `Fixture API error: ${JSON.stringify(fixtureData.errors)}`
    );
  }

  console.log("Fixture request successful.");
  console.log(
    "Fixtures returned:",
    fixtureData.results ?? fixtureData.response?.length ?? 0
  );

  const worldCupFixtures =
    fixtureData.response?.filter(
      (item) =>
        item.league?.id === 1 &&
        item.league?.season === 2026
    ) || [];

  console.log(
    "World Cup fixtures returned:",
    worldCupFixtures.length
  );

  worldCupFixtures.slice(0, 5).forEach((item) => {
    console.log(
      `- ${item.teams.home.name} vs ${item.teams.away.name} | ${item.fixture.status.long}`
    );
  });
}

testApi().catch((error) => {
  console.error("\nAPI test failed:");
  console.error(error.message);
  process.exit(1);
});