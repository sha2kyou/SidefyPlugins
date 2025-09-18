# Solana 代币价格监控

监控指定 Solana 代币的实时价格，通过 Phantom 价格 API 获取数据，并在达到阈值条件时生成提醒事件。

## 配置项

在插件配置中设置：

- tokens: 逗号分隔的代币符号列表，例如 `sol,v2ex,mb`
- [token]: 每个代币的合约地址，例如：
	- `sol = So11111111111111111111111111111111111111112`
	- `v2ex = 2VEXXz8JH1kq4i3b3t6b5c5k5c5k5c5k5c5k5c5k5c`
- [token]_watcher_value: 可选，阈值价格（number）。
- [token]watcher_direction: 可选，阈值方向，支持：
	- `down`（默认）：当价格低于 watcher_value 时触发。
	- `up`：当价格高于 watcher_value 时触发。

为兼容写法，脚本同时也识别键名 `[token]_watcher_direction`（带下划线）。推荐使用标准键名 `[token]watcher_direction`（无下划线）。

## 示例

```
# 监控两个代币
tokens = sol,v2ex

# 代币地址
sol = So11111111111111111111111111111111111111112
v2ex = 2VEXXz8JH1kq4i3b3t6b5c5k5c5k5c5k5c5k5c5k5c

# 阈值设置：当 V2EX 价格低于 0.01 提醒
v2ex_watcher_value = 0.01
v2ex_watcher_direction = down

# 当 SOL 价格高于 200 提醒
sol_watcher_value = 200
sol_watcher_direction = up
```

![参考配置图](https://raw.githubusercontent.com/HelloWorldImJoe/ImageHosting/master/Blog/image-20250918223551294.png)

## 输出事件说明

- 标题包含当前价格与 24h 涨跌幅，当触发阈值时会加上 🚨 标识以及条件说明（`< $阈值` 或 `> $阈值`）。
- 颜色：
	- 绿色：24h 上涨
	- 红色：24h 下跌
	- 蓝色：24h 无变化
	- 橙色：触发阈值提醒

## 备注

- 若不配置 watcher_value，将始终生成价格事件（仅展示信息，不含阈值告警）。
- 价格数据来源：Phantom API `https://api.phantom.app/price/v1/`。
