function CoverageSummary({ coverageModules }) {
  const totalModules = coverageModules.length;

  const highPriorityCount = coverageModules.filter(
    (module) => module.priority === "High"
  ).length;

  const activeSignals = coverageModules.filter((module) =>
    ["Trending", "Hot"].includes(module.status)
  ).length;

  const averageFanHeat =
    totalModules > 0
      ? Math.round(
          coverageModules.reduce((sum, module) => sum + module.fanScore, 0) /
            totalModules
        )
      : 0;

  const summaryStats = [
    {
      label: "Signals",
      value: totalModules,
      detail: "coverage modules",
    },
    {
      label: "Priority",
      value: highPriorityCount,
      detail: "producer alerts",
    },
    {
      label: "Active",
      value: activeSignals,
      detail: "hot or trending",
    },
    {
      label: "Fan Heat",
      value: `${averageFanHeat}%`,
      detail: "average signal",
    },
  ];

  return (
    <section className="summary-panel" aria-label="Live coverage summary">
      <p className="eyebrow">Control Snapshot</p>
      <h2>Coverage Room Status</h2>

      <div className="summary-grid">
        {summaryStats.map((stat) => (
          <div className="summary-stat" key={stat.label}>
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