// 每日智慧语录插件 - 每3小时生成随机风格语录

function fetchEvents(config) {
    try {
        var events = [];
        var now = new Date();

        // 根据应用语言自动选择语言
        var language = getLanguageByApp();

        // 获取当前日期的时间段（每3小时一段：0-3, 3-6, 6-9, 9-12, 12-15, 15-18, 18-21, 21-24）
        var timeSlots = getTimeSlots();

        for (var i = 0; i < timeSlots.length; i++) {
            var slot = timeSlots[i];

            // 生成该时间段的缓存键
            var dateKey = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();
            var cacheKey = "wisdom_" + dateKey + "_" + slot.id;

            // 尝试从缓存获取语录
            var cachedWisdom = sdcl.storage.get(cacheKey);
            var wisdomText = "";

            if (cachedWisdom) {
                wisdomText = cachedWisdom;
            } else {
                // 为该时间段生成随机风格的语录
                var randomStyle = getRandomStyle();
                var dateContext = generateDateContext(now);
                var prompt = buildPrompt(randomStyle, language, dateContext, slot.period);

                // 调用AI生成语录
                wisdomText = sdcl.ai.chat(prompt);

                // 计算到今天结束的剩余分钟数
                var remainingMinutes = getRemainingMinutesToday();

                // 缓存语录
                if (wisdomText && wisdomText.indexOf("Error:") !== 0) {
                    sdcl.storage.set(cacheKey, wisdomText, remainingMinutes);
                } else {
                    // AI调用失败时的备用语录
                    wisdomText = getFallbackWisdom(randomStyle, language);
                }
            }

            // 创建智慧语录事件
            events.push({
                title: slot.label + "智慧语录",
                startDate: sdcl.date.format(slot.startTime.getTime() / 1000),
                endDate: sdcl.date.format(slot.endTime.getTime() / 1000),
                color: slot.color,
                notes: wisdomText,
                isAllDay: false,
                isPointInTime: false,
                href: null,
                imageURL: null
            });
        }

        return events;

    } catch (error) {
        return [];
    }
}

// 根据应用语言自动选择语言
function getLanguageByApp() {
    var appLang = sdcl.app.language();

    if (appLang === "zh" || appLang === "zh-Hans" || appLang === "zh-Hant") {
        return "中文";
    } else if (appLang === "en") {
        return "英文";
    } else if (appLang === "ja") {
        return "日语";
    } else if (appLang === "ko") {
        return "韩语";
    } else if (appLang === "de") {
        return "德语";
    } else if (appLang === "fr") {
        return "法语";
    } else if (appLang === "es") {
        return "西班牙语";
    } else if (appLang === "pt") {
        return "葡萄牙语";
    } else if (appLang === "ru") {
        return "俄语";
    } else {
        return "英文"; // 默认英文
    }
}

// 获取8个3小时时间段
function getTimeSlots() {
    var today = new Date();
    var slots = [];

    var timeSlotConfig = [
        { start: 0, label: "深夜", color: "#4A5568" },
        { start: 3, label: "凌晨", color: "#2D3748" },
        { start: 6, label: "清晨", color: "#F6AD55" },
        { start: 9, label: "上午", color: "#FBD38D" },
        { start: 12, label: "中午", color: "#F56565" },
        { start: 15, label: "下午", color: "#4FD1C7" },
        { start: 18, label: "傍晚", color: "#9F7AEA" },
        { start: 21, label: "夜晚", color: "#805AD5" }
    ];

    for (var i = 0; i < timeSlotConfig.length; i++) {
        var config = timeSlotConfig[i];
        var startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), config.start, 0, 0);
        var endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), config.start + 3, 0, 0);

        slots.push({
            id: "slot_" + config.start,
            label: config.label,
            color: config.color,
            startTime: startTime,
            endTime: endTime,
            period: config.label
        });
    }

    return slots;
}

// 随机选择语录风格
function getRandomStyle() {
    var styles = ["励志", "哲理", "诗意", "实用", "幽默"];
    var randomIndex = Math.floor(Math.random() * styles.length);
    return styles[randomIndex];
}

// 计算到今天结束的剩余分钟数
function getRemainingMinutesToday() {
    var now = new Date();
    var endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    var remainingMs = endOfDay.getTime() - now.getTime();
    var remainingMinutes = Math.ceil(remainingMs / (1000 * 60));

    // 确保至少缓存5分钟，避免边界情况
    return Math.max(remainingMinutes, 5);
}

