// GitHub 个人事件插件 - 获取指定用户的公开活动
function fetchEvents(config) {
    var events = [];
    
    // 获取配置参数
    var username = config.username;
    var token = config.token || "";
    var limit = parseInt(config.limit) || 10;
    
    if (!username) {
        throw new Error("请配置 username 参数");
    }
    
    // 限制数量范围
    if (limit < 1) limit = 1;
    if (limit > 100) limit = 100;
    
    var cacheKey = "github_user_events_" + username;
    
    try {
        // 检查缓存
        var cachedData = sdcl.storage.get(cacheKey);
        if (cachedData) {
            try {
                return JSON.parse(cachedData);
            } catch (parseError) {
                // 缓存解析失败，继续网络请求
            }
        }
        
        // 构建 API URL
        var url = "https://api.github.com/users/" + encodeURIComponent(username) + "/events/public?per_page=" + limit;
        
        // 设置请求头
        var headers = {
            "User-Agent": "SideCalendar GitHub Plugin",
            "Accept": "application/vnd.github.v3+json"
        };
        
        // 如果有 token，添加认证头
        if (token && token.trim() !== "") {
            headers["Authorization"] = "token " + token.trim();
        }
        
        // 发送请求
        var response = sdcl.http.get(url, headers);
        
        if (!response) {
            throw new Error("GitHub API 请求失败");
        }
        
        // 检查响应是否为有效 JSON
        if (!response.trim().startsWith('[')) {
            throw new Error("GitHub API 返回非 JSON 数据");
        }
        
        var data = JSON.parse(response);
        
        if (!Array.isArray(data)) {
            throw new Error("GitHub API 返回格式错误");
        }
        
        // 处理每个事件
        data.forEach(function(event) {
            var eventTime = new Date(event.created_at);
            var title = generateEventTitle(event);
            var color = getEventColor(event.type);
            var notes = generateEventNotes(event);
            var href = generateEventUrl(event);
            
            events.push({
                title: title,
                startDate: sdcl.date.format(eventTime.getTime() / 1000),
                endDate: sdcl.date.format(eventTime.getTime() / 1000),
                color: color,
                notes: notes,
                icon: event.actor.avatar_url || null,
                isAllDay: false,
                isPointInTime: true,
                href: href
            });
        });
        
        // 缓存结果（默认15分钟TTL）
        try {
            sdcl.storage.set(cacheKey, JSON.stringify(events));
        } catch (cacheError) {
            // 缓存失败不影响功能
        }
        
    } catch (err) {
        throw new Error("GitHub 个人事件获取失败: " + err.message);
    }
    
    return events;
}

// 生成事件标题
function generateEventTitle(event) {
    var actor = event.actor.login;
    var repo = event.repo ? event.repo.name : "";
    
    switch (event.type) {
        case "PushEvent":
            var commitCount = event.payload.commits ? event.payload.commits.length : 0;
            return actor + " 推送了 " + commitCount + " 个提交到 " + repo;
            
        case "CreateEvent":
            var refType = event.payload.ref_type;
            if (refType === "repository") {
                return actor + " 创建了仓库 " + repo;
            } else if (refType === "branch") {
                return actor + " 创建了分支 " + event.payload.ref + " 在 " + repo;
            } else if (refType === "tag") {
                return actor + " 创建了标签 " + event.payload.ref + " 在 " + repo;
            }
            return actor + " 创建了 " + refType + " 在 " + repo;
            
        case "DeleteEvent":
            return actor + " 删除了 " + event.payload.ref_type + " " + event.payload.ref + " 在 " + repo;
            
        case "ForkEvent":
            return actor + " fork 了 " + repo;
            
        case "WatchEvent":
            return actor + " star 了 " + repo;
            
        case "IssuesEvent":
            var action = event.payload.action;
            var issueNumber = event.payload.issue ? event.payload.issue.number : "";
            return actor + " " + action + " issue #" + issueNumber + " 在 " + repo;
            
        case "IssueCommentEvent":
            var issueNumber = event.payload.issue ? event.payload.issue.number : "";
            return actor + " 评论了 issue #" + issueNumber + " 在 " + repo;
            
        case "PullRequestEvent":
            var action = event.payload.action;
            var prNumber = event.payload.pull_request ? event.payload.pull_request.number : "";
            return actor + " " + action + " PR #" + prNumber + " 在 " + repo;
            
        case "PullRequestReviewEvent":
            var prNumber = event.payload.pull_request ? event.payload.pull_request.number : "";
            return actor + " 审查了 PR #" + prNumber + " 在 " + repo;
            
        case "ReleaseEvent":
            var tagName = event.payload.release ? event.payload.release.tag_name : "";
            return actor + " 发布了 " + tagName + " 在 " + repo;
            
        case "PublicEvent":
            return actor + " 公开了仓库 " + repo;
            
        case "MemberEvent":
            return actor + " 添加了协作者到 " + repo;
            
        default:
            return actor + " " + event.type.replace("Event", "") + " 在 " + repo;
    }
}

