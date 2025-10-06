/**
 * Switch 愿望单打折监控插件 (日本区)
 * 监控指定的 Nintendo Switch 游戏打折信息，并在日历中显示打折游戏。
 *
 * @author sha2kyou
 */
function fetchEvents(config) {

    // 检查游戏 ID 列表是否存在
    var gameIds = config.game_ids;

    if (!gameIds || gameIds.trim() === "") {
        throw new Error("游戏 ID 列表不能为空，请在插件配置中填入要监控的游戏 ID。");
    }

    // 清理游戏 ID（移除可能的字母前缀和空格），并限制最多10个
    var cleanedIdsArray = gameIds
        .split(',')
        .map(function(id) {
            return id.trim().replace(/^[A-Z]/i, ''); // 移除开头的字母
        })
        .filter(function(id) {
            return id !== ""; // 过滤空字符串
        })
        .slice(0, 10); // 只取前10个

    var cleanedIds = cleanedIdsArray.join(',');

    // --- 缓存逻辑 ---
    var cacheKey = "switch_wishlist_jp_v3_" + cleanedIds;
    var cachedData = sdcl.storage.get(cacheKey);
    if (cachedData) {
        return cachedData;
    }

    // --- Switch 愿望单打折检查逻辑 ---
    var events = [];

    try {
        // 1. 查询游戏价格信息（日本区）
        var priceUrl = "https://api.ec.nintendo.com/v1/price?country=JP&ids=" +
                       cleanedIds + "&lang=ja";
        var priceResponse = sdcl.http.get(priceUrl);

        if (!priceResponse) {
            throw new Error("无法获取游戏价格信息，请检查网络连接。");
        }

        var priceData = JSON.parse(priceResponse);

        if (!priceData.prices || priceData.prices.length === 0) {
            throw new Error("未找到游戏价格信息，请检查游戏 ID 是否正确。");
        }

        // 2. 获取游戏信息（优先使用用户配置，否则从日本商店抓取）
        var gameIdsArray = cleanedIdsArray; // 使用已经限制数量的数组
        var gameInfoMap = {};

        for (var i = 0; i < gameIdsArray.length; i++) {
            var gameId = gameIdsArray[i].trim();

            // 从日本商店页面抓取游戏信息
            try {
                var storeUrl = "https://store-jp.nintendo.com/item/software/D" + gameId;
                var storePage = sdcl.http.get(storeUrl);

                if (storePage) {
                    var gameName = "游戏 ID: " + gameId;
                    var gameImage = "";
                    var deviceInfo = "";

                    // 从 og:title meta 标签提取游戏名称
                    var titleMatch = storePage.match(/property="og:title"\s+content="([^"]*)"/);
                    if (titleMatch && titleMatch[1]) {
                        gameName = titleMatch[1];
                    }

                    // 从 og:image meta 标签提取封面图
                    var imageMatch = storePage.match(/property="og:image"\s+content="([^"]*)"/);
                    if (imageMatch && imageMatch[1]) {
                        gameImage = imageMatch[1];
                    }

                    // 提取设备兼容性信息
                    deviceInfo = extractDeviceInfo(storePage);

                    gameInfoMap[gameId] = {
                        name: gameName,
                        image: gameImage,
                        device: deviceInfo
                    };
                    continue;
                }
            } catch (fetchErr) {
                // 抓取失败，使用默认值
            }

            // 如果都失败，使用游戏 ID 作为名称
            gameInfoMap[gameId] = {
                name: "游戏 ID: " + gameId,
                image: "",
                device: ""
            };
        }

        // 3. 处理价格数据，检查打折信息
        var discountedGames = [];

        for (var j = 0; j < priceData.prices.length; j++) {
            var priceInfo = priceData.prices[j];
            var gameId = String(priceInfo.title_id);

            // 跳过未找到的游戏
            if (priceInfo.sales_status === "not_found") {
                continue;
            }

            // 检查是否有折扣
            if (priceInfo.discount_price && priceInfo.regular_price) {
                var regularPrice = parseFloat(priceInfo.regular_price.raw_value);
                var discountPrice = parseFloat(priceInfo.discount_price.raw_value);
                var discountPercent = Math.round((1 - discountPrice / regularPrice) * 100);

                var gameInfo = gameInfoMap[gameId] || { name: "游戏 ID: " + gameId, image: "", device: "" };
                discountedGames.push({
                    id: gameId,
                    name: gameInfo.name,
                    image: gameInfo.image,
                    device: gameInfo.device,
                    discountPercent: discountPercent,
                    regularPrice: priceInfo.regular_price.amount,
                    discountPrice: priceInfo.discount_price.amount,
                    currency: priceInfo.regular_price.currency,
                    url: "https://store-jp.nintendo.com/item/software/D" + gameId
                });
            }
        }

        // 4. 创建日历事件
        for (var k = 0; k < discountedGames.length; k++) {
            var game = discountedGames[k];

            // 设置为当天的全天事件（本地时间）
            var eventDate = new Date();
            eventDate.setHours(0, 0, 0, 0);
            var timestamp = eventDate.getTime() / 1000;

            var discountColor = getDiscountColor(game.discountPercent);
            var notes = "原价: " + game.regularPrice + "\n" +
                       "现价: " + game.discountPrice + "\n" +
                       "折扣: -" + game.discountPercent + "%";

            // 添加设备兼容性信息
            if (game.device) {
                notes += "\n对应本体: " + game.device;
            }

            var gameEvent = {
                title: game.name + " (-" + game.discountPercent + "%)",
                startDate: sdcl.date.format(timestamp),
                endDate: sdcl.date.format(timestamp),
                color: discountColor,
                notes: notes,
                href: game.url,
                imageURL: game.image,
                isAllDay: true,
                isPointInTime: true
            };

            events.push(gameEvent);
        }

        // 将成功获取的事件缓存 2 小时
        if (events.length > 0) {
            sdcl.storage.set(cacheKey, events, 120);
        }

    } catch (err) {
        throw new Error("Switch 愿望单插件执行失败: " + err.message);
    }

    return events;
}

/**
 * 提取设备兼容性信息
 */
function extractDeviceInfo(pageHtml) {
    try {
        // 查找所有支持的设备
        var switchMatch = pageHtml.match(/"productDetail\.playableHardNotice\.label":\[\{"type":\d+,"value":"Nintendo Switch"\}\]/);
        var switch2Match = pageHtml.match(/"productDetail\.playableHardNotice\.label\.onlySuper":\[\{"type":\d+,"value":"Nintendo Switch 2"\}\]/);

        if (switchMatch && switch2Match) {
            return "Switch/Switch 2";
        } else if (switch2Match) {
            return "Switch 2";
        } else if (switchMatch) {
            return "Switch";
        }
    } catch (err) {
        // 解析失败，返回空字符串
    }
    return "";
}

/**
 * 根据折扣百分比获取对应的颜色
 */
function getDiscountColor(discountPercent) {
    if (discountPercent >= 75) {
        return "#E74C3C"; // 深红色 - 超大折扣
    } else if (discountPercent >= 50) {
        return "#E67E22"; // 橙色 - 大折扣
    } else if (discountPercent >= 25) {
        return "#F39C12"; // 黄色 - 中等折扣
    } else {
        return "#3498DB"; // 蓝色 - 小折扣
    }
}
