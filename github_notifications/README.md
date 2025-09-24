## GitHub 通知插件

获取 GitHub 通知和订阅信息，包括 @提及、issue分配、PR审查请求等通知，并在 Sidefy 中显示。

### 功能特性

- 获取 GitHub 通知（@提及、分配、审查请求等）
- 支持筛选特定类型的通知
- 智能缓存，减少 API 调用
- 不同通知类型使用不同颜色标识
- 点击通知可直接跳转到对应页面
- 支持参与模式和全部通知模式

### 支持的通知类型

| 类型 | 说明 | 颜色 | 默认启用 |
|------|------|------|----------|
| mention | @提及 | 红色 | 是 |
| assign | 分配给你的 issue/PR | 青色 | 是 |
| review_requested | 审查请求 | 蓝色 | 是 |
| subscribed | 你订阅了该内容 | 绿色 | 否 |
| team_mention | 团队被提及 | 黄色 | 否 |
| author | 你是创建者 | 紫色 | 否 |
| manual | 手动订阅 | 浅绿 | 否 |

### 配置参数

#### 必需参数

| 参数名 | 类型 | 说明 | 示例 |
|------|------|------|------|
| token | password | GitHub Personal Access Token | ghp_xxxxxxxxxxxxxxxxxxxx |

#### 可选参数

| 参数名 | 类型 | 默认值 | 说明 |
|------|------|------|------|
| limit | number | 20 | 获取通知数量（1-50） |
| showParticipating | boolean | false | 显示参与的通知 |
| showAll | boolean | true | 显示所有通知包括仓库订阅 |
| notificationTypes | string | 空白 | 通知类型筛选，逗号分隔（空白表示显示全部） |

### 如何获取 GitHub Token

1. 访问 GitHub Settings > Personal access tokens
2. 点击 "Generate new token"
3. 选择权限（需要 notifications 权限）
4. 复制生成的 token

### 通知类型配置

在 `notificationTypes` 参数中可以配置以下类型（逗号分隔）：

- mention: 你被@提及
- assign: 你被分配了任务
- review_requested: 你被请求审查
- author: 你是创建者
- subscribed: 你订阅了该内容
- team_mention: 团队被提及
- manual: 手动订阅

### 更新日志

#### v0.1.0

- 初始版本发布
- 支持获取 GitHub 通知
- 支持多种通知类型筛选
- 10分钟智能缓存机制
- 不同类型通知颜色区分