## Steam Wishlist Discount Monitor Plugin

<img width="489" height="255" alt="1Capture_2025-10-03_21 59 33" src="https://github.com/user-attachments/assets/756f4b89-b847-41b3-9a34-1310266beccc" />

Automatically checks your Steam wishlist for game discounts every 30 minutes and reminds you in the calendar when games are on sale.

### Features

- **Automatic Monitoring**: Automatically checks wishlist game discount information every 30 minutes
- **Real-time Pricing**: Shows original price, current price, and discount percentage
- **Live Tracking**: Displays current discount status in real-time
- **Color Coding**: Uses different colors based on discount intensity (dark red 75%+, orange 50%+, yellow 25%+, blue for small discounts)
- **Calendar Integration**: Directly displays discounted games in your calendar

### Configuration

| Parameter | Type | Description |
|-----------|------|-------------|
| `steam_id` | text | **Required**, Your Steam username (e.g., maozhijie) |

### How to Get and Configure Steam Username

1. **Get Username**
   - Log in to Steam and go to your profile page
   - Check the username in the URL: `https://steamcommunity.com/id/your-username`

2. **Set Wishlist to Public**
   - Go to Profile → Edit Profile → Privacy Settings
   - Set "Wishlist" to "Public"

3. **Fill in Configuration**
   - Enter the username in the plugin's `steam_id` configuration field

### Display Format

```
Game Name (-Discount Percentage%)

Original Price: ¥ 298.00
Current Price: ¥ 104.30
Discount: -65%
```

### Changelog

#### v0.0.1

- Initial release
- Implemented automatic 30-minute wishlist discount checking
- Support for username format Steam ID
- Display complete discount time information
- Color coding system based on discount intensity
