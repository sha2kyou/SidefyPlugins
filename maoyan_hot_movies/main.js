// 猫眼热映电影插件 - 使用 Jina Reader 爬取影院热映信息
  function fetchEvents(config) {
      var events = [];

      // --- 每日缓存逻辑 ---
      var today = new Date();
      var dateString = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
      var cacheKey = "maoyan_movies_" + dateString;

      var cachedData = sidefy.storage.get(cacheKey);
      if (cachedData) {
          return cachedData;
      }

      // 计算到当天结束剩余的分钟数
      var endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      var remainingMinutes = Math.ceil((endOfDay.getTime() - today.getTime()) / (1000 * 60));

      try {
          var url = "https://m.maoyan.com/";

          sidefy.log("开始使用 Jina Reader 爬取猫眼热映电影: " + url);

          var result = sidefy.crawler(url);

          if (!result || !result.success) {
              sidefy.log("爬取失败: " + (result ? result.error : "未知错误"));
              return [];
          }

          sidefy.log("爬取成功，内容长度: " + result.content.length + " 字符");

          if (result.content.length < 100) {
              sidefy.log("爬取内容过短");
              return [];
          }

          // 截取前 8000 字符
          var contentToAnalyze = result.content.substring(0, 8000);

          var movieNotes = getMovieNotes(contentToAnalyze);

          if (!movieNotes || movieNotes.trim().length === 0) {
              sidefy.log("未能获取电影信息");
              return [];
          }

          var now = new Date();

          events.push({
              title: "影院热映电影 TOP5",
              startDate: sidefy.date.format(now.getTime() / 1000),
              endDate: sidefy.date.format(now.getTime() / 1000),
              color: "#FF6B35",
              notes: movieNotes,
              icon: "https://www.maoyan.com/favicon.ico",
              isAllDay: true,
              isPointInTime: false,
              href: url,
              imageURL: null
          });

          sidefy.log("成功创建猫眼热映电影事件");

          // 将成功获取的事件缓存到当天结束
          if (events.length === 1) {
              sidefy.storage.set(cacheKey, events, remainingMinutes);
              sidefy.log("猫眼电影数据已缓存，缓存时长: " + remainingMinutes + " 分钟");
          }

      } catch (err) {
          sidefy.log("猫眼电影插件错误: " + err.message);
          return [];
      }

      return events;

      function getMovieNotes(content) {
          try {
              var prompt = "请分析以下猫眼电影页面内容，提取当前影院热映的电影名称。\n\n" +
                  "要求：\n" +
                  "1. 提取前 5 部热映电影\n" +
                  "2. 按以下格式输出：\n\n" +
                  "1. 电影名称1\n" +
                  "2. 电影名称2\n" +
                  "3. 电影名称3\n" +
                  "...\n\n" +
                  "点击查看更多电影信息\n\n" +
                  "注意：只输出电影名称，不要评分、主演等其他信息\n\n" +
                  "页面内容：\n" + content;

              sidefy.log("准备调用 AI");
              var aiResult = sidefy.ai.chat(prompt);

              if (!aiResult) {
                  sidefy.log("AI 调用返回空结果");
                  return "";
              }

              // AI 返回的就是 string，直接使用
              if (typeof aiResult !== 'string' || aiResult.trim().length === 0) {
                  sidefy.log("AI 返回内容为空或类型错误");
                  return "";
              }

              sidefy.log("AI 返回成功");
              return aiResult.trim();

          } catch (err) {
              sidefy.log("获取电影信息失败: " + err.message);
              return "";
          }
      }
  }