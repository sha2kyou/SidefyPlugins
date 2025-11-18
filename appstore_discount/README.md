# AppStore Discount Monitor Plugin

## Description

Monitor App Store app prices and get calendar notifications when prices drop below your configured reference price. Perfect for tracking apps you want to purchase at a lower price.

## Features

- Monitor multiple apps across different regions
- Custom reference prices for precise discount tracking
- Color-coded discounts (blue for small, yellow for medium, orange for large, red for huge)
- Creates calendar events when prices drop
- Multi-region support (US, China, Japan, UK, etc.)
- Smart caching reduces API calls (refreshes daily)
- Full internationalization support

## Configuration

### Required Parameter

**app_data**: App monitoring data

- Format: `AppID_Region_ReferencePrice`
- Example: `12345_us_68.00,2736473_cn_38.00,9876543_jp_500`
- Multiple apps separated by commas
- Each entry must include:
  - **AppID**: The App Store app ID
  - **Region**: Two-letter country code (us, cn, jp, uk, etc.)
  - **ReferencePrice**: Known regular price/reference price (numbers only, no currency symbols)

## How to Find App ID

1. Open the App Store and find the app you want to monitor
2. Copy the app's URL (e.g., `https://apps.apple.com/us/app/example-app/id1234567890`)
3. The numbers after `id` are the app ID (e.g., `1234567890`)

## How to Determine Reference Price

Since the iTunes API doesn't provide discount information, you need to manually configure the reference price:

1. Check the app's regular price during non-promotional periods
2. Or use your "target price" that you consider worth buying
3. When the current price drops below this value, the plugin will notify you

## Configuration Example

```json
{
  "app_data": "1234567890_us_9.99,9876543210_cn_68.00,5555555555_jp_1200"
}
```

This will monitor:
- App `1234567890` in US region, reference price $9.99
- App `9876543210` in China region, reference price ¥68.00
- App `5555555555` in Japan region, reference price ¥1200

## How It Works

1. The plugin checks configured app prices every 30 minutes
2. Compares current price with your configured reference price
3. If current price < reference price: Creates a calendar event with discount percentage
4. Events include app screenshots (randomly selected), price details, and direct App Store links
5. Cache expires daily to ensure fresh data

## Discount Color Coding

- Blue (0-24%): Small discount
- Yellow (25-49%): Medium discount
- Orange (50-74%): Large discount
- Red (75%+): Huge discount

## Important Notes

Due to App Store API limitations, we cannot automatically retrieve an app's "official original price" or "historical highest price." The iTunes API only provides the current price and doesn't tell us if an app is on sale.

Therefore, you need to:
1. Record the app's regular price when it's not on discount
2. Or set a "mental price point" based on your willingness to buy
3. Periodically check and update reference prices in your configuration (if apps get permanent price cuts)

While this approach requires some manual setup, it provides the most reliable and accurate discount tracking.
