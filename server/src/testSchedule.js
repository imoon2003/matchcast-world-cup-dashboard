import "dotenv/config";

const apiKey = process.env.API_FOOTBALL_KEY;

const baseUrl =
  process.env.API_FOOTBALL_BASE_URL ||
  "https://v3.football.api-sports.io";

if (!apiKey) {
  console.error(
    "API_FOOTBALL_KEY is missing from server/.env"
  );

  process.exit(1);
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

async function testFullSchedule() {
  console.log(
    "Testing complete World Cup 2026 schedule access..."
  );

  const url = new URL(`${baseUrl}/fixtures`);

  url.searchParams.set("league", "1");
  url.searchParams.set("season", "2026");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "x-apisports-key": apiKey,
    },
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status}: ${JSON.stringify(
        payload
      )}`
    );
  }

  if (hasApiErrors(payload.errors)) {
    throw new Error(
      `API-Football restriction: ${JSON.stringify(
        payload.errors
      )}`
    );
  }

  const fixtures = payload.response || [];

  const now = Date.now();

  const futureFixtures = fixtures.filter(
    (item) =>
      new Date(item.fixture.date).getTime() > now
  );

  console.log("Full schedule request successful.");
  console.log("Total fixtures returned:", fixtures.length);
  console.log(
    "Future fixtures returned:",
    futureFixtures.length
  );

  if (fixtures.length > 0) {
    const firstFixture = fixtures[0];
    const lastFixture =
      fixtures[fixtures.length - 1];

    console.log("\nFirst fixture:");
    console.log(
      `${firstFixture.teams.home.name} vs ${firstFixture.teams.away.name}`
    );
    console.log(firstFixture.fixture.date);

    console.log("\nLast available fixture:");
    console.log(
      `${lastFixture.teams.home.name} vs ${lastFixture.teams.away.name}`
    );
    console.log(lastFixture.fixture.date);
  }
}

testFullSchedule().catch((error) => {
  console.error("\nFull schedule test failed.");
  console.error(error.message);
  process.exit(1);
});