// GitHub 通知插件 - 获取 GitHub 通知和订阅信息
function fetchEvents(config) {
    var events = [];

    // 获取配置参数
    var token = config.token;
    var limit = parseInt(config.limit) || 20;
    var showParticipating = config.showParticipating === true; // 默认为false
    var showAll = config.showAll !== false; // 默认为true
    var notificationTypes = config.notificationTypes || "";

    if (!token || token.trim() === "") {
        throw new Error(sidefy.i18n({
            "zh": "请配置 GitHub Personal Access Token",
            "en": "Please configure GitHub Personal Access Token",
            "ja": "GitHub Personal Access Token を設定してください",
            "ko": "GitHub Personal Access Token을 설정하세요",
            "de": "Bitte konfigurieren Sie das GitHub Personal Access Token",
            "es": "Por favor, configure el GitHub Personal Access Token",
            "fr": "Veuillez configurer le GitHub Personal Access Token",
            "pt": "Por favor, configure o GitHub Personal Access Token",
            "ru": "Пожалуйста, настройте GitHub Personal Access Token"
        }));
    }

    // 限制数量范围
    if (limit < 1) limit = 1;
    if (limit > 50) limit = 50;

    // 解析通知类型 - 如果为空则不筛选
    var allowedTypes = [];
    if (notificationTypes && notificationTypes.trim() !== "") {
        allowedTypes = notificationTypes.split(",").map(function(type) {
            return type.trim();
        });
    }

    var cacheKey = "github_notifications_" + (showParticipating ? "participating" : "all") + "_" + limit;

    try {
        // 检查缓存
        var cachedData = sidefy.storage.get(cacheKey);
        if (cachedData) {
            return cachedData;
        }

        // 构建 API URL
        var url = "https://api.github.com/notifications?per_page=" + limit;
        if (showParticipating && !showAll) {
            url += "&participating=true";
        }
        if (showAll) {
            url += "&all=true";
        }

        // 设置请求头
        var headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
            "Accept": "application/vnd.github.v3+json",
            "Authorization": "token " + token.trim()
        };

        // 发送请求
        var response = sidefy.http.get(url, headers);

        if (!response || response.length === 0) {
            throw new Error(sidefy.i18n({
                "zh": "GitHub API 返回空响应",
                "en": "GitHub API returned empty response",
                "ja": "GitHub API が空のレスポンスを返しました",
                "ko": "GitHub API가 빈 응답을 반환했습니다",
                "de": "GitHub API hat eine leere Antwort zurückgegeben",
                "es": "La API de GitHub devolvió una respuesta vacía",
                "fr": "L'API GitHub a renvoyé une réponse vide",
                "pt": "A API do GitHub retornou uma resposta vazia",
                "ru": "GitHub API вернул пустой ответ"
            }));
        }

        var notifications = JSON.parse(response);

        if (!Array.isArray(notifications)) {
            if (notifications.message) {
                throw new Error(sidefy.i18n({
                    "zh": "GitHub API 错误: " + notifications.message,
                    "en": "GitHub API error: " + notifications.message,
                    "ja": "GitHub API エラー: " + notifications.message,
                    "ko": "GitHub API 오류: " + notifications.message,
                    "de": "GitHub API Fehler: " + notifications.message,
                    "es": "Error de API de GitHub: " + notifications.message,
                    "fr": "Erreur de l'API GitHub: " + notifications.message,
                    "pt": "Erro da API do GitHub: " + notifications.message,
                    "ru": "Ошибка GitHub API: " + notifications.message
                }));
            }
            throw new Error(sidefy.i18n({
                "zh": "GitHub API 返回数据格式错误",
                "en": "GitHub API returned invalid data format",
                "ja": "GitHub API が無効なデータ形式を返しました",
                "ko": "GitHub API가 잘못된 데이터 형식을 반환했습니다",
                "de": "GitHub API hat ein ungültiges Datenformat zurückgegeben",
                "es": "La API de GitHub devolvió un formato de datos no válido",
                "fr": "L'API GitHub a renvoyé un format de données invalide",
                "pt": "A API do GitHub retornou um formato de dados inválido",
                "ru": "GitHub API вернул неверный формат данных"
            }));
        }

        // 处理通知数据
        sidefy.log("[GitHub通知] 开始处理 " + notifications.length + " 个通知");
        notifications.forEach(function(notification) {
            var notificationTime = new Date(notification.updated_at);
            var localTimeStr = notificationTime.toLocaleString();

            sidefy.log("[GitHub通知] 通知: " + notification.subject.title + " | 原始时间: " + notification.updated_at + " | 本地时间: " + localTimeStr + " | 类型: " + notification.reason);

            // 检查通知类型是否在允许列表中（如果有配置的话）
            if (allowedTypes.length > 0 && allowedTypes.indexOf(notification.reason) === -1) {
                sidefy.log("[GitHub通知] 跳过类型: " + notification.reason);
                return; // 跳过不需要的通知类型
            }

            var title = getNotificationTitle(notification);
            var color = getNotificationColor(notification.reason);

            // 直接使用GitHub API返回的UTC时间，JavaScript会自动处理本地时区显示
            var localStartTime = notificationTime;
            var localEndTime = new Date(localStartTime.getTime() + 30 * 60 * 1000); // 30分钟后结束

            var event = {
                title: title,
                startDate: sidefy.date.format(localStartTime.getTime() / 1000),
                endDate: sidefy.date.format(localEndTime.getTime() / 1000),
                color: color,
                notes: getNotificationNotes(notification),
                isAllDay: false,
                isPointInTime: true,
                href: getNotificationUrl(notification)
            };

            events.push(event);
        });

        // 缓存结果 - 10分钟缓存
        var cacheOptions = {
            ttl: 10 * 60 * 1000
        };
        sidefy.storage.set(cacheKey, events, cacheOptions);

        return events;

    } catch (error) {
        throw new Error(sidefy.i18n({
            "zh": "获取 GitHub 通知失败: " + error.message,
            "en": "Failed to fetch GitHub notifications: " + error.message,
            "ja": "GitHub 通知の取得に失敗しました: " + error.message,
            "ko": "GitHub 알림을 가져오는 데 실패했습니다: " + error.message,
            "de": "GitHub-Benachrichtigungen konnten nicht abgerufen werden: " + error.message,
            "es": "Error al obtener notificaciones de GitHub: " + error.message,
            "fr": "Échec de la récupération des notifications GitHub: " + error.message,
            "pt": "Falha ao buscar notificações do GitHub: " + error.message,
            "ru": "Не удалось получить уведомления GitHub: " + error.message
        }));
    }
}