// 获取事件颜色
function getEventColor(eventType) {
    switch (eventType) {
        case "PushEvent":
            return "#4285f4"; // 蓝色
        case "CreateEvent":
            return "#ff6d01"; // 橙色
        case "DeleteEvent":
            return "#ea4335"; // 红色
        case "ForkEvent":
            return "#34a853"; // 绿色
        case "WatchEvent":
            return "#f1c232"; // 黄色
        case "IssuesEvent":
        case "IssueCommentEvent":
            return "#ea4335"; // 红色
        case "PullRequestEvent":
        case "PullRequestReviewEvent":
            return "#9b59b6"; // 紫色
        case "ReleaseEvent":
            return "#ff6d01"; // 橙色
        case "PublicEvent":
            return "#34a853"; // 绿色
        case "MemberEvent":
            return "#4285f4"; // 蓝色
        default:
            return "#666666"; // 灰色
    }
}

// 生成事件备注
function generateEventNotes(event) {
    var notes = "GitHub 活动";
    
    if (event.repo) {
        notes += "\n仓库: " + event.repo.name;
    }
    
    switch (event.type) {
        case "PushEvent":
            if (event.payload.commits && event.payload.commits.length > 0) {
                notes += "\n最新提交: " + event.payload.commits[0].message;
            }
            break;
            
        case "IssuesEvent":
        case "PullRequestEvent":
            var item = event.payload.issue || event.payload.pull_request;
            if (item && item.title) {
                notes += "\n标题: " + item.title;
            }
            break;
            
        case "ReleaseEvent":
            if (event.payload.release) {
                notes += "\n版本: " + event.payload.release.tag_name;
                if (event.payload.release.name) {
                    notes += "\n名称: " + event.payload.release.name;
                }
            }
            break;
    }
    
    return notes;
}

// 生成事件链接
function generateEventUrl(event) {
    if (!event.repo) {
        return "https://github.com/" + event.actor.login;
    }
    
    var baseUrl = "https://github.com/" + event.repo.name;
    
    switch (event.type) {
        case "IssuesEvent":
            if (event.payload.issue) {
                return baseUrl + "/issues/" + event.payload.issue.number;
            }
            break;
            
        case "PullRequestEvent":
            if (event.payload.pull_request) {
                return baseUrl + "/pull/" + event.payload.pull_request.number;
            }
            break;
            
        case "ReleaseEvent":
            if (event.payload.release) {
                return baseUrl + "/releases/tag/" + event.payload.release.tag_name;
            }
            break;
            
        case "CreateEvent":
            if (event.payload.ref_type === "branch") {
                return baseUrl + "/tree/" + event.payload.ref;
            } else if (event.payload.ref_type === "tag") {
                return baseUrl + "/releases/tag/" + event.payload.ref;
            }
            break;
    }
    
    return baseUrl;
}