# Universal Web Monitor

This plugin allows you to monitor any webpage and extract specific information using AI.

## Configuration

| Parameter | Type | Default | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| **Target URL** | string |  | The full URL of the webpage you want to monitor. | `https://news.ycombinator.com/` |
| **AI Prompt** | textarea |  | Instructions for AI: What information to extract. | `Summarize the top 3 news headlines.` |
| **Update Interval** | number | `6` | How often (in hours) the plugin should check the webpage. | `1` |

## Examples

| Scenario | Target URL | AI Prompt |
| :--- | :--- | :--- |
| **News Summary** | `https://news.ycombinator.com/` | `Summarize the top 3 news headlines.` |
| **Price Monitor** | `[Product Page URL]` | `Check if the price is below $50. If yes, say 'Price Drop!', otherwise say 'No change'.` |
| **Job Hunting** | `[Job Board URL]` | `List all new job postings for 'React Developer'.` |
| **Feature Tracking** | `https://sidefyapp.com/pricing/` | `Summarize the features of the Pro plan.` |

## Features

*   **Universal Crawling**: Uses `sidefy.crawler` to fetch content from most webpages.
*   **AI Extraction**: Uses `sidefy.ai` to understand and extract structured data or summaries from unstructured web content.
*   **Smart Caching**: Caches results based on your update interval to save resources.

## Notes

*   The plugin truncates very long webpages to avoid AI token limits.
*   Dynamic pages (heavy JS) are supported by the crawler, but extremely complex apps might need specific handling.
*   **Troubleshooting**: If you are unable to fetch any data, please try disabling **Fast Mode** under **Advanced Settings -> Jina**.
