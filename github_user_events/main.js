// GitHub 个人事件插件 - 获取指定用户的公开活动
function fetchEvents(config) {
    var events = [];

    // 获取配置参数
    var username = config.username;
    var token = config.token || "";
    var limit = parseInt(config.limit) || 10;

    if (!username) {
        throw new Error(sdcl.i18n({
            "zh": "请配置 username 参数",
            "en": "Please configure username parameter",
            "ja": "username パラメータを設定してください",
            "ko": "username 매개변수를 설정하세요",
            "de": "Bitte konfigurieren Sie den username-Parameter",
            "es": "Por favor, configure el parámetro username",
            "fr": "Veuillez configurer le paramètre username",
            "pt": "Por favor, configure o parâmetro username",
            "ru": "Пожалуйста, настройте параметр username"
        }));
    }

    // 限制数量范围
    if (limit < 1) limit = 1;
    if (limit > 100) limit = 100;

    var cacheKey = "github_user_events_" + username;

    try {
        // 检查缓存 - 简化处理
        var cachedData = sdcl.storage.get(cacheKey);
        if (cachedData) {
            return cachedData; // 直接返回，TTL函数已处理反序列化
        }

        // 构建 API URL
        var url = "https://api.github.com/users/" + encodeURIComponent(username) + "/events/public?per_page=" + limit;

        // 设置请求头
        var headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
            "Accept": "application/vnd.github.v3+json"
        };

        // 如果有 token，添加认证头
        if (token && token.trim() !== "") {
            headers["Authorization"] = "token " + token.trim();
        }

        // 发送请求
        var response = sdcl.http.get(url, headers);

        if (!response) {
            throw new Error(sdcl.i18n({
                "zh": "GitHub API 请求失败",
                "en": "GitHub API request failed",
                "ja": "GitHub API リクエストが失敗しました",
                "ko": "GitHub API 요청 실패",
                "de": "GitHub API-Anfrage fehlgeschlagen",
                "es": "Solicitud de API de GitHub falló",
                "fr": "Échec de la requête de l'API GitHub",
                "pt": "Falha na solicitação da API do GitHub",
                "ru": "Запрос GitHub API не удался"
            }));
        }

        // 检查响应是否为有效 JSON
        if (!response.trim().startsWith('[')) {
            throw new Error(sdcl.i18n({
                "zh": "GitHub API 返回非 JSON 数据",
                "en": "GitHub API returned non-JSON data",
                "ja": "GitHub API が非JSON データを返しました",
                "ko": "GitHub API가 JSON이 아닌 데이터를 반환했습니다",
                "de": "GitHub API hat Nicht-JSON-Daten zurückgegeben",
                "es": "La API de GitHub devolvió datos no JSON",
                "fr": "L'API GitHub a renvoyé des données non JSON",
                "pt": "A API do GitHub retornou dados não JSON",
                "ru": "GitHub API вернул не-JSON данные"
            }));
        }

        var data = JSON.parse(response);

        if (!Array.isArray(data)) {
            throw new Error(sdcl.i18n({
                "zh": "GitHub API 返回格式错误",
                "en": "GitHub API returned invalid format",
                "ja": "GitHub API が無効な形式を返しました",
                "ko": "GitHub API가 잘못된 형식을 반환했습니다",
                "de": "GitHub API hat ein ungültiges Format zurückgegeben",
                "es": "La API de GitHub devolvió un formato no válido",
                "fr": "L'API GitHub a renvoyé un format invalide",
                "pt": "A API do GitHub retornou um formato inválido",
                "ru": "GitHub API вернул неверный формат"
            }));
        }

        // 处理每个事件
        data.forEach(function (event) {
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

        // 缓存结果 - 直接传递数组，使用30分钟TTL
        sdcl.storage.set(cacheKey, events, 30);

    } catch (err) {
        throw new Error(sdcl.i18n({
            "zh": "GitHub 个人事件获取失败: " + err.message,
            "en": "Failed to fetch GitHub user events: " + err.message,
            "ja": "GitHub ユーザーイベントの取得に失敗しました: " + err.message,
            "ko": "GitHub 사용자 이벤트를 가져오는 데 실패했습니다: " + err.message,
            "de": "GitHub-Benutzerereignisse konnten nicht abgerufen werden: " + err.message,
            "es": "Error al obtener eventos de usuario de GitHub: " + err.message,
            "fr": "Échec de la récupération des événements utilisateur GitHub: " + err.message,
            "pt": "Falha ao buscar eventos de usuário do GitHub: " + err.message,
            "ru": "Не удалось получить события пользователя GitHub: " + err.message
        }));
    }

    return events;
}

// 其余函数保持不变...
function generateEventTitle(event) {
    var actor = event.actor.login;
    var repo = event.repo ? event.repo.name : "";

    switch (event.type) {
        case "PushEvent":
            var commitCount = event.payload.commits ? event.payload.commits.length : 0;
            return actor + " " + sdcl.i18n({"zh": "推送了", "en": "pushed", "ja": "プッシュしました", "ko": "푸시했습니다", "de": "hat gepusht", "es": "empujó", "fr": "a poussé", "pt": "empurrou", "ru": "отправил"}) + " " + commitCount + " " + sdcl.i18n({"zh": "个提交到", "en": "commits to", "ja": "コミット →", "ko": "커밋 →", "de": "Commits nach", "es": "commits a", "fr": "commits vers", "pt": "commits para", "ru": "коммитов в"}) + " " + repo;

        case "CreateEvent":
            var refType = event.payload.ref_type;
            if (refType === "repository") {
                return actor + " " + sdcl.i18n({"zh": "创建了仓库", "en": "created repository", "ja": "リポジトリを作成", "ko": "저장소를 생성했습니다", "de": "hat Repository erstellt", "es": "creó repositorio", "fr": "a créé le dépôt", "pt": "criou repositório", "ru": "создал репозиторий"}) + " " + repo;
            } else if (refType === "branch") {
                return actor + " " + sdcl.i18n({"zh": "创建了分支", "en": "created branch", "ja": "ブランチを作成", "ko": "브랜치를 생성했습니다", "de": "hat Branch erstellt", "es": "creó rama", "fr": "a créé la branche", "pt": "criou branch", "ru": "создал ветку"}) + " " + event.payload.ref + " " + sdcl.i18n({"zh": "在", "en": "in", "ja": "→", "ko": "→", "de": "in", "es": "en", "fr": "dans", "pt": "em", "ru": "в"}) + " " + repo;
            } else if (refType === "tag") {
                return actor + " " + sdcl.i18n({"zh": "创建了标签", "en": "created tag", "ja": "タグを作成", "ko": "태그를 생성했습니다", "de": "hat Tag erstellt", "es": "creó etiqueta", "fr": "a créé le tag", "pt": "criou tag", "ru": "создал тег"}) + " " + event.payload.ref + " " + sdcl.i18n({"zh": "在", "en": "in", "ja": "→", "ko": "→", "de": "in", "es": "en", "fr": "dans", "pt": "em", "ru": "в"}) + " " + repo;
            }
            return actor + " " + sdcl.i18n({"zh": "创建了", "en": "created", "ja": "作成", "ko": "생성했습니다", "de": "hat erstellt", "es": "creó", "fr": "a créé", "pt": "criou", "ru": "создал"}) + " " + refType + " " + sdcl.i18n({"zh": "在", "en": "in", "ja": "→", "ko": "→", "de": "in", "es": "en", "fr": "dans", "pt": "em", "ru": "в"}) + " " + repo;

        case "DeleteEvent":
            return actor + " " + sdcl.i18n({"zh": "删除了", "en": "deleted", "ja": "削除しました", "ko": "삭제했습니다", "de": "hat gelöscht", "es": "eliminó", "fr": "a supprimé", "pt": "excluiu", "ru": "удалил"}) + " " + event.payload.ref_type + " " + event.payload.ref + " " + sdcl.i18n({"zh": "在", "en": "in", "ja": "→", "ko": "→", "de": "in", "es": "en", "fr": "dans", "pt": "em", "ru": "в"}) + " " + repo;

        case "ForkEvent":
            return actor + " " + sdcl.i18n({"zh": "fork 了", "en": "forked", "ja": "フォークしました", "ko": "포크했습니다", "de": "hat geforkt", "es": "bifurcó", "fr": "a forké", "pt": "bifurcou", "ru": "форкнул"}) + " " + repo;

        case "WatchEvent":
            return actor + " " + sdcl.i18n({"zh": "star 了", "en": "starred", "ja": "スターしました", "ko": "스타했습니다", "de": "hat Stern gegeben", "es": "destacó", "fr": "a étoilé", "pt": "favoritou", "ru": "отметил звездой"}) + " " + repo;

        case "IssuesEvent":
            var action = event.payload.action;
            var issueNumber = event.payload.issue ? event.payload.issue.number : "";
            return actor + " " + action + " issue #" + issueNumber + " " + sdcl.i18n({"zh": "在", "en": "in", "ja": "→", "ko": "→", "de": "in", "es": "en", "fr": "dans", "pt": "em", "ru": "в"}) + " " + repo;

        case "IssueCommentEvent":
            var issueNumber = event.payload.issue ? event.payload.issue.number : "";
            return actor + " " + sdcl.i18n({"zh": "评论了", "en": "commented on", "ja": "コメントしました", "ko": "댓글을 달았습니다", "de": "hat kommentiert", "es": "comentó", "fr": "a commenté", "pt": "comentou", "ru": "прокомментировал"}) + " issue #" + issueNumber + " " + sdcl.i18n({"zh": "在", "en": "in", "ja": "→", "ko": "→", "de": "in", "es": "en", "fr": "dans", "pt": "em", "ru": "в"}) + " " + repo;

        case "PullRequestEvent":
            var action = event.payload.action;
            var prNumber = event.payload.pull_request ? event.payload.pull_request.number : "";
            return actor + " " + action + " PR #" + prNumber + " " + sdcl.i18n({"zh": "在", "en": "in", "ja": "→", "ko": "→", "de": "in", "es": "en", "fr": "dans", "pt": "em", "ru": "в"}) + " " + repo;

        case "PullRequestReviewEvent":
            var prNumber = event.payload.pull_request ? event.payload.pull_request.number : "";
            return actor + " " + sdcl.i18n({"zh": "审查了", "en": "reviewed", "ja": "レビューしました", "ko": "검토했습니다", "de": "hat überprüft", "es": "revisó", "fr": "a examiné", "pt": "revisou", "ru": "просмотрел"}) + " PR #" + prNumber + " " + sdcl.i18n({"zh": "在", "en": "in", "ja": "→", "ko": "→", "de": "in", "es": "en", "fr": "dans", "pt": "em", "ru": "в"}) + " " + repo;

        case "ReleaseEvent":
            var tagName = event.payload.release ? event.payload.release.tag_name : "";
            return actor + " " + sdcl.i18n({"zh": "发布了", "en": "released", "ja": "リリースしました", "ko": "릴리스했습니다", "de": "hat veröffentlicht", "es": "lanzó", "fr": "a publié", "pt": "lançou", "ru": "выпустил"}) + " " + tagName + " " + sdcl.i18n({"zh": "在", "en": "in", "ja": "→", "ko": "→", "de": "in", "es": "en", "fr": "dans", "pt": "em", "ru": "в"}) + " " + repo;

        case "PublicEvent":
            return actor + " " + sdcl.i18n({"zh": "公开了仓库", "en": "made public", "ja": "公開しました", "ko": "공개했습니다", "de": "hat öffentlich gemacht", "es": "hizo público", "fr": "a rendu public", "pt": "tornou público", "ru": "сделал публичным"}) + " " + repo;

        case "MemberEvent":
            return actor + " " + sdcl.i18n({"zh": "添加了协作者到", "en": "added collaborator to", "ja": "コラボレーターを追加", "ko": "협력자를 추가했습니다", "de": "hat Mitarbeiter hinzugefügt zu", "es": "agregó colaborador a", "fr": "a ajouté un collaborateur à", "pt": "adicionou colaborador a", "ru": "добавил соавтора в"}) + " " + repo;

        default:
            return actor + " " + event.type.replace("Event", "") + " " + sdcl.i18n({"zh": "在", "en": "in", "ja": "→", "ko": "→", "de": "in", "es": "en", "fr": "dans", "pt": "em", "ru": "в"}) + " " + repo;
    }
}

function getEventColor(eventType) {
    switch (eventType) {
        case "PushEvent":
            return "#4285f4";
        case "CreateEvent":
            return "#ff6d01";
        case "DeleteEvent":
            return "#ea4335";
        case "ForkEvent":
            return "#34a853";
        case "WatchEvent":
            return "#f1c232";
        case "IssuesEvent":
        case "IssueCommentEvent":
            return "#ea4335";
        case "PullRequestEvent":
        case "PullRequestReviewEvent":
            return "#9b59b6";
        case "ReleaseEvent":
            return "#ff6d01";
        case "PublicEvent":
            return "#34a853";
        case "MemberEvent":
            return "#4285f4";
        default:
            return "#666666";
    }
}

function generateEventNotes(event) {
    var notes = sdcl.i18n({"zh": "GitHub 活动", "en": "GitHub Activity", "ja": "GitHub アクティビティ", "ko": "GitHub 활동", "de": "GitHub-Aktivität", "es": "Actividad de GitHub", "fr": "Activité GitHub", "pt": "Atividade do GitHub", "ru": "Активность GitHub"});

    if (event.repo) {
        notes += "\n" + sdcl.i18n({"zh": "仓库", "en": "Repository", "ja": "リポジトリ", "ko": "저장소", "de": "Repository", "es": "Repositorio", "fr": "Dépôt", "pt": "Repositório", "ru": "Репозиторий"}) + ": " + event.repo.name;
    }

    switch (event.type) {
        case "PushEvent":
            if (event.payload.commits && event.payload.commits.length > 0) {
                notes += "\n" + sdcl.i18n({"zh": "最新提交", "en": "Latest commit", "ja": "最新のコミット", "ko": "최신 커밋", "de": "Neuester Commit", "es": "Último commit", "fr": "Dernier commit", "pt": "Último commit", "ru": "Последний коммит"}) + ": " + event.payload.commits[0].message;
            }
            break;

        case "IssuesEvent":
        case "PullRequestEvent":
            var item = event.payload.issue || event.payload.pull_request;
            if (item && item.title) {
                notes += "\n" + sdcl.i18n({"zh": "标题", "en": "Title", "ja": "タイトル", "ko": "제목", "de": "Titel", "es": "Título", "fr": "Titre", "pt": "Título", "ru": "Заголовок"}) + ": " + item.title;
            }
            break;

        case "ReleaseEvent":
            if (event.payload.release) {
                notes += "\n" + sdcl.i18n({"zh": "版本", "en": "Version", "ja": "バージョン", "ko": "버전", "de": "Version", "es": "Versión", "fr": "Version", "pt": "Versão", "ru": "Версия"}) + ": " + event.payload.release.tag_name;
                if (event.payload.release.name) {
                    notes += "\n" + sdcl.i18n({"zh": "名称", "en": "Name", "ja": "名前", "ko": "이름", "de": "Name", "es": "Nombre", "fr": "Nom", "pt": "Nome", "ru": "Название"}) + ": " + event.payload.release.name;
                }
            }
            break;
    }

    return notes;
}

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