const FAN_EVENTS = [
  {
    id: "philadelphia-fifa-fan-festival",
    name: "FIFA Fan Festival Philadelphia",
    type: "fifa-fan-festival",
    typeLabel: "Official FIFA Fan Festival",

    city: "Philadelphia",
    region: "Pennsylvania",
    country: "United States",

    venue: "Lemon Hill",
    locationDetail:
      "East Fairmount Park, Philadelphia",

    startDate: "2026-06-11",
    endDate: "2026-07-19",

    scheduleType: "daily",
    scheduleNote:
      "Runs throughout the full tournament; daily hours and match broadcasts vary by weekly schedule.",
    admission:
      "Free general admission",
    registrationRequired: true,

    official: true,

    description:
      "Live match broadcasts, music, cultural performances, food vendors, and interactive activities.",

    sourceUrl:
      "https://phillyfwc26.com/fifa-fan-fest",
  },

  {
    id: "houston-fifa-fan-festival",
    name: "FIFA Fan Festival Houston",
    type: "fifa-fan-festival",
    typeLabel: "Official FIFA Fan Festival",

    city: "Houston",
    region: "Texas",
    country: "United States",

    venue: "EaDo",
    locationDetail:
      "East Downtown Houston near Shell Energy Stadium",

    startDate: "2026-06-11",
    endDate: "2026-07-19",

    scheduleType: "match-days",
    scheduleNote:
      "Open on all 34 FIFA World Cup 2026 match days. Gates open 90 minutes before the first match of the day.",

    admission:
      "Free general admission; paid premium experiences available",
    registrationRequired: null,

    official: true,

    description:
      "Live matches, local food, music, art, entertainment, and fan activities in Houston's soccer district.",

    sourceUrl:
      "https://www.fwc26houston.com/fanfestival",
  },

  {
    id: "miami-fifa-fan-festival",
    name: "FIFA Fan Festival Miami",
    type: "fifa-fan-festival",
    typeLabel: "Official FIFA Fan Festival",

    city: "Miami",
    region: "Florida",
    country: "United States",

    venue: "Bayfront Park",
    locationDetail:
      "Downtown Miami along Biscayne Bay",

    startDate: "2026-06-13",
    endDate: "2026-07-05",

    scheduleType: "published-opening-days",
    scheduleNote:
      "Official published opening period: June 13 through July 5.",

    admission:
      "No ticket required",
    registrationRequired: false,

    official: true,

    description:
      "Waterfront match viewing, cultural programming, and interactive fan experiences.",

    sourceUrl:
      "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/fifa-fan-festival/miami",
  },

  {
    id: "los-angeles-fifa-fan-festival",
    name: "FIFA Fan Festival Los Angeles",
    type: "fifa-fan-festival",
    typeLabel: "Official FIFA Fan Festival",

    city: "Los Angeles",
    region: "California",
    country: "United States",

    venue: "Los Angeles Memorial Coliseum",
    locationDetail:
      "3911 South Figueroa Street, Los Angeles",

    startDate: "2026-06-11",
    endDate: "2026-06-14",

    scheduleType: "published-opening-days",
    scheduleNote:
      "Four published opening days from June 11 through June 14.",

    admission:
      "Check official event page",
    registrationRequired: null,

    official: true,

    description:
      "Official World Cup fan celebration at the Los Angeles Memorial Coliseum in Exposition Park.",

    sourceUrl:
      "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/fifa-fan-festival/los-angeles",
  },

  {
    id: "nynj-rockefeller-center-fan-village",
    name: "New York / New Jersey World Cup 26 Fan Village",
    type: "host-city-fan-village",
    typeLabel: "Host City Fan Village",

    city: "New York",
    region: "New York",
    country: "United States",

    venue: "Rockefeller Center",
    locationDetail:
      "Midtown Manhattan",

    startDate: "2026-07-06",
    endDate: "2026-07-19",

    scheduleType: "published-opening-days",
    scheduleNote:
      "Published event period: July 6 through July 19.",

    admission:
      "Check official event page",
    registrationRequired: null,

    official: true,

    description:
      "Live match broadcasts, an interactive soccer pitch, entertainment, and programming across the Rockefeller Center campus.",

    sourceUrl:
      "https://nynjfwc26.com/fan-events/",
  },

  {
    id: "nynj-bronx-fan-zone",
    name: "Bronx Fan Zone",
    type: "host-city-fan-zone",
    typeLabel: "Host City Fan Zone",

    city: "Bronx",
    region: "New York",
    country: "United States",

    venue: "Bronx Terminal Market",
    locationDetail:
      "South Bronx, New York",

    startDate: "2026-06-13",
    endDate: "2026-06-14",

    scheduleType: "specific-dates",
    scheduleNote:
      "Open June 13 and June 14.",

    admission:
      "Free with reservation; capacity is limited",
    registrationRequired: true,

    official: true,

    description:
      "Community-focused match viewing, local food, entertainment, and family-friendly programming.",

    sourceUrl:
      "https://nynjfwc26.com/fan-events/",
  },

  {
    id: "atlanta-fifa-fan-festival",
    name: "FIFA Fan Festival Atlanta",
    type: "fifa-fan-festival",
    typeLabel: "Official FIFA Fan Festival",

    city: "Atlanta",
    region: "Georgia",
    country: "United States",

    venue: "Centennial Olympic Park",
    locationDetail:
      "Downtown Atlanta, GA 30313",

    startDate: "2026-06-18",
    endDate: "2026-07-15",

    scheduleType: "select-days",
    scheduleNote:
      "Published schedule includes select tournament days from June 18 through July 15.",

    admission:
      "Free general admission; advance registration required",
    registrationRequired: true,

    official: true,

    description:
      "Official FIFA Fan Festival in Centennial Olympic Park with live match broadcasts, music, entertainment, and fan programming.",

    sourceUrl:
      "https://atlantafwc26.com/fan-fest/",
  },

  {
    id: "boston-fifa-fan-festival",
    name: "FIFA Fan Festival Boston",
    type: "fifa-fan-festival",
    typeLabel: "Official FIFA Fan Festival",

    city: "Boston",
    region: "Massachusetts",
    country: "United States",

    venue: "Boston City Hall Plaza",
    locationDetail:
      "1 City Hall Square, Boston",

    startDate: "2026-06-12",
    endDate: "2026-06-27",

    scheduleType: "published-opening-days",
    scheduleNote:
      "Runs from June 12 through June 27 with live match broadcasts and cultural programming.",

    admission:
      "Free; advanced registration required",
    registrationRequired: true,

    official: true,

    description:
      "Official FIFA Fan Festival in downtown Boston with live match broadcasts, cultural showcases, food, and fan experiences.",

    sourceUrl:
      "https://bostonfwc26.com/fifa-fan-festival/",
  },

  {
    id: "dallas-fifa-fan-festival",
    name: "FIFA Fan Festival Dallas",
    type: "fifa-fan-festival",
    typeLabel: "Official FIFA Fan Festival",

    city: "Dallas",
    region: "Texas",
    country: "United States",

    venue: "Fair Park",
    locationDetail:
      "3809 Grand Avenue, Dallas",

    startDate: "2026-06-11",
    endDate: "2026-07-19",

    scheduleType: "select-days",
    scheduleNote:
      "Open 34 total days from June 11 through July 19; not open on listed rest days.",

    admission:
      "Free and open to the public",
    registrationRequired: null,

    official: true,

    description:
      "Official FIFA Fan Festival at Fair Park with live match broadcasts, concerts, games, food, and cultural programming.",

    sourceUrl:
      "https://www.dallasfwc26.com/home/fifafanfestival-dallas/",
  },

  {
    id: "kansas-city-fifa-fan-festival",
    name: "FIFA Fan Festival Kansas City",
    type: "fifa-fan-festival",
    typeLabel: "Official FIFA Fan Festival",

    city: "Kansas City",
    region: "Missouri",
    country: "United States",

    venue: "National WWI Museum and Memorial",
    locationDetail:
      "Kansas City, Missouri",

    startDate: "2026-06-11",
    endDate: "2026-07-11",

    scheduleType: "select-days",
    scheduleNote:
      "Open for 18 select days from June 11 through July 11.",

    admission:
      "Free general admission; digital pass required and entry subject to capacity",
    registrationRequired: true,

    official: true,

    description:
      "Official FIFA Fan Festival at the National WWI Museum and Memorial with big-screen match broadcasts, live music, fan activations, and local culture.",

    sourceUrl:
      "https://www.kc2026.com/fifa-fan-festival/full-schedule/",
  },

  {
    id: "seattle-fan-celebrations",
    name: "Seattle World Cup Fan Celebrations",
    type: "host-city-fan-celebration",
    typeLabel: "Host City Fan Celebration",

    city: "Seattle",
    region: "Washington",
    country: "United States",

    venue: "Seattle Unity Loop",
    locationDetail:
      "Seattle Center, Waterfront Park, Pacific Place, and Victory Hall in SODO",

    startDate: "2026-06-11",
    endDate: "2026-07-06",

    scheduleType: "distributed-host-city-events",
    scheduleNote:
      "Distributed fan celebrations begin June 11 and run across multiple Seattle locations, with experiences available for at least the six Seattle home matches.",

    admission:
      "Free and open to the public",
    registrationRequired: false,

    official: true,

    description:
      "Official Seattle host-city fan celebrations across multiple landmarks with watch parties, activations, music, food, and community programming.",

    sourceUrl:
      "https://www.seattlefwc26.org/events/seattle-fan-celebrations",
  },

  {
    id: "sf-bay-area-fan-zones",
    name: "San Francisco Bay Area Fan Zones & Watch Parties",
    type: "host-city-fan-zone",
    typeLabel: "Host City Fan Zone",

    city: "San Francisco Bay Area",
    region: "California",
    country: "United States",

    venue: "Multiple Bay Area locations",
    locationDetail:
      "San Francisco, San Jose, Oakland, Santa Clara, and surrounding Bay Area communities",

    startDate: "2026-06-11",
    endDate: "2026-07-19",

    scheduleType: "distributed-host-city-events",
    scheduleNote:
      "The Bay Area host committee lists 30+ free fan celebrations, watch parties, and local events across the region.",

    admission:
      "Free public viewing experiences; some events may require RSVP",
    registrationRequired: null,

    official: true,

    description:
      "Official Bay Area host-city fan zones and watch parties across the region, including public screenings, community celebrations, and soccer activations.",

    sourceUrl:
      "https://www.sfbayareafwc26.com/bay-area-events",
  },
];

function normalizeFilterValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function getCitySearchValues(city) {
  const normalizedCity =
    normalizeFilterValue(city);

  const aliases = {
    philadelphia: ["philly"],

    philly: ["philadelphia"],

    "east rutherford": [
      "new york",
      "bronx",
      "new jersey",
    ],

    "new york/new jersey": [
      "new york",
      "bronx",
      "new jersey",
    ],

    "new york / new jersey": [
      "new york",
      "bronx",
      "new jersey",
    ],

    "miami gardens": ["miami"],

    inglewood: ["los angeles"],

    boston: [
      "foxborough",
      "foxborough stadium",
      "gillette stadium",
    ],

    foxborough: ["boston"],

    "foxborough stadium": ["boston"],

    "boston stadium": ["boston"],

    "gillette stadium": ["boston"],

    atlanta: ["mercedes-benz stadium"],

    "mercedes-benz stadium": ["atlanta"],

    arlington: ["dallas"],

    dallas: ["arlington"],

    "santa clara": [
      "san francisco bay area",
      "san francisco",
      "san jose",
    ],

    "san francisco": [
      "san francisco bay area",
      "santa clara",
    ],

    "san francisco bay area": [
      "santa clara",
      "san francisco",
      "san jose",
      "oakland",
    ],

    "san jose": [
      "san francisco bay area",
      "santa clara",
    ],

    oakland: ["san francisco bay area"],

    seattle: ["seattle stadium", "lumen field"],

    "seattle stadium": ["seattle"],

    "lumen field": ["seattle"],
  };

  return [
    normalizedCity,
    ...(aliases[normalizedCity] || []),
  ].filter(Boolean);
}

