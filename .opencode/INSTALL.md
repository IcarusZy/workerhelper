# 安装 WorkerHelper 插件

## 前置条件

- 已安装 [OpenCode](https://opencode.ai)

## 安装

在 `opencode.json`（全局或项目级）的 `plugin` 数组中添加：

```json
{
  "plugin": ["workerhelper@git+https://github.com/IcarusZy/workerhelper.git"]
}
```

重启 OpenCode 即可。插件会自动安装并注册所有技能。

## 验证

向 agent 提问："列出可用的 workerhelper 技能"

或使用 skill 工具加载：`worker-lookup`

## 使用

编码任务必须先加载 `worker-lookup`，再按其指引选择后续流程：

- 小型明确修改 → `exec-plan`
- 中大型或范围不清 → `design` → `plan` → `exec-plan`
- 功能变更完成后 → `worker-sync`

## 更新

插件内置自动更新：每次启动时检查 GitHub 最新 commit（每天最多一次），发现新版本后自动清除缓存，下次重启时自动拉取最新代码。

如需手动强制更新：移除缓存 `~/.cache/opencode/packages/workerhelper*` 后重启。

## 从旧的 `npx skills add` 方式迁移

```bash
rm -rf ~/.config/opencode/skills/workerhelper
# 或移除项目级符号链接
rm -rf .opencode/skills/workerhelper
```

然后在 `opencode.json` 中按上述方式配置 `plugin` 即可。
