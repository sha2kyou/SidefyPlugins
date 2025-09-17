/**
 * Unsplash 每日图片插件
 * 每天在早10点、中午1点、下午6点，展示三张不同主题的精美图片。
 */
function fetchEvents(config) {
    // 检查 API 访问密钥是否存在
    var accessKey = config.access_key;
    if (!accessKey || accessKey.trim() === "") {
        throw new Error("请在插件配置中填入您的 Unsplash API 访问密钥 (Access Key)。");
    }

    // --- 每日缓存逻辑 ---
    var today = new Date();
    var dateString = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
    var cacheKey = "unsplash_daily_theme_" + dateString;

    var cachedData = sdcl.storage.get(cacheKey);
    if (cachedData) {
        return cachedData;
    }

    // --- 每日主题与图片获取逻辑 ---
    var events = [];
    try {
        // 定义时间点和主题列表
        var displayHours = [10, 13, 18];
        var themes = [
            "Nature", "Wallpapers", "Travel", "Architecture", "Animals", "Street Photography",
            "Textures & Patterns", "Film", "Food & Drink", "People", "Business & Work",
            "Technology", "Art & Culture", "History", "Fashion", "Interiors", "Health & Wellness",
            "Spirituality", "Experimental", "Sports", "Cars", "Water", "Sky", "Forest", "City",
            "Minimalism", "Abstract", "Space", "Mountains", "Beach", "Music"
        ];

        // 根据日期选择三个不同的主题，确保每天的主题组合都不同
        var dayOfMonth = today.getDate(); // 1-31
        var theme1 = themes[dayOfMonth % themes.length];
        var theme2 = themes[(dayOfMonth + 5) % themes.length];
        var theme3 = themes[(dayOfMonth + 10) % themes.length];
        var dailyThemes = [theme1, theme2, theme3];

        // 为每个主题获取一张随机图片
        for (var i = 0; i < dailyThemes.length; i++) {
            var theme = dailyThemes[i];
            var url = "https://api.unsplash.com/photos/random?query=" + encodeURIComponent(theme) + "&orientation=landscape";
            
            var headers = {
                "Authorization": "Client-ID " + accessKey,
                "Accept-Version": "v1"
            };

            var response = sdcl.http.get(url, headers);
            if (!response) {
                throw new Error("获取主题 '" + theme + "' 的图片失败，请检查网络或API密钥。");
            }

            var photo = JSON.parse(response);
            if (photo.errors) {
                throw new Error("Unsplash API 错误: " + photo.errors.join(", "));
            }

            // --- 创建日历事件 ---
            var eventDate = new Date();
            eventDate.setHours(displayHours[i], 0, 0, 0);

            var title = photo.alt_description || "Unsplash Photo";
            var notes = "摄影师: " + photo.user.name + "\n主题: " + theme;
            if (photo.description) {
                notes += "\n描述: " + photo.description;
            }

            events.push({
                title: title,
                startDate: sdcl.date.format(eventDate.getTime() / 1000),
                endDate: sdcl.date.format(eventDate.getTime() / 1000),
                color: photo.color || "#666666",
                notes: notes,
                href: photo.links.html,
                icon: photo.user.profile_image.small, // 作者头像
                imageURL: photo.urls.small, // 使用 small 尺寸作为预览图
                isAllDay: false,
                isPointInTime: true
            });
        }

        // 将成功获取的事件缓存24小时（1440分钟）
        if (events.length === 3) {
            sdcl.storage.set(cacheKey, events, 1440);
        } else {
            throw new Error("未能成功获取全部3张图片。");
        }

    } catch (err) {
        throw new Error("Unsplash 插件执行失败: " + err.message);
    }

    return events;
}
