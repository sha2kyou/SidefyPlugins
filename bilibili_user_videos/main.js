// Bilibili 用户视频插件
function fetchEvents(config) {
    var events = [];

    var mids = config.mids;
    if (!mids) {
        return events;
    }

    // 解析 mids，支持逗号分隔
    var midList = [];
    if (typeof mids === 'string') {
        midList = mids.split(',').map(function (mid) {
            return mid.trim();
        }).filter(function (mid) {
            return mid.length > 0;
        });
    } else if (Array.isArray(mids)) {
        midList = mids;
    } else {
        midList = [mids.toString()];
    }

    if (midList.length === 0) {
        return events;
    }

    var pageSize = 10;
    if (config && config.pageSize && config.pageSize !== "undefined") {
        pageSize = config.pageSize;
    }

    // 遍历每个 mid
    midList.forEach(function (mid) {
        var cacheKey = "bilibili_user_videos_" + mid;

        try {
            // 检查缓存 - 简化处理
            var cachedData = sdcl.storage.get(cacheKey);
            if (cachedData) {
                events = events.concat(cachedData);
                return; // 跳过当前 mid 的网络请求
            }

            // 获取新数据 - 添加重试机制
            var url = "https://api.bilibili.com/x/space/arc/search?mid=" + mid + "&pn=1&ps=" + pageSize + "&order=pubdate";

            var headers = {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
                "Accept": "application/json",
                "Referer": "https://www.bilibili.com/"
            };

            var response = null;
            var maxRetries = 10;
            var retryDelay = 1500;

            // 重试机制
            for (var attempt = 0; attempt < maxRetries; attempt++) {
                var shouldRetry = false;

                try {
                    response = sdcl.http.get(url, headers);
                    if (response && response.length > 0) {
                        try {
                            var tempData = JSON.parse(response);
                            if (tempData.code === 0) {
                                break;
                            } else if (tempData.code === -799) {
                                shouldRetry = true;
                            } else {
                                break;
                            }
                        } catch (parseError) {
                            break;
                        }
                    } else {
                        shouldRetry = true;
                    }
                } catch (httpError) {
                    shouldRetry = true;
                }

                if (shouldRetry && attempt < maxRetries - 1) {
                    var endTime = Date.now() + retryDelay;
                    while (Date.now() < endTime) {
                        // 同步等待
                    }
                } else if (shouldRetry) {
                    break;
                }
            }

            if (response) {
                var data = JSON.parse(response);

                if (data.code === 0 && data.data && data.data.list &&
                    data.data.list.vlist) {
                    var videos = data.data.list.vlist;
                    var upEvents = [];

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

                        upEvents.push({
                            title: title,
                            startDate: sdcl.date.format(pubDate.getTime() / 1000),
                            endDate: sdcl.date.format(pubDate.getTime() / 1000),
                            color: color,
                            icon: config.icon,
                            notes: notes,
                            isAllDay: false,
                            isPointInTime: true,
                            href: "https://www.bilibili.com/video/" + video.bvid
                        });
                    });

                    // 缓存成功的数据 - 直接传递数组对象
                    sdcl.storage.set(cacheKey, upEvents, 30);

                    // 添加到总事件数组
                    events = events.concat(upEvents);
                } else {
                    throw new Error("UP主 " + mid + " API返回格式错误: code = " + data.code + ", message = " + (data.message || "未知"));
                }
            } else {
                throw new Error("UP主 " + mid + " HTTP请求失败，已重试" + maxRetries + "次");
            }

        } catch (err) {
            throw new Error("UP主 " + mid + " 插件执行出错: " + err.message);
        }
    });

    function formatCount(count) {
        if (!count || count === 0) return "0";
        return count.toString();
    }

    return events;
}