// 生成通知标题
function getNotificationTitle(notification) {
    var typeText = getNotificationTypeText(notification.reason);
    var repoName = notification.repository.name;
    var subject = notification.subject.title;

    return "[" + typeText + "] " + repoName + ": " + subject;
}

// 获取通知类型显示文本
function getNotificationTypeText(reason) {
    var typeMap = {
        "mention": "@mention",
        "assign": "assign",
        "review_requested": "review",
        "subscribed": "subscribed",
        "team_mention": "team",
        "author": "author",
        "manual": "manual",
        "comment": "comment",
        "state_change": "state",
        "security_alert": "security",
        "ci_activity": "ci"
    };

    return typeMap[reason] || reason;
}

// 获取通知颜色
function getNotificationColor(reason) {
    var colorMap = {
        "mention": "#FF6B6B",           // 红色 - 提及
        "assign": "#4ECDC4",           // 青色 - 分配
        "review_requested": "#45B7D1", // 蓝色 - 审查请求
        "subscribed": "#96CEB4",       // 绿色 - 订阅
        "team_mention": "#FFEAA7",     // 黄色 - 团队提及
        "author": "#DDA0DD",           // 紫色 - 作者
        "manual": "#98D8C8",           // 浅绿 - 手动订阅
        "comment": "#FFB347",          // 橙色 - 评论
        "state_change": "#FF8C94",     // 粉红色 - 状态变更
        "security_alert": "#DC3545",   // 深红色 - 安全警报
        "ci_activity": "#6C757D"       // 灰色 - CI活动
    };

    return colorMap[reason] || "#95A5A6";
}

