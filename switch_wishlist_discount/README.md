## Nintendo Switch Wishlist Discount Monitor Plugin (Japan Region)

<img width="486" height="370" alt="1Capture_2025-10-03_22 14 53" src="https://github.com/user-attachments/assets/a2b6c7a0-b140-4044-a19c-33fb75ddd807" />

Monitor your Nintendo Switch wishlist games for discount information (Japan eShop only), and get calendar notifications when games are on sale.

### Features

- **Wishlist Monitoring**: Monitor specified game ID lists and automatically alert when games are discounted
- **Real-time Pricing**: Display original price, current price, and discount percentage (Japanese Yen)
- **Game Information**: Automatically fetch game names and cover images
- **Color Coding**: Use different colors based on discount intensity (dark red 75%+, orange 50%+, yellow 25%+, blue for small discounts)
- **Calendar Integration**: Display discounted games directly in calendar, click to jump to Japanese eShop for purchase
- **Smart Cleanup**: Automatically handle game ID format (remove letter prefixes, etc.)

### Configuration

| Parameter | Type | Description |
|-----------|------|-------------|
| `game_ids` | text | **Required**, List of game IDs (NSUID) to monitor, separated by commas, **maximum 10 games supported** |

**Configuration Example**:
```
70010000063514,D70010000027619,70010000048494
```

**Important Notes**:
- If you enter more than 10 game IDs, the plugin will only monitor the first 10
- Game names, cover images, and device compatibility information are automatically fetched from the Japanese store

### How to Get Game ID (NSUID)

#### Method 1: Get from Japanese eShop Website

1. Visit Nintendo Japan eShop: `https://ec.nintendo.com/JP/ja/`
2. Search for the game you want to monitor
3. Go to the game details page and check the URL
4. The numbers after `/titles/` in the URL are the game ID

**Example**:
```
URL: https://store-jp.nintendo.com/item/software/D70010000095202
Game ID (NSUID): D70010000063514
```

### Game ID Format Guide

- ✅ **Correct Format**: 14-digit pure numbers, like `70010000063514`
- ✅ **Auto Cleanup**: Plugin automatically removes letter prefixes, like `D70010000063514` → `70010000063514`
- ⚠️ **All Switch game IDs start with `70010000`**

### Display Format

```
Game Name (-Discount Percentage%)

Original Price: ¥7,678
Current Price: ¥4,980
Discount: -35%
Compatible: Switch/Switch 2
```

**Device Compatibility Display**:
- `Switch` - Supports Nintendo Switch only
- `Switch 2` - Supports Nintendo Switch 2 only
- `Switch/Switch 2` - Supports both devices

### Technical Specifications

- **Supported Region**: Japan eShop (JP) only
- **Monitoring Limit**: Maximum 10 games
- **Cache Duration**: 2 hours (reduces API requests)
- **Data Sources**:
  - Price Information: Nintendo Japan official price API
  - Game Information: Japanese store page (og:title, og:image)
  - Device Compatibility: Store page JSON configuration
- **Currency**: Japanese Yen (JPY)

### FAQ

**Q: Why aren't game names and cover images displayed?**
A: Some games might not have detailed information available in the search API, showing "Game ID: xxxxx" as the title, but this doesn't affect price monitoring functionality.

**Q: What happens if I enter the wrong game ID?**
A: The plugin automatically skips invalid game IDs without affecting other game monitoring.

**Q: How many games can I monitor?**
A: Maximum 10 games supported. If you enter more than 10 IDs, the plugin will only monitor the first 10.

**Q: Are other regions supported?**
A: Current version only supports the Japan region.

**Q: Why is my ID in D70010000xxxxx format?**
A: Some third-party tools might add letter prefixes. The plugin automatically cleans them up, so you can enter them directly.

### Changelog

#### v0.0.1

- Initial release
- Support for Japan region wishlist game discount monitoring
- Automatic game name and cover image fetching
- Display complete discount information (original/current price/discount)
- Color coding system based on discount intensity
- Smart game ID format cleanup
