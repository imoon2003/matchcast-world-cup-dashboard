function formatTopicLabel(topic) {
  const cleanTopic = topic.replace("#", "");

  const customLabels = {
    USMNT: "US Matches",
    WorldCup2026: "World Cup 2026",
  };

  if (customLabels[cleanTopic]) {
    return customLabels[cleanTopic];
  }

  if (/^Group[A-L]$/.test(cleanTopic)) {
    return cleanTopic.replace(
      "Group",
      "Group "
    );
  }

  return cleanTopic.replace(
    /([a-z])([A-Z])/g,
    "$1 $2"
  );
}

function TrendPanel({
  trendingTopics,
  onTopicSelect,
}) {
  return (
    <section className="trend-panel">
      <p className="eyebrow">Quick Filters</p>
      <h2>Match Topics</h2>

      {trendingTopics.length > 0 ? (
        <div className="topic-list">
          {trendingTopics.map((topic) => (
            <button
              type="button"
              key={topic}
              aria-label={`Filter by ${formatTopicLabel(
                topic
              )}`}
              onClick={() =>
                onTopicSelect(topic)
              }
            >
              #
              {formatTopicLabel(topic)}
            </button>
          ))}
        </div>
      ) : (
        <p className="topic-empty">
          No active topics available.
        </p>
      )}
    </section>
  );
}

export default TrendPanel;