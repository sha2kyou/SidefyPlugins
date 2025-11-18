## Unsplash Daily Photo Plugin

Brings you three beautiful, themed photography works at three fixed times every day to enhance your calendar view.

### Features

- **Daily Updates**: Automatically updates with three brand new images every day.
- **Fixed Schedule**: Images remain fixed throughout the day, displaying at 10 AM, 1 PM, and 6 PM respectively.
- **Diverse Themes**: Selects three different themes daily (such as nature, city, technology, animals, etc.) to ensure rich and varied content.
- **High-Resolution Wallpapers**: Click events to jump directly to Unsplash pages for downloading high-resolution original images.

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

#### v0.1.0

- Initial release
- Implemented daily display of three images with different themes at fixed times
- 24-hour caching mechanism