// 生成日期上下文信息
function generateDateContext(date) {
    var month = date.getMonth() + 1;
    var dayOfWeek = ["日", "一", "二", "三", "四", "五", "六"][date.getDay()];

    // 季节判断
    var season = "";
    if (month >= 3 && month <= 5) season = "春天";
    else if (month >= 6 && month <= 8) season = "夏天";
    else if (month >= 9 && month <= 11) season = "秋天";
    else season = "冬天";

    return {
        season: season,
        month: month,
        dayOfWeek: dayOfWeek,
        date: date.getDate()
    };
}

// 构建AI提示词
function buildPrompt(style, language, context, timePeriod) {
    var basePrompt = "";

    // 基础设定
    if (language === "中文") {
        basePrompt = "请生成一条" + style + "的智慧语录，";
    } else if (language === "英文") {
        basePrompt = "Please generate an " + getEnglishStyle(style) + " wisdom quote, ";
    } else { // 双语
        basePrompt = "请生成一条" + style + "的智慧语录，同时提供中英文版本，";
    }

    // 添加时间和季节上下文
    var contextPrompt = "现在是" + context.season + "，星期" + context.dayOfWeek + "，" + context.month + "月" + context.date + "日的" + timePeriod + "。";

    // 风格指导
    var styleGuide = getStyleGuide(style, language);

    // 格式要求
    var formatRequirement = "";
    if (language === "双语") {
        formatRequirement = "请用这种格式：中文语录 | English Quote";
    } else {
        formatRequirement = "请直接返回语录内容，不要添加额外说明。语录应该简洁有力，不超过100字。";
    }

    return basePrompt + contextPrompt + styleGuide + formatRequirement;
}

// 获取风格指导
function getStyleGuide(style, language) {
    var guides = {
        "励志": "要积极向上，能激发人的斗志和动力。",
        "哲理": "要有深度思考，引发人对生活和人生的思辨。",
        "诗意": "要优美动人，富有诗歌般的意境和美感。",
        "实用": "要贴近生活，给出具体可行的人生建议。",
        "幽默": "要轻松风趣，能让人会心一笑且有所感悟。"
    };

    return guides[style] || guides["励志"];
}

// 获取英文风格对应词
function getEnglishStyle(style) {
    var englishStyles = {
        "励志": "inspirational",
        "哲理": "philosophical",
        "诗意": "poetic",
        "实用": "practical",
        "幽默": "humorous"
    };

    return englishStyles[style] || "inspirational";
}

// 根据风格获取颜色
function getColorByStyle(style) {
    var colors = {
        "励志": "#FF6B6B", // 温暖红色
        "哲理": "#4ECDC4", // 宁静青色
        "诗意": "#A8E6CF", // 清新绿色
        "实用": "#FFD93D", // 明亮黄色
        "幽默": "#FF8C42"  // 活泼橙色
    };

    return colors[style] || "#FF6B6B";
}

// 备用语录（AI调用失败时使用）
function getFallbackWisdom(style, language) {
    var fallbacks = {
        "励志": {
            "中文": "每一天都是新的开始，相信自己的力量！",
            "英文": "Every day is a new beginning, believe in your strength!",
            "双语": "每一天都是新的开始，相信自己的力量！ | Every day is a new beginning, believe in your strength!"
        },
        "哲理": {
            "中文": "生活不在于拥有什么，而在于如何看待拥有的一切。",
            "英文": "Life is not about what you have, but how you perceive what you have.",
            "双语": "生活不在于拥有什么，而在于如何看待拥有的一切。 | Life is not about what you have, but how you perceive what you have."
        },
        "诗意": {
            "中文": "时光荏苒，愿你在平凡的日子里，发现不平凡的美好。",
            "英文": "Time flows gently, may you find extraordinary beauty in ordinary days.",
            "双语": "时光荏苒，愿你在平凡的日子里，发现不平凡的美好。 | Time flows gently, may you find extraordinary beauty in ordinary days."
        },
        "实用": {
            "中文": "今天做一件让明天的自己感谢的事情。",
            "英文": "Do something today that your future self will thank you for.",
            "双语": "今天做一件让明天的自己感谢的事情。 | Do something today that your future self will thank you for."
        },
        "幽默": {
            "中文": "生活就像咖啡，苦一点没关系，加点糖就甜了！",
            "英文": "Life is like coffee, a little bitter is okay, just add some sugar!",
            "双语": "生活就像咖啡，苦一点没关系，加点糖就甜了！ | Life is like coffee, a little bitter is okay, just add some sugar!"
        }
    };

    return fallbacks[style] && fallbacks[style][language]
        ? fallbacks[style][language]
        : "保持微笑，拥抱今天！ | Keep smiling and embrace today!";
}