// 生成通知详细信息
function getNotificationNotes(notification) {
    var notes = [];

    notes.push(sidefy.i18n({"zh": "仓库", "en": "Repository", "ja": "リポジトリ", "ko": "저장소", "de": "Repository", "es": "Repositorio", "fr": "Dépôt", "pt": "Repositório", "ru": "Репозиторий"}) + ": " + notification.repository.full_name);
    notes.push(sidefy.i18n({"zh": "主题", "en": "Subject", "ja": "件名", "ko": "주제", "de": "Betreff", "es": "Asunto", "fr": "Sujet", "pt": "Assunto", "ru": "Тема"}) + ": " + notification.subject.type);

    if (notification.unread) {
        notes.push(sidefy.i18n({"zh": "状态: 未读", "en": "Status: Unread", "ja": "ステータス: 未読", "ko": "상태: 읽지 않음", "de": "Status: Ungelesen", "es": "Estado: No leído", "fr": "Statut: Non lu", "pt": "Status: Não lido", "ru": "Статус: Непрочитано"}));
    } else {
        notes.push(sidefy.i18n({"zh": "状态: 已读", "en": "Status: Read", "ja": "ステータス: 既読", "ko": "상태: 읽음", "de": "Status: Gelesen", "es": "Estado: Leído", "fr": "Statut: Lu", "pt": "Status: Lido", "ru": "Статус: Прочитано"}));
    }

    // 添加具体的原因描述
    var reasonDesc = getReasonDescription(notification.reason);
    if (reasonDesc) {
        notes.push(sidefy.i18n({"zh": "详情", "en": "Details", "ja": "詳細", "ko": "상세정보", "de": "Details", "es": "Detalles", "fr": "Détails", "pt": "Detalhes", "ru": "Детали"}) + ": " + reasonDesc);
    }

    return notes.join("\n");
}

