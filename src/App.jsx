import { useEffect, useMemo, useState } from "react";
import ActiveFilters from "./components/ActiveFilters";
import CategoryTabs from "./components/CategoryTabs";
import CoverageSummary from "./components/CoverageSummary";
import DashboardControls from "./components/DashboardControls";
import EmptyState from "./components/EmptyState";
import ErrorState from "./components/ErrorState";
import FanPoll from "./components/FanPoll";
import Hero from "./components/Hero";
import LoadingState from "./components/LoadingState";
import MatchCard from "./components/MatchCard";
import SpotlightCard from "./components/SpotlightCard";
import Ticker from "./components/Ticker";
import TrendPanel from "./components/TrendPanel";
import { fetchMatchCastData } from "./api/mockSportsApi";
import "./App.css";

const CATEGORIES = [
  "All",
  "Matchday",
  "Host City",
  "Team Spotlight",
  "Interactive",
  "Storyline",
];

const INITIAL_POLL_VOTES = {
  Brazil: 34,
  USA: 27,
  France: 22,
  Argentina: 17,
};

function App() {
  // Data from mock API
  const [coverageModules, setCoverageModules] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  // UI filters / selections
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMatch, setSelectedMatch] = useState(null);

  // App status
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Interactive widget state
  const [pollVotes, setPollVotes] = useState(INITIAL_POLL_VOTES);

  useEffect(() => {
    loadCoverageFeed();
  }, []);

  function loadCoverageFeed() {
    setIsLoading(true);
    setHasError(false);

    fetchMatchCastData()
      .then((data) => {
        setCoverageModules(data.matches);
        setTrendingTopics(data.trendingTopics);
        setSelectedMatch(data.matches[0] || null);
        setLastUpdated(data.lastUpdated);
      })
      .catch(() => {
        setHasError(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  const filteredMatches = useMemo(() => {
    return coverageModules.filter((match) => {
      const normalizedSearch = searchTerm.toLowerCase();

      const matchesCategory =
        selectedCategory === "All" || match.category === selectedCategory;

      const matchesSearch =
        normalizedSearch === "" ||
        match.title.toLowerCase().includes(normalizedSearch) ||
        match.teams.toLowerCase().includes(normalizedSearch) ||
        match.city.toLowerCase().includes(normalizedSearch) ||
        match.category.toLowerCase().includes(normalizedSearch) ||
        match.description.toLowerCase().includes(normalizedSearch) ||
        (match.tags || []).some((tag) =>
          tag.toLowerCase().includes(normalizedSearch)
        );

      const matchesTopic =
        selectedTopic === "" || (match.tags || []).includes(selectedTopic);

      return matchesCategory && matchesSearch && matchesTopic;
    });
  }, [coverageModules, selectedCategory, selectedTopic, searchTerm]);

  const totalVotes = Object.values(pollVotes).reduce(
    (sum, votes) => sum + votes,
    0
  );

  function handleVote(team) {
    setPollVotes({
      ...pollVotes,
      [team]: pollVotes[team] + 1,
    });
  }

  function handleRetryFeed() {
    loadCoverageFeed();
  }

  function handleViewUSMNTPulse() {
    const usmntModule =
      coverageModules.find((match) => match.tags?.includes("USMNT")) ||
      coverageModules[1];

    if (!usmntModule) {
      return;
    }

    setSelectedMatch(usmntModule);
    handleResetFilters();
  }

  function handleFilterHostCities() {
    setSelectedCategory("Host City");
    setSearchTerm("");
    setSelectedTopic("");
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

  return (
    <main className="app-shell">
      <section className="hero-section">
        <Hero
          onViewUSMNT={handleViewUSMNTPulse}
          onFilterHostCities={handleFilterHostCities}
        />

        <SpotlightCard selectedMatch={selectedMatch} />
      </section>

      <Ticker />

      <section className="dashboard-layout">
        <section className="main-panel">
          <DashboardControls
            searchTerm={searchTerm}
            lastUpdated={lastUpdated}
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

          <FanPoll
            pollVotes={pollVotes}
            totalVotes={totalVotes}
            onVote={handleVote}
          />

          <TrendPanel
            trendingTopics={trendingTopics}
            onTopicSelect={handleTopicSelect}
          />
        </aside>
      </section>
    </main>
  );
}

export default App;