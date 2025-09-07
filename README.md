# SideCalendar 插件贡献指南

## 📁 文件结构

```
your-plugin-name/
    ├── main.js # 插件代码
    ├── info.json # 插件基础信息
    └── README.md # 说明文档
```

## info.json

```json
{
  "plugin_id": "bilibili_user_videos",
  "name": "Bilibili 用户视频",
  "description": "追踪指定B站UP主的最新视频投稿，实时显示视频标题、播放量、发布时间等信息",
  "version": "0.1.0",
  "author": "sha2kyou",
  "min_support_app_version": "2025.3.0",
  "tags": ["bilibili", "哔哩哔哩", "视频", "UP主", "动态", "社交媒体"],
  "category": "社交媒体",
  "config_options": {
    "mid": {
      "type": "string",
      "default": "",
      "description": "B站用户ID（mid参数）"
    },
    "pageSize": {
      "type": "number",
      "default": 25,
      "description": "每次获取的视频数量"
    }
  },
  "requirements": {
    "network": true,
    "storage": true
  }
}
```

## main.js

必须包含 fetchEvents 函数（可参考 [bilibili_user_videos](https://github.com/sha2kyou/SideCalendarPlugins/tree/main/bilibili_user_videos)）：

```javascript
function fetchEvents(config) {
  var events = [];

  try {
    // 你的业务逻辑

    events.push({
      title: "事件标题",
      startDate: "2024-01-01T10:00:00Z", // 必需，ISO8601格式
      endDate: "2024-01-01T11:00:00Z", // 必需，ISO8601格式
      color: "#FF5733", // 必需，十六进制颜色
      notes: "详细描述", // 可选
      icon: "https://example.com/icon.png", // 可选
      isAllDay: false, // 必需
      isPointInTime: true, // 必需
      href: "https://example.com", // 可选，点击跳转
    });
  } catch (err) {
    SideCalendar.log("插件错误: " + err.message);
  }

  return events;
}
```

## 提交步骤

1. Fork 本仓库
2. 在 SideCanlendar 自定义插件代码编辑器编辑代码
3. 在 SideCanlendar 测试插件功能
4. 在仓库目录创建插件文件夹和文件
5. 提交 Pull Request

>[!WARNING] 
>更多 API 说明请查看 SideCalendar 应用内的自定义插件编辑器文档页面

## 检查清单

- 插件在 SideCalendar 中测试通过
- 包含完整的错误处理
- 提交插件目录结构正确
- info.json 信息完整准确
- README.md 使用说明清晰
- 代码注释适当
