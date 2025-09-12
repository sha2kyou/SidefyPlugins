# GitHub 公开实时时间线 (GitHub Public Events)

这是一个为 SideCalendar 设计的插件，用于获取并展示 GitHub 上的最新公开动态。

## ✨ 功能

*   实时展示 GitHub 全局的公开事件，例如 `star`、`fork`、`issue`、`pull request` 等。
*   通过不同的颜色区分不同的事件类型，一目了然。
*   点击事件可直接跳转到对应的 GitHub 仓库页面。
*   可自定义显示的动态数量。

## ⚙️ 配置选项

*   `limit`: (可选) 要显示的最新动态数量。
    *   类型: `number`
    *   默认值: `10`

## 📝 使用说明

插件安装并启用后，会自动从 GitHub API 获取最新的公共事件并显示在时间线上。您可以在插件设置中调整 `limit` 参数来控制显示的数量。
