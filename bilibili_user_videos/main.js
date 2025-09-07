// Bilibili 用户视频插件 - 修复时长和缓存问题
function fetchEvents(config) {
    var events = [];

    var mid = config.mid;

    var pageSize = "10";
    if (config && config.pageSize && config.pageSize !== "undefined" &&
        config.pageSize.toString().length > 0) {
        pageSize = config.pageSize.toString();
    }

    var cacheKey = "bilibili_videos_" + mid;
    var cacheTimeKey = "bilibili_time_" + mid;
    var cacheExpiryMinutes = 30;

    try {
        // 检查缓存
        var cachedTime = SideCalendar.storageGet(cacheTimeKey);
        if (cachedTime && cachedTime.length > 0) {
            var cacheTimestamp = parseInt(cachedTime);
            var now = Date.now();
            var cacheAge = now - cacheTimestamp;
            var thirtyMinutesMs = cacheExpiryMinutes * 60 * 1000;

            if (cacheAge < thirtyMinutesMs) {
                var cachedData = SideCalendar.storageGet(cacheKey);
                if (cachedData && cachedData.length > 0) {
                    try {
                        return JSON.parse(cachedData);
                    } catch (parseError) {
                    }
                }
            } else {
            }
        } else {
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
                    var endDate = new Date(pubDate.getTime() + 15 * 60 * 1000);

                    var title = video.title;
                    var color = "#FB7299";

                    var playCount = formatCount(video.play);

                    // 修复时长获取 - 尝试不同的字段名
                    var durationStr = "未知";
                    var duration = video.duration || video.length;

                    if (duration && duration > 0) {
                        durationStr = formatDuration(duration);
                    }

                    var notes = "UP主: " + video.author +
                        "\n播放: " + playCount +
                        "\n弹幕: " + (video.video_review || 0) +
                        "\n时长: " + durationStr +
                        "\n发布: " + formatTime(pubDate);

                    events.push({
                        title: title,
                        startDate: SideCalendar.formatDate(pubDate.getTime() / 1000),
                        endDate: SideCalendar.formatDate(endDate.getTime() / 1000),
                        color: color,
                        notes: notes,
                        icon: video.pic || null,
                        isAllDay: false,
                        isPointInTime: true,
                        eventType: "bilibili_video",
                        href: "https://www.bilibili.com/video/" + video.bvid
                    });
                });

                // 缓存成功的数据
                var currentTime = Date.now();
                try {
                    SideCalendar.storageSet(cacheKey, JSON.stringify(events));
                    SideCalendar.storageSet(cacheTimeKey, currentTime.toString());
                } catch (cacheError) {
                }

            } else {
                throw new Error("API返回格式错误: code=" + data.code + ", message=" + (data.message
                    || "未知"));
            }
        } else {
            throw new Error("HTTP请求失败");
        }

    } catch (err) {
    }

    return events;
}

function formatCount(count) {
    if (!count || count === 0) return "0";
    if (count >= 10000) {
        return Math.floor(count / 10000) + "万";
    } else if (count >= 1000) {
        return Math.floor(count / 1000) + "k";
    }
    return count.toString();
}

function formatDuration(seconds) {
    if (!seconds || isNaN(seconds) || seconds <= 0) {
        return "未知";
    }

    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var secs = seconds % 60;

    if (hours > 0) {
        return hours + ":" + padZero(minutes) + ":" + padZero(secs);
    } else {
        return minutes + ":" + padZero(secs);
    }
}

function padZero(num) {
    return (num < 10 ? "0" : "") + num;
}

function formatTime(date) {
    var now = new Date();
    var diffMs = now - date;
    var diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return "今天";
    } else if (diffDays === 1) {
        return "昨天";
    } else if (diffDays < 7) {
        return diffDays + "天前";
    } else if (diffDays < 30) {
        return Math.floor(diffDays / 7) + "周前";
    } else {
        return Math.floor(diffDays / 30) + "月前";
    }
}