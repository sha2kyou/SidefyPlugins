# SideCalendar 插件贡献指南

[English](README.md) | [中文](README_ZH.md)

>[!WARNING] 
>免责声明：社区插件由第三方提供，SideCalendar不对其安全性承担责任，请用户自行校验与甄别。

## 📁 文件结构

```
//目录名称，同时也是客户端唯一插件id
your-plugin-name/
    ├── main.js # 插件代码
    ├── info.json # 插件基础信息
    └── README.md # 说明文档
```

## info.json

```json
{
  "name": "Bilibili 用户视频",
  "description": "追踪指定B站UP主的最新视频投稿，实时显示视频标题、播放量、发布时间等信息",
  //插件版本，更新后客户端会显示更新提醒
  "version": "0.1.0",
  "author": "sha2kyou",
  //限制最低适配的 SideCalendar 版本，比该版本低的客户端无法下载该插件
  "min_support_app_version": "2025.3.0",
  "tags": ["bilibili", "哔哩哔哩", "视频", "UP主", "动态", "社交媒体"],
  "category": "社交媒体",
  //配置参数在插件下载后会被自动映射到对应的输入框
  "config_options": {
    "mid": {
      "type": "string",
      "default": "",
      "description": "B站用户ID（mid参数）"
    },
    "pageSize": {
      "type": "number",
      "default": 10,
      "description": "每次获取的视频数量"
    }
  },
  //如果不申请正确的权限，则无法进行对应的操作。不配置默认都是 false
  "requirements": {
    //网络权限：限制单次请求超时30秒
    "network": true,
    //存储权限：最大限制存储16k数据，最大存储5条数据
    "storage": true,
    //AI 权限：使用用户在高级设置配置的大模型能力，最大限制每5分钟请求5次，单次请求超时30秒
    "ai": false
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
      href: "https://example.com", // 可选，点击跳转。支持 http/https/popup(自定义协议，跳转会弹出macOS文本框显示文本)
    });
  } catch (err) {
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
