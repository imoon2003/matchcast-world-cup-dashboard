function CoverageSummary({
  coverageModules = [],
}) {
  const totalMatches =
    coverageModules.length;

  const liveMatches =
    coverageModules.filter(
      (match) => match.status === "Live"
    ).length;

  const upcomingMatches =
    coverageModules.filter(
      (match) => match.status === "Upcoming"
    ).length;

  const finalMatches =
    coverageModules.filter(
      (match) => match.status === "Final"
    ).length;

  const summaryStats = [
    {
      label: "Matches",
      value: totalMatches,
      detail: "shown on dashboard",
    },
    {
      label: "Live",
      value: liveMatches,
      detail: "currently in progress",
    },
    {
      label: "Upcoming",
      value: upcomingMatches,
      detail: "scheduled fixtures",
    },
    {
      label: "Final",
      value: finalMatches,
      detail: "completed results",
    },
  ];

  return (
    <section
      className="summary-panel"
      aria-label="Match coverage summary"
    >
      <p className="eyebrow">
        Control Snapshot
      </p>

      <h2>Coverage Room Status</h2>

      <div className="summary-grid">
        {summaryStats.map((stat) => (
          <div
            className="summary-stat"
            key={stat.label}
          >
            <span>{stat.label}</span>

            <strong>{stat.value}</strong>

            <p>{stat.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default CoverageSummary;