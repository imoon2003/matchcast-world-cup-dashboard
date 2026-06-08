function TrendPanel({ trendingTopics, onTopicSelect }) {
  return (
    <section className="trend-panel">
      <p className="eyebrow">Signal Tags</p>
      <h2>Coverage Topics</h2>

      <div className="topic-list">
        {trendingTopics.map((topic) => (
          <button
            key={topic}
            aria-label={`Filter by coverage topic ${topic}`}
            onClick={() => onTopicSelect(topic)}
          >
            {topic}
          </button>
        ))}
      </div>
    </section>
  );
}

export default TrendPanel;