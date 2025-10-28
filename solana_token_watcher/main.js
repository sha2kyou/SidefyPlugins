// Solana 代币价格监控模板 - 通过 Phantom API 获取价格数据
function fetchEvents(config) {
    var events = [];

    try {
        // 从 config 中获取要监控的代币列表
        var tokens = [];
        if (config.tokens && typeof config.tokens === 'string') {
            tokens = config.tokens.split(',').map(function (token) {
                return token.trim(); // 去除空格
            });
        } else if (Array.isArray(config.tokens)) {
            tokens = config.tokens;
        }

        if (tokens.length === 0) {
            sidefy.log("未配置代币列表，请在 config.tokens 中设置");
            return events;
        }

        // 为每个代币获取价格数据
        tokens.forEach(function (tokenKey) {
            if (config[tokenKey]) {
                var url = "https://api.phantom.app/price/v1/solana:101/address/" + config[tokenKey];
                var headers = {
                    "User-Agent": "SideCalendar Solana Price Monitor",
                    "Accept": "application/json"
                };

                var response = sidefy.http.get(url, headers);
                if (response) {
                    var data = JSON.parse(response);

                    if (data.price !== undefined) {
                        // 检查是否需要监控价格阈值
                        var watcherKey = tokenKey + '_watcher_value';
                        // 标准键名为 `${token}watcher_direction`（无下划线）；兼容旧写法 `${token}_watcher_direction`（有下划线）
                        var dirKeyPreferred = tokenKey + 'watcher_direction';
                        var dirKeyLegacy = tokenKey + '_watcher_direction';
                        var direction = (config[dirKeyPreferred] || config[dirKeyLegacy] || 'down').toString().toLowerCase();

                        var shouldPush = true;

                        if (config[watcherKey] !== undefined) {
                            // 如果设置了监控阈值, 根据方向进行比较：
                            // down: 价格 < 阈值 时触发； up: 价格 > 阈值 时触发
                            var threshold = Number(config[watcherKey]);
                            if (isNaN(threshold)) {
                                threshold = config[watcherKey]; // 退回原始值, 以防宿主已确保为 number
                            }

                            if (direction === 'up') {
                                shouldPush = data.price > threshold;
                            } else {
                                // 默认 down 行为与历史保持一致
                                shouldPush = data.price < threshold;
                            }
                        }

                        if (shouldPush) {
                            var updateTime = new Date(data.lastUpdatedAt);
                            var endTime = new Date(data.lastUpdatedAt);

                            var priceChange = data.priceChange24h || 0;
                            var color = "#666666";
                            var changeText = "";

                            // 根据价格变化设置颜色和文字
                            if (priceChange > 0) {
                                color = "#34a853"; // 绿色 - 上涨
                                changeText = "↗ +" + priceChange.toFixed(2) + "%";
                            } else if (priceChange < 0) {
                                color = "#ea4335"; // 红色 - 下跌
                                changeText = "↘ " + priceChange.toFixed(2) + "%";
                            } else {
                                color = "#4285f4"; // 蓝色 - 无变化
                                changeText = "→ 0.00%";
                            }

                            var title = tokenKey.toUpperCase() + " $" + data.price.toFixed(6) + " " + changeText;

                            // 如果是因为价格触发阈值而推送，在标题中添加警告标识
                            if (config[watcherKey] !== undefined) {
                                var conditionText = direction === 'up' ? "> $" + config[watcherKey] : "< $" + config[watcherKey];
                                title = "🚨 " + title + " (" + conditionText + ")";
                                color = "#ff6d01"; // 橙色 - 价格警告
                            }

                            events.push({
                                title: title,
                                startDate: sidefy.formatDate(updateTime.getTime() / 1000),
                                endDate: sidefy.formatDate(endTime.getTime() / 1000),
                                color: color,
                                notes: "Solana 代币价格 - " + tokenKey.toUpperCase() + "\n价格: $" + data.price + "\n24h变化: " + priceChange.toFixed(2) + "%" +
                                    (config[watcherKey] !== undefined ? (direction === 'up' ? "\n⚠️ 价格高于监控阈值: $" + config[watcherKey] : "\n⚠️ 价格低于监控阈值: $" + config[watcherKey]) : ""),
                                icon: null,
                                isAllDay: false,
                                isPointInTime: true,
                                href: "https://solscan.io/token/" + config[tokenKey]
                            });
                        }
                    }
                }
            }
        });

        sidefy.log("获取了 " + events.length + " 个 Solana 代币价格数据");
    } catch (err) {
        sidefy.log("Phantom API 请求失败: " + err.message);
    }

    return events;
}