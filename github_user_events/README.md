## GitHub User Events Plugin

Fetch public activity events for a specified GitHub user, including pushes, forks, stars, issues, PRs, and other activities.

### Features

- Personalized: Specify any GitHub username
- Token Support: Optional GitHub Token for higher API rate limits
- Multiple Events: Support for Push, Fork, Star, Issue, PR, Release and other events
- Color Differentiation: Different colors for different event types
- Smart Caching: 15-minute cache to reduce API calls
- Direct Navigation: Click events to jump directly to corresponding GitHub pages

### Configuration

#### Required Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| username | string | GitHub username | octocat |

#### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| token | password | - | GitHub Personal Access Token |
| limit | number | "10" | Number of events to fetch (1-100) |

### How to Get GitHub Token

1. Go to GitHub Settings > Personal access tokens
2. Click "Generate new token"
3. Select permissions (reading public repositories is sufficient)
4. Copy the generated token

### Supported Event Types

- Push Events: Code pushes
- Create Events: Create branches, tags, repositories
- Delete Events: Delete branches, tags
- Fork Events: Fork repositories
- Watch Events: Star repositories
- Issues Events: Create, close issues
- Pull Request Events: Create, merge PRs
- Release Events: Publish new releases
- Other Events: Make repositories public, add collaborators, etc.

### Changelog

#### v0.0.1

- Initial release
- Support for basic GitHub event fetching and display
- 15-minute smart caching mechanism