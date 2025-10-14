# SideCalendar Plugin Contribution Guide

[English](README.md) | [中文](README_ZH.md)

>[!WARNING]
>Disclaimer: Community plugins are provided by third parties. SideCalendar is not responsible for their security. Users should verify and evaluate plugins themselves.

## 📁 File Structure

```
// Directory name, also serves as the unique plugin ID in the client
your-plugin-name/
    ├── main.js # Plugin code
    ├── info.json # Plugin metadata
    └── README.md # Documentation
```

## info.json

```json
{
  "name": "Bilibili User Videos",
  "description": "Track the latest video uploads from specified Bilibili content creators, displaying video titles, view counts, and publish times in real-time",
  // Plugin version, client will show update notification after updates
  "version": "0.1.0",
  "author": "sha2kyou",
  // Minimum supported SideCalendar version, clients below this version cannot download the plugin
  "min_support_app_version": "2025.3.0",
  "tags": ["bilibili", "video", "content creator", "social media"],
  "category": "Social Media",
  // Config parameters will be automatically mapped to corresponding input fields after plugin download
  "config_options": {
    "mid": {
      "type": "string",
      "default": "",
      "description": "Bilibili user ID (mid parameter)"
    },
    "pageSize": {
      "type": "number",
      "default": 10,
      "description": "Number of videos to fetch per request"
    }
  },
  // Without proper permissions, corresponding operations cannot be performed. Default is false if not configured
  "requirements": {
    // Network permission: single request timeout limited to 30 seconds
    "network": true,
    // Storage permission: maximum 16k data storage, up to 5 entries
    "storage": true,
    // AI permission: uses user-configured LLM capabilities in advanced settings, limited to 5 requests per 5 minutes, 30-second timeout per request
    "ai": false
  }
}
```

## main.js

Must include the `fetchEvents` function (see [bilibili_user_videos](https://github.com/sha2kyou/SideCalendarPlugins/tree/main/bilibili_user_videos) for reference):

```javascript
function fetchEvents(config) {
  var events = [];

  try {
    // Your business logic
    events.push({
      title: "Event Title",
      startDate: "2024-01-01T10:00:00Z", // Required, ISO8601 format
      endDate: "2024-01-01T11:00:00Z", // Required, ISO8601 format
      color: "#FF5733", // Required, hexadecimal color
      notes: "Detailed description", // Optional
      icon: "https://example.com/icon.png", // Optional
      isAllDay: false, // Required
      isPointInTime: true, // Required
      href: "https://example.com", // Optional, click to navigate. Supports http/https/popup (custom protocol, displays text in macOS popup on click)
    });
  } catch (err) {
  }

  return events;
}
```

## Submission Steps

1. Fork this repository
2. Edit code in SideCalendar's custom plugin code editor
3. Test plugin functionality in SideCalendar
4. Create plugin folder and files in the repository
5. Submit a Pull Request

>[!WARNING]
>For more API documentation, please check the custom plugin editor documentation page within the SideCalendar app

## Checklist

- Plugin tested successfully in SideCalendar
- Includes complete error handling
- Submitted plugin directory structure is correct
- info.json information is complete and accurate
- README.md instructions are clear
- Code comments are appropriate
