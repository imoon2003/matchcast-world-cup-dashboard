# MatchCast: World Cup Command Center

MatchCast is a React-based World Cup coverage dashboard designed to simulate how a live sports media team could monitor tournament storylines, host-city activity, fan engagement, match windows, and priority coverage signals from one command view.

The project uses realistic mock sports data and a mock API layer to demonstrate frontend patterns commonly used in production applications, including data-driven UI, loading states, error handling, filtering, responsive layouts, and reusable React components.

![MatchCast Dashboard Overview](screenshots/01-dashboard-overview.png)

## Overview

MatchCast was built as a polished frontend portfolio project focused on live sports media and event coverage. The dashboard allows users to explore coverage modules, filter signals by category or topic, select cards to update a spotlight panel, and interact with an audience pulse poll.

The project currently uses mock/static World Cup coverage data to keep the experience stable and reviewable, while still modeling the structure of a real data-driven application.

## Features

* Responsive React dashboard built with Vite
* Mock API layer for simulated coverage feed retrieval
* Loading, empty, and error-state handling
* Search across teams, cities, categories, descriptions, and tags
* Category filtering for matchday, host city, team spotlight, interactive, and storyline modules
* Signal tag filtering for topics such as *#USMNT*, *#HostCities*, *#Final*, and *#Mexico*
* Active filters bar with clear-filter behavior
* Dynamic spotlight module that updates based on the selected coverage card
* Interactive audience poll with live vote percentage updates
* Coverage summary panel with calculated dashboard metrics
* Keyboard-accessible match cards with visible focus states
* Mobile-responsive layout with stacked sections for smaller screens

## Screenshots

### Dashboard Overview

![Dashboard Overview](screenshots/01-dashboard-overview.png)

### Coverage Operations Feed

![Coverage Operations Feed](screenshots/02-coverage-feed.png)

### Filtered Coverage Signals

![Filtered Coverage Signals](screenshots/03-filtered-signals.png)

### Mobile Responsive View

![Mobile Responsive View](screenshots/04-mobile-responsive.png)

## Tech Stack

* React
* Vite
* JavaScript
* CSS
* CSS Grid
* Flexbox
* Mock API data layer

## Project Structure

```text
matchcast-world-cup-dashboard/
├── public/
│   ├── images/
│   └── favicon.svg
├── screenshots/
│   ├── 01-dashboard-overview.png
│   ├── 02-coverage-feed.png
│   ├── 03-filtered-signals.png
│   └── 04-mobile-responsive.png
├── src/
│   ├── api/
│   │   └── mockSportsApi.js
│   ├── components/
│   │   ├── ActiveFilters.jsx
│   │   ├── CategoryTabs.jsx
│   │   ├── CoverageSummary.jsx
│   │   ├── DashboardControls.jsx
│   │   ├── EmptyState.jsx
│   │   ├── ErrorState.jsx
│   │   ├── FanPoll.jsx
│   │   ├── Hero.jsx
│   │   ├── LoadingState.jsx
│   │   ├── MatchCard.jsx
│   │   ├── SpotlightCard.jsx
│   │   ├── Ticker.jsx
│   │   └── TrendPanel.jsx
│   ├── data/
│   │   └── matches.js
│   ├── App.css
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
└── README.md
```

## Getting Started

Clone the repository:

```bash
git clone https://github.com/your-username/matchcast-world-cup-dashboard.git
cd matchcast-world-cup-dashboard
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open the local URL shown in the terminal. It is usually:

```text
http://localhost:5173/
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Mock Data Approach

MatchCast currently uses realistic mock sports data instead of a live sports API. This keeps the project stable for portfolio review while still demonstrating frontend patterns used in real-world applications.

The mock API layer supports:

* simulated feed retrieval
* loading state handling
* empty state handling
* error state handling
* retry behavior
* derived dashboard metrics
* reusable data-driven components

A future version could connect the mock API layer to a real sports data API.

## Accessibility

MatchCast includes several accessibility-focused improvements:

* keyboard-accessible match cards
* visible focus states
* screen-reader labels for interactive elements
* status handling for loading, empty, and error states
* semantic HTML sections for dashboard content

## Future Improvements

* Connect to a real sports data API
* Add live countdown timers for match windows
* Add saved or favorite coverage modules
* Add dedicated team and host-city detail pages
* Add unit tests for filtering and component behavior
* Add route-based navigation with React Router

## Disclaimer

This project is a personal portfolio project and is not affiliated with FIFA or any official World Cup organization. Images and data are used for demonstration purposes only.
