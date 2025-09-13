## GitHub 个人事件插件

获取指定 GitHub 用户的公开活动事件，包括推送、fork、star、issue、PR 等活动。

### 功能特性

- 个人定制：指定任意 GitHub 用户名
- Token 支持：可选 GitHub Token 获得更高的 API 调用限制
- 多种事件：支持 Push、Fork、Star、Issue、PR、Release 等事件
- 颜色区分：不同事件类型使用不同颜色标识
- 智能缓存：15分钟缓存减少 API 调用
- 直接跳转：点击事件可直接跳转到对应的 GitHub 页面

### 配置参数

#### 必需参数

| 参数名 | 类型 | 说明 | 示例 |
|------|------|------|------|
| username | string | GitHub 用户名 | octocat |

#### 可选参数

| 参数名 | 类型 | 默认值 | 说明 |
|------|------|------|------|
| token | password | - | GitHub Personal Access Token |
| limit | number | "10" | 获取事件数量（1-100） |

### 如何获取 GitHub Token

1. 访问 GitHub Settings > Personal access tokens
2. 点击 "Generate new token"
3. 选择权限（读取公开仓库即可）
4. 复制生成的 token

### 支持的事件类型

- Push 事件：代码推送
- Create 事件：创建分支、标签、仓库
- Delete 事件：删除分支、标签
- Fork 事件：Fork 仓库
- Watch 事件：Star 仓库
- Issues 事件：创建、关闭 Issue
- Pull Request 事件：创建、合并 PR
- Release 事件：发布新版本
- 其他事件：公开仓库、添加协作者等

### 更新日志

#### v0.0.1

- 初始版本发布
- 支持基本的 GitHub 事件获取和显示
- 15分钟智能缓存机制