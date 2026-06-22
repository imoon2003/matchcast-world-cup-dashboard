import { useEffect, useMemo, useState } from "react";

import ActiveFilters from "./components/ActiveFilters";
import CategoryTabs from "./components/CategoryTabs";
import CoverageSummary from "./components/CoverageSummary";
import DashboardControls from "./components/DashboardControls";
import EmptyState from "./components/EmptyState";
import ErrorState from "./components/ErrorState";
import FanEvents from "./components/FanEvents";
import Hero from "./components/Hero";
import LoadingState from "./components/LoadingState";
import MatchCard from "./components/MatchCard";
import SpotlightCard from "./components/SpotlightCard";
import SystemStatus from "./components/SystemStatus";
import Ticker from "./components/Ticker";
import TrendPanel from "./components/TrendPanel";

import {
  fetchFanEvents,
  fetchMatchCastData,
} from "./api/matchCastApi";

import "./App.css";

const CATEGORIES = [
  "All",
  "Today",
  "Live",
  "Upcoming",
  "Final",
  "US Matches",
  "African",
  "Arab",
];

const showSystemStatus =
  import.meta.env.VITE_SHOW_SYSTEM_STATUS === "true";

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

function getMatchDateKey(match) {
  if (match.apiData?.date) {
    return match.apiData.date.slice(0, 10);
  }

  const catalogDate = String(
    match.apiData?.localDate || ""
  ).match(/^(\d{2})\/(\d{2})\/(\d{4})/);

  if (!catalogDate) {
    return null;
  }

  const [, month, day, year] = catalogDate;

  return `${year}-${month}-${day}`;
}

function matchesCategoryFilter(
  match,
  selectedCategory,
  today
) {
  switch (selectedCategory) {
    case "All":
      return true;

    case "Today":
      return getMatchDateKey(match) === today;

    case "Live":
      return match.status === "Live";

    case "Upcoming":
      return match.status === "Upcoming";

    case "Final":
      return match.status === "Final";

    case "US Matches":
      return matchIncludesTeam(
        match,
        US_TEAM_NAMES
      );

    case "Arab":
      return matchIncludesTeam(
        match,
        ARAB_TEAM_NAMES
      );

    case "African":
      return matchIncludesTeam(
        match,
        AFRICAN_TEAM_NAMES
      );

    default:
      return false;
  }
}

function normalizeFilterText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

const US_TEAM_NAMES = [
  "United States",
  "USA",
  "USMNT",
];

const ARAB_TEAM_NAMES = [
  "Algeria",
  "Egypt",
  "Iraq",
  "Jordan",
  "Morocco",
  "Qatar",
  "Saudi Arabia",
  "Tunisia",
];

const AFRICAN_TEAM_NAMES = [
  "Algeria",
  "Cape Verde",
  "Cabo Verde",
  "DR Congo",
  "Congo DR",
  "Democratic Republic of the Congo",
  "Egypt",
  "Ghana",
  "Ivory Coast",
  "Cote d'Ivoire",
  "Morocco",
  "Senegal",
  "South Africa",
  "Tunisia",
];

function matchIncludesTeam(match, teamNames) {
  const matchText = normalizeFilterText(
    [
      match.title,
      match.teams,
      match.apiData?.homeTeam?.name,
      match.apiData?.awayTeam?.name,
    ]
      .filter(Boolean)
      .join(" ")
  );

  return teamNames.some((teamName) =>
    matchText.includes(
      normalizeFilterText(teamName)
    )
  );
}

function getFanEventCityFromMatch(match) {
  if (!match?.city) {
    return "";
  }

  const city = match.city.toLowerCase();

  const cityAliases = {
    "east rutherford": "New York",
    "new york/new jersey": "New York",
    "new york / new jersey": "New York",
    "miami gardens": "Miami",
    "inglewood": "Los Angeles",
  };

  return cityAliases[city] || match.city;
}

