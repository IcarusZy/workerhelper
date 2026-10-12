# 安装 WorkerHelper 插件

## 前置条件

- 已安装 [OpenCode](https://opencode.ai) **v2 或更高**（v1 请升级：`opencode upgrade --major`）

> 本插件自 1.2.0 起为 OpenCode **V2 原生插件**（`Plugin.define` + `setup(ctx)`），V1 的 OpenCode 无法运行它；反之，1.1.0 及更早版本在 V2 下无法运行——这正是需要本升级的原因。

## 安装

### 方式一：配置文件

在 `opencode.json(c)`（全局 `~/.config/opencode/opencode.jsonc` 或项目级 `.opencode/opencode.jsonc`）的 **`plugins`** 数组（注意：v2 是 `plugins`，不是 v1 的 `plugin`）中添加：

```json
{
  "plugins": ["workerhelper@git+https://github.com/IcarusZy/workerhelper.git"]
}
```

重启 OpenCode 即可。插件会自动安装、注册所有技能，并把工作流引导注入系统上下文。

### 方式二：CLI

```bash
opencode plugin add git+https://github.com/IcarusZy/workerhelper.git
```

## 验证

向 agent 提问："列出可用的 workerhelper 技能"

或使用 skill 工具加载：`worker-lookup`

## 使用

编码任务必须先加载 `worker-lookup`，再按其指引选择后续流程：

- 小型明确修改 → `exec-plan`
- 中大型或范围不清 → `design` → `plan` → `exec-plan`
- 缺陷 → `worker-debug`
- 功能变更完成后 → `worker-sync`

## 更新

V2 自带插件包管理（旧的"启动时自删缓存强制更新"机制已随 v1 缓存布局一起移除）：

```bash
opencode plugin update          # 更新所有过期的包插件
opencode plugin list            # 查看已装插件
opencode plugin check           # 检查更新
```

锁定了精确版本/commit 的包不会被自动更新；未锁定的 git 包启动时会检查更新。

## 从 v1（OpenCode 1.x）迁移

1. 升级 OpenCode：`opencode upgrade --major`
2. 把配置里的 `"plugin": [...]` 改为 `"plugins": [...]`（v2 可自动归一化旧键，但建议显式修改）
3. 若缓存了旧版插件，移除后重启：`opencode plugin remove workerhelper` 再按上述方式重装