// 获取通知原因的详细描述
function getReasonDescription(reason) {
    var descriptions = {
        "mention": sidefy.i18n({"zh": "你被在评论中@提及", "en": "You were @mentioned in a comment", "ja": "コメントで@メンションされました", "ko": "댓글에서 @언급되었습니다", "de": "Sie wurden in einem Kommentar @erwähnt", "es": "Fuiste @mencionado en un comentario", "fr": "Vous avez été @mentionné dans un commentaire", "pt": "Você foi @mencionado em um comentário", "ru": "Вас @упомянули в комментарии"}),
        "assign": sidefy.i18n({"zh": "你被分配到此任务", "en": "You were assigned to this task", "ja": "このタスクに割り当てられました", "ko": "이 작업에 할당되었습니다", "de": "Sie wurden dieser Aufgabe zugewiesen", "es": "Fuiste asignado a esta tarea", "fr": "Vous avez été assigné à cette tâche", "pt": "Você foi atribuído a esta tarefa", "ru": "Вам назначена эта задача"}),
        "review_requested": sidefy.i18n({"zh": "请求你进行代码审查", "en": "Code review requested from you", "ja": "コードレビューをリクエストされました", "ko": "코드 검토가 요청되었습니다", "de": "Code-Überprüfung von Ihnen angefordert", "es": "Se te solicitó una revisión de código", "fr": "Révision de code demandée de votre part", "pt": "Revisão de código solicitada de você", "ru": "Запрошена проверка кода от вас"}),
        "subscribed": sidefy.i18n({"zh": "你订阅了此项目的更新", "en": "You subscribed to updates", "ja": "アップデートを購読しています", "ko": "업데이트를 구독했습니다", "de": "Sie haben Updates abonniert", "es": "Te suscribiste a las actualizaciones", "fr": "Vous vous êtes abonné aux mises à jour", "pt": "Você se inscreveu nas atualizações", "ru": "Вы подписались на обновления"}),
        "team_mention": sidefy.i18n({"zh": "你的团队被提及", "en": "Your team was mentioned", "ja": "チームがメンションされました", "ko": "팀이 언급되었습니다", "de": "Ihr Team wurde erwähnt", "es": "Tu equipo fue mencionado", "fr": "Votre équipe a été mentionnée", "pt": "Sua equipe foi mencionada", "ru": "Ваша команда была упомянута"}),
        "author": sidefy.i18n({"zh": "你是此项目的作者", "en": "You are the author", "ja": "あなたが作成者です", "ko": "당신이 작성자입니다", "de": "Sie sind der Autor", "es": "Eres el autor", "fr": "Vous êtes l'auteur", "pt": "Você é o autor", "ru": "Вы автор"}),
        "manual": sidefy.i18n({"zh": "你手动订阅了此通知", "en": "Manually subscribed", "ja": "手動で購読しました", "ko": "수동으로 구독했습니다", "de": "Manuell abonniert", "es": "Suscrito manualmente", "fr": "Abonné manuellement", "pt": "Inscrito manualmente", "ru": "Подписано вручную"}),
        "comment": sidefy.i18n({"zh": "有新的评论", "en": "New comment", "ja": "新しいコメント", "ko": "새 댓글", "de": "Neuer Kommentar", "es": "Nuevo comentario", "fr": "Nouveau commentaire", "pt": "Novo comentário", "ru": "Новый комментарий"}),
        "state_change": sidefy.i18n({"zh": "Issue或PR状态发生变更", "en": "State changed", "ja": "状態が変更されました", "ko": "상태가 변경되었습니다", "de": "Status geändert", "es": "Estado cambiado", "fr": "État modifié", "pt": "Estado alterado", "ru": "Статус изменен"}),
        "security_alert": sidefy.i18n({"zh": "发现安全漏洞", "en": "Security vulnerability found", "ja": "セキュリティの脆弱性が見つかりました", "ko": "보안 취약점이 발견되었습니다", "de": "Sicherheitslücke gefunden", "es": "Vulnerabilidad de seguridad encontrada", "fr": "Vulnérabilité de sécurité trouvée", "pt": "Vulnerabilidade de segurança encontrada", "ru": "Обнаружена уязвимость безопасности"}),
        "ci_activity": sidefy.i18n({"zh": "CI/CD流水线有活动", "en": "CI/CD pipeline activity", "ja": "CI/CDパイプラインのアクティビティ", "ko": "CI/CD 파이프라인 활동", "de": "CI/CD-Pipeline-Aktivität", "es": "Actividad de pipeline CI/CD", "fr": "Activité de pipeline CI/CD", "pt": "Atividade de pipeline CI/CD", "ru": "Активность CI/CD конвейера"})
    };

    return descriptions[reason] || "";
}

// 获取通知链接
function getNotificationUrl(notification) {
    // 优先使用 subject.url，转换为网页链接
    if (notification.subject.url) {
        var url = notification.subject.url;
        // 只需要替换 API 前缀为网页前缀
        url = url.replace("https://api.github.com/repos/", "https://github.com/");
        url = url.replace("/pulls/", "/pull/");
        return url;
    }

    // 备用：仓库链接
    if (notification.repository.html_url) {
        return notification.repository.html_url;
    }

    return "https://github.com/" + notification.repository.full_name;
}

// 格式化日期
function formatDate(date) {
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var day = String(date.getDate()).padStart(2, '0');
    var hours = String(date.getHours()).padStart(2, '0');
    var minutes = String(date.getMinutes()).padStart(2, '0');

    return year + "-" + month + "-" + day + " " + hours + ":" + minutes;
}

// String.padStart polyfill for older environments
if (!String.prototype.padStart) {
    String.prototype.padStart = function(targetLength, padString) {
        targetLength = targetLength >> 0;
        padString = String(padString || ' ');
        if (this.length > targetLength) {
            return String(this);
        } else {
            targetLength = targetLength - this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength / padString.length);
            }
            return padString.slice(0, targetLength) + String(this);
        }
    };
}