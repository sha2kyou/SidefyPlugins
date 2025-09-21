// 每日智慧语录插件
function fetchEvents(config) {
    try {
        var events = [];
        var now = new Date();

        // 获取用户配置，设置默认值
        var style = config.style || "励志";
        var language = config.language || "中文";
        var timeSlot = config.time || "morning";

        // 如果用户选择了"自动"语言，则使用应用语言设置
        if (language === "自动") {
            var appLang = sdcl.app.language();

            // 根据应用语言自动选择合适的语录语言
            if (appLang === "zh" || appLang === "zh-Hans" || appLang === "zh-Hant") {
                language = "中文";
            } else if (appLang === "en") {
                language = "英文";
            } else if (appLang === "ja") {
                language = "日语";
            } else if (appLang === "ko") {
                language = "韩语";
            } else if (appLang === "de") {
                language = "德语";
            } else if (appLang === "fr") {
                language = "法语";
            } else if (appLang === "es") {
                language = "西班牙语";
            } else if (appLang === "pt") {
                language = "葡萄牙语";
            } else if (appLang === "ru") {
                language = "俄语";
            } else {
                language = "英文"; // 默认英文
            }
        }

        // 确定显示时间范围
        var timeRanges = {
            "morning": { start: 7, end: 9, label: "早安" },
            "afternoon": { start: 14, end: 16, label: "午后" },
            "evening": { start: 18, end: 20, label: "傍晚" }
        };

        var selectedTime = timeRanges[timeSlot];
        if (!selectedTime) {
            selectedTime = timeRanges["morning"];
        }

        // 创建今天该时间段的事件时间
        var today = new Date();
        var startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), selectedTime.start, 0, 0);
        var endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), selectedTime.end, 0, 0);

        // 生成基于日期的缓存键，确保每天内容不同
        var dateKey = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
        var cacheKey = "daily_wisdom_" + dateKey + "_" + style + "_" + language;

        // 尝试从缓存获取今日语录
        var cachedWisdom = sdcl.storage.get(cacheKey);
        var wisdomText = "";

        if (cachedWisdom) {
            sdcl.log("使用缓存的今日智慧语录");
            wisdomText = cachedWisdom;
        } else {
            sdcl.log("生成新的今日智慧语录");

            // 根据日期生成上下文信息
            var dateContext = generateDateContext(today);

            // 构建AI提示词
            var prompt = buildPrompt(style, language, dateContext);

            // 调用AI生成语录
            wisdomText = sdcl.ai.chat(prompt);

            // 计算到今天结束的剩余分钟数
            var remainingMinutes = getRemainingMinutesToday();

            // 缓存今日语录（到当天结束）
            if (wisdomText && wisdomText.indexOf("Error:") !== 0) {
                sdcl.storage.set(cacheKey, wisdomText, remainingMinutes);
            } else {
                // AI调用失败时的备用语录
                wisdomText = getFallbackWisdom(style, language);
            }
        }

        // 创建智慧语录事件
        events.push({
            title: selectedTime.label + "智慧语录",
            startDate: sdcl.date.format(startTime.getTime() / 1000),
            endDate: sdcl.date.format(endTime.getTime() / 1000),
            color: getColorByStyle(style),
            notes: wisdomText,
            icon: "💡",
            isAllDay: false,
            isPointInTime: false,
            href: null,
            imageURL: null
        });

        sdcl.log("生成了 " + events.length + " 条智慧语录事件");
        return events;

    } catch (error) {
        sdcl.log("智慧语录插件执行错误: " + error.message);
        return [];
    }
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
function buildPrompt(style, language, context) {
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
    var contextPrompt = "现在是" + context.season + "，星期" + context.dayOfWeek + "，" + context.month + "月" + context.date + "日。";

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