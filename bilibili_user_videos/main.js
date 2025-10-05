// Bilibili 用户视频插件 - 按日期缓存版本
// 作者: 李慕白
function fetchEvents(config) {
    var POLL_INTERVAL = 10 * 60 * 1000;  // 15 分钟
    var CACHE_TTL = 60 * 60;             // 1 小时（秒）
    var MAX_MIDS = 10;
    var VIDEOS_PER_MID = 10;

    // 1. 获取今天的缓存 key
    var CACHE_KEY = getCacheKey();  // "bili_poll_2025-01-15"
    var today = getTodayKey();      // "2025-01-15"

    // 2. 解析配置（带去重）
    var mids = parseMids(config.mids);
    if (mids.length === 0) {
        return [];
    }

    // 3. 读取或初始化存储
    var storage = sdcl.storage.get(CACHE_KEY);
    if (!storage) {
        storage = initStorage(mids, today);
    }

    // 4. 更新 mids 列表并清理旧数据
    storage.meta.mids = mids;
    cleanupOldData(storage, mids);

    // 5. 判断是否需要轮询
    var now = Date.now();
    var shouldPoll = (now - storage.meta.last) >= POLL_INTERVAL;

    if (shouldPoll) {
        // 轮询：查询一个 UP 主
        pollNextMid(storage, VIDEOS_PER_MID, CACHE_TTL);

        // 更新轮询时间
        storage.meta.last = now;

        // 保存到存储（缓存 24 小时）
        sdcl.storage.set(CACHE_KEY, storage, 86400);
    }

    // 6. 返回所有事件
    return buildEvents(storage, config);


    // ==================== 辅助函数 ====================

    /**
     * 获取今天的缓存 key
     */
    function getCacheKey() {
        return "bili_poll_v3_" + getTodayKey();
    }

    /**
     * 获取今天的日期字符串
     */
    function getTodayKey() {
        var now = new Date();
        var year = now.getFullYear();
        var month = String(now.getMonth() + 1).padStart(2, '0');
        var day = String(now.getDate()).padStart(2, '0');
        return year + "-" + month + "-" + day;
    }

    /**
     * 解析并去重 mid 字符串
     */
    function parseMids(midStr) {
        if (!midStr) return [];

        var mids = midStr.split(',')
            .map(function(m) { return m.trim(); })
            .filter(function(m) { return m.length > 0; });

        // 去重
        var uniqueMids = {};
        var result = [];

        for (var i = 0; i < mids.length; i++) {
            var mid = mids[i];
            if (!uniqueMids[mid]) {
                uniqueMids[mid] = true;
                result.push(mid);
            }
        }

        return result.slice(0, MAX_MIDS);
    }

    /**
     * 清理不在当前配置中的旧数据
     */
    function cleanupOldData(storage, currentMids) {
        var midSet = {};
        for (var i = 0; i < currentMids.length; i++) {
            midSet[currentMids[i]] = true;
        }

        var hasChanged = false;
        for (var mid in storage.data) {
            if (!midSet[mid]) {
                delete storage.data[mid];
                hasChanged = true;
            }
        }

        // 如果配置变化，重置轮询
        if (hasChanged || storage.meta.mids.length !== currentMids.length) {
            storage.meta.idx = 0;
            storage.meta.last = 0;
        }
    }

    /**
     * 初始化存储结构
     */
    function initStorage(mids, date) {
        return {
            meta: {
                mids: mids,
                idx: 0,
                last: 0,
                date: date
            },
            data: {}
        };
    }

    /**
     * 查询下一个 UP 主（轮询）
     */
    function pollNextMid(storage, pageSize, cacheTTL) {
        var mids = storage.meta.mids;
        if (mids.length === 0) return;

        var idx = storage.meta.idx % mids.length;
        var mid = mids[idx];

        try {
            var videos = fetchBilibiliVideos(mid, pageSize);

            storage.data[mid] = {
                vids: videos
            };
        } catch (err) {
            // 查询失败，保持原有数据不变
        }

        storage.meta.idx = (idx + 1) % mids.length;
    }

    /**
     * 调用 B 站 API 获取视频（只保留今天发布的）
     */
    function fetchBilibiliVideos(mid, pageSize) {
        var url = "https://api.bilibili.com/x/space/arc/search?mid=" + mid +
                  "&pn=1&ps=" + pageSize + "&order=pubdate";

        var headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_0) AppleWebKit/537.36",
            "Accept": "application/json",
            "Referer": "https://www.bilibili.com/"
        };

        var maxRetries = 3;
        var response = null;

        for (var attempt = 0; attempt < maxRetries; attempt++) {
            try {
                response = sdcl.http.get(url, headers);
                if (response && response.length > 0) {
                    var data = JSON.parse(response);
                    if (data.code === 0) {
                        break;
                    } else if (data.code === -799) {
                        if (attempt < maxRetries - 1) {
                            sleep(5000);
                        }
                    } else {
                        throw new Error("API 返回错误: " + data.code);
                    }
                }
            } catch (err) {
                if (attempt === maxRetries - 1) {
                    throw err;
                }
                sleep(3000);
            }
        }

        if (!response) {
            throw new Error("HTTP 请求失败");
        }

        var data = JSON.parse(response);
        if (data.code !== 0 || !data.data || !data.data.list || !data.data.list.vlist) {
            throw new Error("API 返回格式错误");
        }

        // 获取今天的时间范围
        var today = getTodayKey();
        var todayStart = new Date(today + "T00:00:00").getTime() / 1000;
        var todayEnd = new Date(today + "T23:59:59").getTime() / 1000;

        var videos = [];
        var vlist = data.data.list.vlist;

        for (var i = 0; i < vlist.length; i++) {
            var v = vlist[i];

            // 只保留今天发布的视频
            if (v.created >= todayStart && v.created <= todayEnd) {
                videos.push({
                    t: v.title,
                    d: v.created,
                    b: v.bvid,
                    p: v.pic,
                    a: v.author,
                    pc: v.play || 0,
                    dc: v.video_review || 0,
                    l: v.length
                });
            }
        }

        return videos;
    }

    /**
     * 构建事件列表
     */
    function buildEvents(storage, config) {
        var events = [];

        for (var mid in storage.data) {
            var upData = storage.data[mid];

            var videos = upData.vids || [];
            for (var i = 0; i < videos.length; i++) {
                var v = videos[i];

                var playCount = formatCount(v.pc);
                var danmakuCount = formatCount(v.dc);

                events.push({
                    title: v.t,
                    startDate: sdcl.date.format(v.d),
                    endDate: sdcl.date.format(v.d),
                    color: "#FB7299",
                    icon: config.icon,
                    notes: "UP主: " + v.a +
                           "\n播放: " + playCount +
                           "\n弹幕: " + danmakuCount +
                           "\n时长: " + v.l,
                    isAllDay: false,
                    isPointInTime: true,
                    href: "https://www.bilibili.com/video/" + v.b,
                    imageURL: v.p
                });
            }
        }

        return events;
    }

    /**
     * 格式化数字
     */
    function formatCount(count) {
        if (!count || count === 0) return "0";
        if (count >= 100000000) return (count / 100000000).toFixed(1) + "亿";
        if (count >= 10000) return (count / 10000).toFixed(1) + "万";
        return count.toString();
    }

    /**
     * 同步延迟
     */
    function sleep(ms) {
        var endTime = Date.now() + ms;
        while (Date.now() < endTime) {
            // 忙等待
        }
    }
}
