/**
 * Unsplash 每日图片插件
 * 每天获取一张 Unsplash 热门首页图片，在0点显示为全天事件。
 */
function fetchEvents(config) {
    // 检查 API 访问密钥是否存在
    var accessKey = config.access_key;
    if (!accessKey || accessKey.trim() === "") {
        throw new Error(sidefy.i18n({
            "zh": "请在插件配置中填入您的 Unsplash API 访问密钥 (Access Key)。",
            "en": "Please enter your Unsplash API Access Key in the plugin configuration.",
            "ja": "プラグイン設定に Unsplash API アクセスキーを入力してください。",
            "ko": "플러그인 설정에서 Unsplash API 액세스 키를 입력하세요.",
            "de": "Bitte geben Sie Ihren Unsplash API-Zugriffsschlüssel in der Plugin-Konfiguration ein.",
            "es": "Por favor, ingrese su clave de acceso a la API de Unsplash en la configuración del complemento.",
            "fr": "Veuillez entrer votre clé d'accès API Unsplash dans la configuration du plugin.",
            "pt": "Por favor, insira sua chave de acesso à API do Unsplash na configuração do plugin.",
            "ru": "Пожалуйста, введите ваш ключ доступа к API Unsplash в настройках плагина."
        }));
    }

    // --- 每日缓存逻辑 ---
    var today = new Date();
    var dateString = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
    var cacheKey = "unsplash_daily_photo_" + dateString;

    var cachedData = sidefy.storage.get(cacheKey);
    if (cachedData) {
        return cachedData;
    }

    // 计算到当天结束剩余的分钟数
    var endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    var remainingMinutes = Math.ceil((endOfDay.getTime() - today.getTime()) / (1000 * 60));

    // --- 获取热门首页图片 ---
    var events = [];
    try {
        // 获取 Unsplash 热门首页图片
        var url = "https://api.unsplash.com/photos/random?order_by=popular&orientation=landscape";

        var headers = {
            "Authorization": "Client-ID " + accessKey,
            "Accept-Version": "v1"
        };

        var response = sidefy.http.get(url, headers);
        if (!response) {
            throw new Error(sidefy.i18n({
                "zh": "获取 Unsplash 热门图片失败，请检查网络或API密钥。",
                "en": "Failed to fetch popular Unsplash photo. Please check your network or API key.",
                "ja": "Unsplashの人気写真の取得に失敗しました。ネットワークまたはAPIキーを確認してください。",
                "ko": "Unsplash 인기 사진을 가져오는데 실패했습니다. 네트워크 또는 API 키를 확인하세요.",
                "de": "Fehler beim Abrufen des beliebten Unsplash-Fotos. Bitte überprüfen Sie Ihr Netzwerk oder Ihren API-Schlüssel.",
                "es": "Error al obtener la foto popular de Unsplash. Por favor, verifique su red o clave API.",
                "fr": "Échec de la récupération de la photo populaire Unsplash. Veuillez vérifier votre réseau ou votre clé API.",
                "pt": "Falha ao buscar foto popular do Unsplash. Por favor, verifique sua rede ou chave API.",
                "ru": "Не удалось получить популярное фото Unsplash. Пожалуйста, проверьте ваше сетевое подключение или API-ключ."
            }));
        }

        var photo = JSON.parse(response);
        if (photo.errors) {
            throw new Error(sidefy.i18n({
                "zh": "Unsplash API 错误: " + photo.errors.join(", "),
                "en": "Unsplash API error: " + photo.errors.join(", "),
                "ja": "Unsplash API エラー: " + photo.errors.join(", "),
                "ko": "Unsplash API 오류: " + photo.errors.join(", "),
                "de": "Unsplash API-Fehler: " + photo.errors.join(", "),
                "es": "Error de API de Unsplash: " + photo.errors.join(", "),
                "fr": "Erreur de l'API Unsplash: " + photo.errors.join(", "),
                "pt": "Erro da API do Unsplash: " + photo.errors.join(", "),
                "ru": "Ошибка API Unsplash: " + photo.errors.join(", ")
            }));
        }

        // --- 创建日历事件 ---
        var eventDate = new Date();
        eventDate.setHours(0, 0, 0, 0); // 设置为0点

        var title = photo.alt_description || "Unsplash 每日精选";
        var notes = sidefy.i18n({
            "zh": "摄影师: " + photo.user.name,
            "en": "Photographer: " + photo.user.name,
            "ja": "写真家: " + photo.user.name,
            "ko": "사진가: " + photo.user.name,
            "de": "Fotograf: " + photo.user.name,
            "es": "Fotógrafo: " + photo.user.name,
            "fr": "Photographe: " + photo.user.name,
            "pt": "Fotógrafo: " + photo.user.name,
            "ru": "Фотограф: " + photo.user.name
        });
        if (photo.description) {
            notes += "\n" + sidefy.i18n({
                "zh": "描述: " + photo.description,
                "en": "Description: " + photo.description,
                "ja": "説明: " + photo.description,
                "ko": "설명: " + photo.description,
                "de": "Beschreibung: " + photo.description,
                "es": "Descripción: " + photo.description,
                "fr": "Description: " + photo.description,
                "pt": "Descrição: " + photo.description,
                "ru": "Описание: " + photo.description
            });
        }

        events.push({
            title: title,
            startDate: sidefy.date.format(eventDate.getTime() / 1000),
            endDate: sidefy.date.format(eventDate.getTime() / 1000),
            color: photo.color || "#666666",
            notes: notes,
            href: photo.links.html,
            icon: photo.user.profile_image.small, // 作者头像
            imageURL: photo.urls.small, // 使用 small 尺寸作为预览图
            isAllDay: true, // 设置为全天事件
            isPointInTime: false
        });

        // 将成功获取的事件缓存到当天结束
        if (events.length === 1) {
            sidefy.storage.set(cacheKey, events, remainingMinutes);
        } else {
            throw new Error(sidefy.i18n({
                "zh": "未能成功获取图片。",
                "en": "Failed to fetch photo successfully.",
                "ja": "写真を正常に取得できませんでした。",
                "ko": "사진을 성공적으로 가져오지 못했습니다.",
                "de": "Foto konnte nicht erfolgreich abgerufen werden.",
                "es": "No se pudo obtener la foto correctamente.",
                "fr": "Échec de la récupération de la photo.",
                "pt": "Falha ao buscar foto com sucesso.",
                "ru": "Не удалось успешно получить фотографию."
            }));
        }

    } catch (err) {
        throw new Error(sidefy.i18n({
            "zh": "Unsplash 插件执行失败: " + err.message,
            "en": "Unsplash plugin execution failed: " + err.message,
            "ja": "Unsplash プラグインの実行に失敗しました: " + err.message,
            "ko": "Unsplash 플러그인 실행 실패: " + err.message,
            "de": "Unsplash-Plugin-Ausführung fehlgeschlagen: " + err.message,
            "es": "Falló la ejecución del complemento de Unsplash: " + err.message,
            "fr": "Échec de l'exécution du plugin Unsplash: " + err.message,
            "pt": "Falha na execução do plugin do Unsplash: " + err.message,
            "ru": "Ошибка выполнения плагина Unsplash: " + err.message
        }));
    }

    return events;
}