function App() {
  // Data from MatchCast backend API
  const [coverageModules, setCoverageModules] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);

  // UI filters / selections
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMatch, setSelectedMatch] = useState(null);

  // App status
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    loadCoverageFeed({
      showLoading: true,
      resetSelectedMatch: true,
    });

    const refreshInterval = setInterval(() => {
      loadCoverageFeed({
        showLoading: false,
        resetSelectedMatch: false,
      });
    }, 60000);

    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    if (!selectedMatch) {
      loadFanEvents();
      return;
    }

    const city = getFanEventCityFromMatch(selectedMatch);

    if (!city) {
      loadFanEvents();
      return;
    }

    loadFanEvents({ city });
  }, [selectedMatch]);

  function loadCoverageFeed({
    showLoading = true,
    resetSelectedMatch = false,
  } = {}) {
    if (showLoading) {
      setIsLoading(true);
    }

    setHasError(false);

    fetchMatchCastData()
      .then((data) => {
        setCoverageModules(data.matches);
        setTrendingTopics(data.trendingTopics);

        setSelectedMatch((currentMatch) => {
          if (resetSelectedMatch || !currentMatch) {
            return data.matches[0] || null;
          }

          return (
            data.matches.find(
              (match) => match.id === currentMatch.id
            ) ||
            currentMatch ||
            data.matches[0] ||
            null
          );
        });
      })
      .catch((error) => {
        console.error(
          "Failed to load MatchCast coverage:",
          error
        );

        setHasError(true);
      })
      .finally(() => {
        if (showLoading) {
          setIsLoading(false);
        }
      });
  }

  async function loadFanEvents(filters = {}) {
    setFanEventsLoading(true);
    setFanEventsError(false);

    try {
      const data = await fetchFanEvents(filters);

      if (filters.city && data.events.length === 0) {
        const fallbackData = await fetchFanEvents();

        setFanEvents(fallbackData.events);
        setFanEventsContext(
          `Showing featured World Cup fan events while ${filters.city} event details are still being added.`
        );

        return;
      }

      setFanEvents(data.events);
      setFanEventsContext("");
    } catch (error) {
      console.error(
        "Failed to load fan events:",
        error
      );

      setFanEventsError(true);
    } finally {
      setFanEventsLoading(false);
    }
  }

  const filteredMatches = useMemo(() => {
    const today = getTodayDateKey();

    return coverageModules.filter((match) => {
      const normalizedSearch =
        searchTerm.toLowerCase();

      const matchesCategory =
        matchesCategoryFilter(
          match,
          selectedCategory,
          today
        );

      const matchesSearch =
        normalizedSearch === "" ||
        match.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        match.teams
          .toLowerCase()
          .includes(normalizedSearch) ||
        match.city
          .toLowerCase()
          .includes(normalizedSearch) ||
        match.category
          .toLowerCase()
          .includes(normalizedSearch) ||
        match.description
          .toLowerCase()
          .includes(normalizedSearch) ||
        (match.tags || []).some((tag) =>
          tag
            .toLowerCase()
            .includes(normalizedSearch)
        );

      const matchesTopic =
        selectedTopic === "" ||
        (selectedTopic === "Today"
          ? getMatchDateKey(match) === today
          : (match.tags || []).includes(
              selectedTopic
            ));

      return (
        matchesCategory &&
        matchesSearch &&
        matchesTopic
      );
    });
  }, [
    coverageModules,
    selectedCategory,
    selectedTopic,
    searchTerm,
  ]);

  const todayKey = getTodayDateKey();

  const liveMatches = coverageModules.filter(
    (match) => match.status === "Live"
  );

  const todayMatches = coverageModules.filter(
    (match) =>
      getMatchDateKey(match) === todayKey
  );

  const upcomingMatches = coverageModules
    .filter(
      (match) => match.status === "Upcoming"
    )
    .slice(0, 4);

  const tickerMatches =
    liveMatches.length > 0
      ? liveMatches
      : todayMatches.length > 0
        ? todayMatches
        : upcomingMatches;

  const tickerMode =
    liveMatches.length > 0
      ? "live"
      : todayMatches.length > 0
        ? "today"
        : "upcoming";

  const [fanEvents, setFanEvents] =
    useState([]);

  const [
    fanEventsLoading,
    setFanEventsLoading,
  ] = useState(true);

  const [
    fanEventsError,
    setFanEventsError,
  ] = useState(false);

  const [
    fanEventsContext,
     setFanEventsContext
  ] = useState("");

  const fanEventCity = selectedMatch
    ? getFanEventCityFromMatch(selectedMatch)
    : "";

  const fanEventsTitle =
    selectedMatch && fanEventCity
      ? `Fan Events for ${fanEventCity}`
      : "Featured Fan Festivals & Events";

  const fanEventsDescription =
    selectedMatch && fanEventCity
      ? `Verified fan festivals and public viewing experiences connected to ${selectedMatch.title}.`
      : "Verified public viewing experiences, official fan festivals, and host-city celebrations.";
      

  function handleRetryFeed() {
    loadCoverageFeed();
  }

  function handleSearchChange(value) {
    setSearchTerm(value);
    setSelectedTopic("");
  }

  function handleSelectCategory(category) {
    setSelectedCategory(category);
    setSearchTerm("");
    setSelectedTopic("");
  }

  function handleTopicSelect(topic) {
    const cleanTopic = topic.replace("#", "");

    setSelectedTopic(cleanTopic);
    setSearchTerm("");
    setSelectedCategory("All");
  }

  function handleResetFilters() {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedTopic("");
  }

  function handleViewUSMatches() {
    const usMatch = coverageModules.find(
      (match) => match.isUSMatch
    );

    setSelectedCategory("US Matches");
    setSearchTerm("");
    setSelectedTopic("");

    if (usMatch) {
      setSelectedMatch(usMatch);
    }
  }

  function handleViewTodayMatches() {
    const today = getTodayDateKey();

    const todayMatch = coverageModules.find(
      (match) =>
        getMatchDateKey(match) === today
    );

    setSelectedCategory("Today");
    setSearchTerm("");
    setSelectedTopic("");

    if (todayMatch) {
      setSelectedMatch(todayMatch);
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-section">
        <Hero
          onViewUSMatches={handleViewUSMatches}
          onViewTodayMatches={handleViewTodayMatches}
        />

        <SpotlightCard selectedMatch={selectedMatch} />
      </section>

      <Ticker
        matches={tickerMatches}
        mode={tickerMode}
        onSelectMatch={setSelectedMatch}
      />

      <section className="dashboard-layout">
        <section className="main-panel">
          <DashboardControls
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
          />

          <CategoryTabs
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
          />

          <ActiveFilters
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            selectedTopic={selectedTopic}
            onReset={handleResetFilters}
          />

          {isLoading ? (
            <LoadingState />
          ) : hasError ? (
            <ErrorState onRetry={handleRetryFeed} />
          ) : filteredMatches.length > 0 ? (
            <section className="match-grid">
              {filteredMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  selectedMatch={selectedMatch}
                  onSelectMatch={setSelectedMatch}
                />
              ))}
            </section>
          ) : (
            <EmptyState
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
              onReset={handleResetFilters}
            />
          )}
        </section>

        <aside className="side-panel">
          <CoverageSummary coverageModules={coverageModules} />

          {showSystemStatus && <SystemStatus />}

          <TrendPanel
            trendingTopics={trendingTopics}
            onTopicSelect={handleTopicSelect}
          />

          <FanEvents
            title={fanEventsTitle}
            description={fanEventsDescription}
            contextLabel={fanEventsContext}
            onShowAll={
              selectedMatch
                ? () => {
                    setSelectedMatch(null);
                    loadFanEvents();
                  }
                : null
            }
            events={fanEvents}
            isLoading={fanEventsLoading}
            hasError={fanEventsError}
            onRetry={() =>
              selectedMatch && fanEventCity
                ? loadFanEvents({ city: fanEventCity })
                : loadFanEvents()
            }
          />
        </aside>
      </section>
    </main>
  );
}

export default App;