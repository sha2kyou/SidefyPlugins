## Unsplash Daily Photo Plugin

Brings you one beautiful, popular photo from Unsplash homepage every day, displayed as an all-day event to enhance your calendar view.

### Features

- **Daily Updates**: Automatically updates with one brand new popular photo every day.
- **All-Day Event**: Photo is displayed at 0:00 as an all-day event for better visibility.
- **Popular Selection**: Fetches popular photos from Unsplash to showcase high-quality, trending images.
- **High-Resolution Wallpapers**: Click event to jump directly to Unsplash page for downloading high-resolution original image.

### Configuration

| Parameter     | Type     | Description                                |
|---------------|----------|--------------------------------------------|
| `access_key`  | password | **Required**, Your Unsplash API access key. |

### How to Get Unsplash API Access Key

1.  **Register/Login to Unsplash**
    Visit [unsplash.com](https://unsplash.com/) and register for a free account.

2.  **Visit Developer Page**
    After logging in, visit [unsplash.com/developers](https://unsplash.com/developers).

3.  **Create New Application**
    - Click "Your apps".
    - Click "New Application".
    - Accept all API terms of use.
    - Fill in application name (any name, such as `SideCalendarPlugin`) and description.
    - Click "Create application".

4.  **Get Key**
    - On your application page, scroll down to the "Keys" section.
    - Copy the long string under the "Access Key" field.

5.  **Paste Key**
    Paste the copied Access Key into the `access_key` configuration field of this plugin.

### Changelog

#### v0.2.0

- **Breaking Change**: Simplified from 3 photos to 1 photo per day
- Changed display from specific time slots (10 AM, 1 PM, 6 PM) to all-day event at 0:00
- Now fetches popular photos instead of themed random photos
- Improved caching mechanism for better performance

#### v0.1.0

- Initial release
- Implemented daily display of three images with different themes at fixed times
- 24-hour caching mechanism
