// GitHub 公开实时时间线 - 发现热门项目
function fetchEvents(config) {
    const events = [];
    const limit = (config && config.limit) ? config.limit : 10;

    try {
        // GitHub 公开事件 API (无需认证)
        const url = "https://api.github.com/events";
        const headers = {
            "User-Agent": "SideCalendar GitHub Explorer",
            "Accept": "application/vnd.github.v3+json"
        };

        const response = scl.httpGet(url, headers);
        if (response) {
            const data = JSON.parse(response);

            // 处理 GitHub 事件
            if (Array.isArray(data)) {
                data.slice(0, limit).forEach(function (event) {
                    const eventTime = new Date(event.created_at);
                    const endTime = new Date(eventTime.getTime() + 3600000); // 1小时后

                    let title = "";
                    const eventType = event.type;
                    let color = "#333333";

                    // // 根据事件类型设置标题和颜色
                    switch (eventType) {
                        case "WatchEvent":
                            title = `${event.actor.login} starred ${event.repo.name}`;
                            color = "#f1c232";
                            break;
                        case "ForkEvent":
                            title = `${event.actor.login} forked ${event.repo.name}`;
                            color = "#34a853";
                            break;
                        case "IssuesEvent":
                            title = `${event.actor.login} ${event.payload.action} issue in ${event.repo.name}`;
                            color = "#ea4335";
                            break;
                        case "PushEvent":
                            title = `${event.actor.login} pushed to ${event.repo.name}`;
                            color = "#4285f4";
                            break;
                        case "CreateEvent":
                            title = `${event.actor.login} created ${event.payload.ref_type} in ${event.repo.name}`;
                            color = "#ff6d01";
                            break;
                        case "PullRequestEvent":
                            title = `${event.actor.login} ${event.payload.action} pull request in ${event.repo.name}`;
                            color = "#9b59b6";
                            break;
                        default:
                            title = `${event.actor.login} ${eventType} in ${event.repo.name}`;
                            color = "#666666";
                    }

                    events.push({
                        title: title,
                        startDate: scl.formatDate(eventTime.getTime() / 1000),
                        endDate: scl.formatDate(endTime.getTime() / 1000),
                        color: color,
                        notes: "GitHub 公开事件 - " + event.repo.name,
                        icon: event.actor.avatar_url || null,
                        isAllDay: false,
                        isPointInTime: true,
                        href: "https://github.com/" + event.repo.name
                    });
                });
            }

            scl.log("获取了 " + events.length + " 个 GitHub 公开事件");
        }
    } catch (err) {
        scl.log("GitHub API 请求失败: " + err.message);
    }

    return events;
}