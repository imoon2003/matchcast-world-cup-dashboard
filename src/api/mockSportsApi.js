import { matches, trendingTopics } from "../data/matches";

export function fetchMatchCastData(shouldFail = false) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error("Failed to load MatchCast coverage feed"));
        return;
      }

      resolve({
        matches,
        trendingTopics,
        lastUpdated: new Date().toISOString(),
      });
    }, 1200);
  });
}
