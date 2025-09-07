// Bilibili 用户视频插件 - 修复版本
function fetchEvents(config) {
    var events = [];

    var mid = config.mid;

    var pageSize = 10;
    if (config && config.pageSize && config.pageSize !== "undefined") {
        pageSize = config.pageSize;
    }

    var cacheKey = "bilibili_user_videos_" + mid;
    var cacheTimeKey = "bilibili_cache_time_" + mid;
    var cacheExpiryMinutes = 30;

    try {
        // 检查缓存
        var cachedData = SideCalendar.storageGet(cacheKey);
        var cachedTime = SideCalendar.storageGet(cacheTimeKey);

        if (cachedData && cachedTime) {
            var currentTime = Date.now();
            var cacheAge = (currentTime - parseInt(cachedTime)) / (1000 * 60); // 分钟

            if (cacheAge < cacheExpiryMinutes) {
                try {
                    var cachedEvents = JSON.parse(cachedData);
                    console.log("使用缓存数据，缓存年龄: " + Math.round(cacheAge) + " 分钟");
                    return cachedEvents;
                } catch (parseError) {
                    console.log("缓存数据解析失败，将重新获取");
                }
            }
        }

        // 获取新数据
        var url = "https://api.bilibili.com/x/space/arc/search?mid=" + mid + "&pn=1&ps=" + pageSize +
            "&order=pubdate";

        var headers = {
            "User-Agent": "SideCalendar Bilibili Plugin",
            "Accept": "application/json",
            "Referer": "https://www.bilibili.com/"
        };

        var response = SideCalendar.httpGet(url, headers);
        if (response) {
            var data = JSON.parse(response);

            if (data.code === 0 && data.data && data.data.list && data.data.list.vlist) {
                var videos = data.data.list.vlist;

                videos.forEach(function (video) {
                    var pubDate = new Date(video.created * 1000);

                    var title = video.title;
                    var color = "#FB7299";

                    var playCount = formatCount(video.play);
                    var danmakuCount = formatCount(video.video_review);

                    var notes = "UP主: " + video.author +
                        "\n播放: " + playCount +
                        "\n弹幕: " + danmakuCount +
                        "\n时长: " + video.length;

                    events.push({
                        title: title,
                        startDate: SideCalendar.formatDate(pubDate.getTime() / 1000),
                        endDate: SideCalendar.formatDate(pubDate.getTime() / 1000),
                        color: color,
                        icon: nil,
                        notes: notes,
                        isAllDay: false,
                        isPointInTime: true,
                        href: "https://www.bilibili.com/video/" + video.bvid
                    });
                });

                // 缓存成功的数据
                var currentTime = Date.now();
                try {
                    SideCalendar.storageSet(cacheKey, JSON.stringify(events));
                    SideCalendar.storageSet(cacheTimeKey, currentTime.toString());
                    console.log("数据已缓存，事件数量: " + events.length);
                } catch (cacheError) {
                    console.log("缓存保存失败: " + cacheError.message);
                }

            } else {
                throw new Error("API返回格式错误: code=" + data.code + ", message=" + (data.message || "未知"));
            }
        } else {
            throw new Error("HTTP请求失败");
        }

    } catch (err) {
    }

    function formatCount(count) {
        if (!count || count === 0) return "0";
        return count.toString();
    }

    return events;
}