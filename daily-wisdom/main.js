// 每日智慧语录插件 - 每天一条全天日程，每3小时更新内容
function fetchEvents(config) {
    var events = [];
    var now = new Date();

    // 根据应用语言自动选择语言
    var language = getLanguageByApp();

    // 生成今天的缓存键
    var dateKey = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();
    var cacheKey = "daily_wisdom_v4_" + dateKey;

    // 尝试从缓存获取今日语录
    var cachedWisdom = sdcl.storage.get(cacheKey);

    var wisdomText = "";

    if (cachedWisdom) {
        wisdomText = cachedWisdom;
    } else {
        // 生成新的智慧语录
        var randomStyle = getRandomStyle();
        var dateContext = generateDateContext(now);
        var prompt = buildPrompt(randomStyle, language, dateContext);

        // 调用AI生成语录
        wisdomText = sdcl.ai.chat(prompt);

        // 检查AI返回结果，有问题直接抛出异常
        if (!wisdomText || wisdomText.trim() === "" || wisdomText.indexOf("Error:") === 0) {
            throw new Error("AI调用失败或返回无效内容: " + wisdomText);
        }

        // 计算到今天结束的剩余分钟数
        var remainingMinutes = getRemainingMinutesToday();

        // 缓存语录
        sdcl.storage.set(cacheKey, wisdomText, remainingMinutes);
    }

    // 检查是否需要更新语录（每3小时检查一次）
    var updateKey = "wisdom_last_update_v4_" + dateKey;
    var lastUpdate = sdcl.storage.get(updateKey);
    var currentTime = now.getTime();
    var threeHours = 3 * 60 * 60 * 1000; // 3小时的毫秒数

    if (!lastUpdate || (currentTime - lastUpdate) >= threeHours) {
        // 需要更新语录
        var newStyle = getRandomStyle();
        var newPrompt = buildPrompt(newStyle, language, dateContext);
        var newWisdom = sdcl.ai.chat(newPrompt);

        // 检查AI返回结果，有问题直接抛出异常
        if (!newWisdom || newWisdom.trim() === "" || newWisdom.indexOf("Error:") === 0) {
            throw new Error("AI调用失败或返回无效内容: " + newWisdom);
        }

        wisdomText = newWisdom;
        // 更新缓存
        var remainingMinutes = getRemainingMinutesToday();
        sdcl.storage.set(cacheKey, wisdomText, remainingMinutes);
        sdcl.storage.set(updateKey, currentTime, remainingMinutes);
    }

    // 创建全天智慧语录事件
    var today = new Date();
    var startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    var endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    var event = {
        title: "今日智慧语录",
        startDate: sdcl.date.format(startTime.getTime() / 1000),
        endDate: sdcl.date.format(endTime.getTime() / 1000),
        color: getRandomColor(),
        notes: wisdomText,
        isAllDay: true,
        isPointInTime: false,
        href: null,
        imageURL: null
    };

    events.push(event);

    return events;
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

// 随机选择语录风格
function getRandomStyle() {
    var styles = ["励志", "哲理", "诗意", "实用", "幽默"];
    var randomIndex = Math.floor(Math.random() * styles.length);
    return styles[randomIndex];
}

// 随机选择颜色
function getRandomColor() {
    var colors = [
        "#FF6B6B", // 温暖红色
        "#4ECDC4", // 宁静青色
        "#A8E6CF", // 清新绿色
        "#FFD93D", // 明亮黄色
        "#FF8C42", // 活泼橙色
        "#9F7AEA", // 优雅紫色
        "#4FD1C7", // 清澈青色
        "#F56565"  // 活力红色
    ];
    var randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
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
    var hour = date.getHours();

    // 季节判断
    var season = "";
    if (month >= 3 && month <= 5) season = "春天";
    else if (month >= 6 && month <= 8) season = "夏天";
    else if (month >= 9 && month <= 11) season = "秋天";
    else season = "冬天";

    // 时间段判断
    var timePeriod = "";
    if (hour >= 0 && hour < 6) timePeriod = "深夜凌晨";
    else if (hour >= 6 && hour < 12) timePeriod = "清晨上午";
    else if (hour >= 12 && hour < 18) timePeriod = "中午下午";
    else timePeriod = "傍晚夜晚";

    return {
        season: season,
        month: month,
        dayOfWeek: dayOfWeek,
        date: date.getDate(),
        timePeriod: timePeriod
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
    var contextPrompt = "现在是" + context.season + "，星期" + context.dayOfWeek + "，" + context.month + "月" + context.date + "日的" + context.timePeriod + "。";

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

