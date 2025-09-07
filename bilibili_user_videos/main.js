// Bilibili 用户视频插件
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

        // 获取新数据 - 添加重试机制
        var url = "https://api.bilibili.com/x/space/arc/search?mid=" + mid + "&pn=1&ps=" + pageSize +
            "&order=pubdate";

        var headers = {
            "User-Agent": "SideCalendar Bilibili Plugin",
            "Accept": "application/json",
            "Referer": "https://www.bilibili.com/"
        };

        var response = null;
        var maxRetries = 8;
        var retryDelay = 1000; // 1秒

        // 重试机制
        for (var attempt = 0; attempt < maxRetries; attempt++) {
            console.log("开始第" + (attempt + 1) + "次HTTP请求尝试");

            var shouldRetry = false;

            try {
                response = SideCalendar.httpGet(url, headers);
                if (response && response.length > 0) {
                    console.log("HTTP请求成功，获得响应长度: " + response.length);

                    // 检查API返回的状态码
                    try {
                        var tempData = JSON.parse(response);
                        if (tempData.code === 0) {
                            // API成功，跳出重试循环
                            console.log("API调用成功");
                            break;
                        } else if (tempData.code === -799) {
                            // 频率限制错误，需要重试
                            console.log("API返回频率限制错误: code=" + tempData.code + ", message=" + (tempData.message || "未知"));
                            shouldRetry = true;
                        } else {
                            // 其他API错误，不重试
                            console.log("API返回其他错误，不重试: code=" + tempData.code);
                            break;
                        }
                    } catch (parseError) {
                        console.log("响应解析失败，不重试: " + parseError.message);
                        break;
                    }
                } else {
                    console.log("HTTP请求返回空响应，第" + (attempt + 1) + "次尝试失败");
                    shouldRetry = true;
                }
            } catch (httpError) {
                console.log("HTTP请求异常，第" + (attempt + 1) + "次尝试失败: " + httpError.message);
                shouldRetry = true;
            }

            // 如果需要重试且不是最后一次尝试
            if (shouldRetry && attempt < maxRetries - 1) {
                console.log("等待1秒后进行第" + (attempt + 2) + "次重试...");

                // 使用同步延时方法
                var endTime = Date.now() + retryDelay;
                while (Date.now() < endTime) {
                    // 同步等待
                }
            } else if (shouldRetry) {
                console.log("已达到最大重试次数: " + maxRetries);
            }
        }

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
                        icon: config.icon,
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
            throw new Error("HTTP请求失败，已重试" + maxRetries + "次");
        }

    } catch (err) {
        console.log("插件执行出错: " + err.message);
    }

    function formatCount(count) {
        if (!count || count === 0) return "0";
        return count.toString();
    }

    return events;
}