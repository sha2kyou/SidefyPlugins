## GitHub Notifications Plugin

Fetch GitHub notifications and subscription information, including @mentions, issue assignments, PR review requests, and more, displaying them in Sidefy.

### Features

- Fetch GitHub notifications (@mentions, assignments, review requests, etc.)
- Support for filtering specific notification types
- Smart caching to reduce API calls
- Different colors for different notification types
- Click notifications to jump directly to corresponding pages
- Support for participating mode and all notifications mode

### Supported Notification Types

| Type | Description | Color | Default Enabled |
|------|-------------|-------|-----------------|
| mention | @mention | Red | Yes |
| assign | Issue/PR assigned to you | Cyan | Yes |
| review_requested | Review request | Blue | Yes |
| subscribed | You subscribed to this content | Green | No |
| team_mention | Team was mentioned | Yellow | No |
| author | You are the author | Purple | No |
| manual | Manual subscription | Light Green | No |

### Configuration

#### Required Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| token | password | GitHub Personal Access Token | ghp_xxxxxxxxxxxxxxxxxxxx |

#### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 20 | Number of notifications to fetch (1-50) |
| showParticipating | boolean | false | Show participating notifications only |
| showAll | boolean | true | Show all notifications including repository subscriptions |
| notificationTypes | string | empty | Notification type filter, comma-separated (empty means show all) |

### How to Get GitHub Token

1. Go to GitHub Settings > Personal access tokens
2. Click "Generate new token"
3. Select permissions (notifications permission required)
4. Copy the generated token

### Notification Type Configuration

You can configure the following types in the `notificationTypes` parameter (comma-separated):

- mention: You were @mentioned
- assign: You were assigned to something
- review_requested: You were requested to review
- author: You are the author
- subscribed: You subscribed to this content
- team_mention: Your team was mentioned
- manual: Manual subscription

### Changelog

#### v0.1.0

- Initial release
- Support for fetching GitHub notifications
- Support for multiple notification type filtering
- 10-minute smart caching mechanism
- Color differentiation for different notification types