function eventMatchesCity(event, city) {
  const cityValues = getCitySearchValues(city);

  if (cityValues.length === 0) {
    return true;
  }

  const eventSearchText = [
    event.city,
    event.region,
    event.venue,
    event.locationDetail,
    event.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return cityValues.some((value) =>
    eventSearchText.includes(value)
  );
}

function eventMatchesDate(event, date) {
  return (
    event.startDate <= date &&
    event.endDate >= date
  );
}

function eventMatchesSearch(event, query) {
  const normalizedQuery =
    normalizeFilterValue(query);

  if (!normalizedQuery) {
    return true;
  }

  const searchableText = [
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

  return searchableText.includes(
    normalizedQuery
  );
}

export function getFanEvents({
  city,
  country,
  type,
  date,
  official,
  query,
} = {}) {
  const normalizedCity =
    normalizeFilterValue(city);

  const normalizedCountry =
    normalizeFilterValue(country);

  const normalizedType =
    normalizeFilterValue(type);

  return FAN_EVENTS.filter((event) => {
    const matchesCity = eventMatchesCity(
      event,
      city
    );

    const matchesCountry =
      !normalizedCountry ||
      normalizeFilterValue(
        event.country
      ) === normalizedCountry;

    const matchesType =
      !normalizedType ||
      normalizeFilterValue(event.type) ===
        normalizedType;

    const matchesDate =
      !date ||
      eventMatchesDate(event, date);

    const matchesOfficial =
      official === undefined ||
      official === null ||
      event.official === official;

    const matchesSearch =
      eventMatchesSearch(event, query);

    return (
      matchesCity &&
      matchesCountry &&
      matchesType &&
      matchesDate &&
      matchesOfficial &&
      matchesSearch
    );
  })
    .sort((firstEvent, secondEvent) => {
      const dateComparison =
        firstEvent.startDate.localeCompare(
          secondEvent.startDate
        );

      if (dateComparison !== 0) {
        return dateComparison;
      }

      return firstEvent.name.localeCompare(
        secondEvent.name
      );
    })
    .map((event) => ({ ...event }));
}

export function getFanEventMetadata() {
  return {
    totalEvents: FAN_EVENTS.length,

    cities: Array.from(
      new Set(
        FAN_EVENTS.map((event) => event.city)
      )
    ).sort(),

    countries: Array.from(
      new Set(
        FAN_EVENTS.map(
          (event) => event.country
        )
      )
    ).sort(),

    types: Array.from(
      new Map(
        FAN_EVENTS.map((event) => [
          event.type,
          {
            value: event.type,
            label: event.typeLabel,
          },
        ])
      ).values()
    ),
  };
}