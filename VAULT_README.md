# Vault

> 多 Agent 协作的状态管理服务 — 让 AI 编码 Agent 之间实现结构化状态共享、按需上下文检索和可追溯的任务交接。

## Vault 是什么？

在多 Agent 协作场景中，最大的痛点不是单个 Agent 能力不够，而是 Agent 之间的协作通信成本太高——上下文靠复制粘贴传递、做过的工作缺乏沉淀、多个 Agent 同时改同一个模块时互相覆盖。

Vault 是一个运行在本地的轻量服务，专门解决这些问题。它的核心思路是：**把「传聊天记录」变成「读写结构化状态」**。

具体来说，Vault 提供了：

- **结构化 Commit**：Agent 的阶段性工作成果以 commit 的形式落库，而不是散落在对话里
- **Scope 独占锁**：Agent 修改某个模块前先「占座」，防止多人同时改同一个文件
- **Snapshot 快照**：新 Agent 接手任务时，只需读一份精简的快照，而不是翻完所有历史聊天
- **Artifact 附件**：diff、测试报告、设计文档等证据性内容统一存储和引用

### 解决什么问题？

| 问题 | Vault 怎么解决 |
|------|---------------|
| 传完整聊天记录太浪费 token | Agent 只读 snapshot 摘要，按需深入 |
| 任务交接信息丢失或走样 | 所有工作成果都是结构化 commit，有据可查 |
| 多个 Agent 同时改同一个模块 | Scope lease 机制提供独占锁，冲突时及时告警 |
| 出了问题不知道谁改的、为什么改 | 完整的事件时间线，每个操作都有记录 |

## 快速开始

```bash
# 安装依赖
npm install

# 启动 HTTP API 服务器
npm run dev

# 或启动 MCP 服务器（Agent 通过工具调用接入）
npm run dev:mcp

# 跑一遍端到端模拟测试，看看整体流程
npm run simulate
```

## 架构

```
Agent / IDE ─┬─ CLI ──────┐
             ├─ HTTP API ──┤── 核心服务层 ── SQLite + Artifact 文件存储
             └─ MCP Server ┘
```

三种接入方式共享同一套核心服务，业务逻辑只写一遍：

- **CLI**：本地调试和脚本集成
- **HTTP API**：前端控制台和外部程序接入
- **MCP Server**：Agent 通过标准 MCP 协议直接调用

## 核心概念

| 概念 | 一句话解释 |
|------|-----------|
| **Task** | 一个协作任务，包含目标、约束和验收标准 |
| **Workspace** | 任务关联的代码仓库上下文（repo、branch、revision） |
| **Agent Run** | 一次具体的 Agent 执行会话，区别于逻辑上的 Agent 身份 |
| **Scope** | 工作边界，比如 `checkout.payment` 或 `auth.middleware` |
| **Lease** | Scope 的独占锁，有 TTL 过期机制，需要定期续租 |
| **Commit** | 结构化的工作成果提交，包含摘要、风险、后续动作等 |
| **Artifact** | 挂在 commit 上的附件——diff、日志、测试报告等 |
| **Snapshot** | 给 Agent 看的精简上下文视图，只包含最相关的信息 |

## Agent 标准工作流

```
1. register_run      → 注册一个执行会话
2. get_task_snapshot  → 拿到精简上下文
3. claim_scope       → 锁定要修改的模块
4. heartbeat_lease   → 长时间任务中定期续租
5. append_commit     → 提交阶段性成果
6. release_scope     → 释放模块锁
```

## CLI

```bash
# 任务
vault task create --title "Checkout 重构" --goal "拆分支付和库存模块"
vault task list
vault task get --task-id task_xxx
vault task update --task-id task_xxx --status in_progress

# Workspace
vault workspace create --task-id task_xxx --name checkout-main --repo-root /repo/checkout
vault workspace list --task-id task_xxx

# Agent Run
vault run start --task-id task_xxx --logical-agent-id agent_backend
vault run list --task-id task_xxx
vault run heartbeat --run-id run_xxx
vault run end --run-id run_xxx

# Scope 管理
vault scope claim --task-id task_xxx --run-id run_xxx --scope checkout.payment
vault scope active --task-id task_xxx
vault scope heartbeat --lease-id lease_xxx
vault scope release --lease-id lease_xxx

# Commit
vault commit append --task-id task_xxx --run-id run_xxx --agent-id agent_backend \
  --summary "实现异步支付队列" --idempotency-key step_01
vault commit search --task-id task_xxx --scope checkout.payment
vault commit get --commit-id c_xxx

# Snapshot
vault snapshot get --task-id task_xxx --run-id run_xxx --scope checkout.payment

# Artifact
vault artifact list --task-id task_xxx --kind diff
vault artifact get --artifact-id art_xxx

# 观测
vault timeline get --task-id task_xxx
vault conflict list --task-id task_xxx
```

## HTTP API

所有接口前缀为 `/api/v1`。

### 基础

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/health` | 健康检查 |

### Task

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/tasks` | 创建任务 |
| `GET` | `/tasks` | 任务列表，可选 `?status=` 过滤 |
| `GET` | `/tasks/:taskId` | 任务详情 |
| `PUT` | `/tasks/:taskId` | 更新任务 |

### Workspace

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/workspaces` | 创建 Workspace |
| `GET` | `/workspaces/:workspaceId` | Workspace 详情 |
| `GET` | `/tasks/:taskId/workspaces` | 列出某任务下的 Workspace |

### Agent Run

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/runs` | 注册 Run |
| `GET` | `/runs?task_id=` | Run 列表 |
| `GET` | `/runs/:runId` | Run 详情 |
| `POST` | `/runs/:runId/heartbeat` | 心跳 |
| `POST` | `/runs/:runId/end` | 结束 Run |

### Scope / Lease

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/leases` | 锁定 Scope |
| `POST` | `/leases/:leaseId/release` | 释放 Lease |
| `POST` | `/leases/:leaseId/heartbeat` | Lease 续租 |
| `GET` | `/tasks/:taskId/leases` | 当前活跃的 Lease 列表 |

### Commit

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/commits` | 提交工作成果（需要 `Idempotency-Key` header 或 body 中的 `idempotency_key`） |
| `GET` | `/commits/:commitId` | Commit 详情 |
| `GET` | `/commits/search` | 搜索 Commit，支持 `task_id`、`scope`、`query` 参数 |

### Snapshot / Artifact / Timeline / Conflict

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/tasks/:taskId/snapshot` | 获取 Snapshot，支持 `run_id`、`scope` 参数 |
| `GET` | `/artifacts/:artifactId` | Artifact 元信息 |
| `GET` | `/tasks/:taskId/artifacts` | Artifact 列表，可选 `?kind=` 过滤 |
| `GET` | `/tasks/:taskId/timeline` | 事件时间线 |
| `GET` | `/conflicts` | 冲突列表，可选 `?task_id=` 过滤 |

## MCP 工具

以 MCP 模式运行时（`vault serve --mcp`），通过 stdio 提供以下工具：

| 工具 | 说明 |
|------|------|
| `create_task` | 创建任务 |
| `register_run` | 注册 Agent Run |
| `get_task_snapshot` | 获取精简 Snapshot |
| `claim_scope` | 锁定 Scope |
| `heartbeat_lease` | Lease 续租 |
| `release_scope` | 释放 Scope |
| `append_commit` | 提交工作成果 |
| `get_commit` | 查看 Commit 详情 |
| `search_related_commits` | 搜索相关 Commit |
| `get_artifact` | 获取 Artifact 内容 |
| `list_active_leases` | 列出活跃 Lease |
| `get_task_timeline` | 查看事件时间线 |

## 设计要点

### 幂等性

所有写操作都做了幂等处理，Agent 环境下工具调用重试是常态：

| 操作 | 幂等机制 |
|------|---------|
| 注册 Run | 相同 `task_id + session_id` 返回已有 Run |
| 提交 Commit | 相同 `run_id + idempotency_key` 返回已有 Commit |
| 创建 Artifact | 相同 `task_id + content_hash` 不重复存储 |
| 锁定 Scope | 同一 Run 对同一 Scope 的重复 claim 会续租而非新建 |

### 乐观锁

Commit 写入时可带 `observed_snapshot_version`。如果写入时版本已落后（说明期间有其他 Agent 提交了新内容），会返回 `STALE_SNAPSHOT` 错误（HTTP 409），提示 Agent 先刷新再重试。

### Scope 冲突检测

Scope 使用点号分隔的命名规则（如 `checkout.payment`），支持两级冲突检测：

- **完全相同**：`auth.middleware` vs `auth.middleware` → 直接阻断，报错
- **父子包含**：`auth` vs `auth.middleware` → 返回警告，允许继续但提示风险
- **不相关**：`checkout.payment` vs `inventory.reserve` → 无冲突

### 内容寻址存储

Artifact 文件使用 SHA-256 哈希命名，按 `{hash前2位}/{hash}` 路径存放，相同内容天然去重。

## 配置

| 环境变量 | 默认值 | 说明 |
|----------|--------|------|
| `VAULT_PORT` | `3000` | HTTP 端口 |
| `VAULT_HOST` | `127.0.0.1` | 绑定地址 |
| `VAULT_DATA_DIR` | `.vault` | 数据目录 |
| `VAULT_DB_PATH` | `.vault/sqlite/vault.db` | 数据库路径 |
| `VAULT_ARTIFACT_DIR` | `.vault/artifacts` | Artifact 存储目录 |
| `VAULT_LOG_LEVEL` | `info` | 日志级别 |
| `VAULT_DEFAULT_LEASE_TTL` | `1800` | 默认 Lease 过期时间（秒） |
| `VAULT_ENABLE_WEB` | `true` | 是否启用 Web 控制台 |
| `VAULT_AUTH_ENABLED` | `false` | 是否启用 API Key 鉴权 |

## Web 控制台

启动服务后，打开 `http://localhost:3000/` 即可进入 Web 控制台。

功能包括：
- **Dashboard** — 全局指标卡、最近活动、冲突告警
- **Tasks** — 任务列表和详情（三栏布局，含 Commit 链、Lease、Artifact）
- **Timeline** — 跨任务事件时间线
- **Scopes** — Scope 占用情况和冲突监控
- **Artifacts** — Artifact 浏览器
- **Search** — 全文检索（FTS5）

## 全文检索

基于 SQLite FTS5，可对 Commit summary 和 Artifact title 做全文检索：

```bash
vault search query --task-id task_xxx --query "payment queue"
```

API：`GET /api/v1/search?task_id=xxx&q=payment`

## Git 仓库关联

将 Commit/Scope 关联到具体的 git 对象（文件、分支、commit hash）：

```bash
vault git associate --task-id task_xxx --entity-type commit --entity-id c_xxx \
  --git-object-type file --git-ref HEAD --file-path src/payment/queue.ts

vault git search --task-id task_xxx --file-path src/payment
```

## 权限控制

设置 `VAULT_AUTH_ENABLED=true` 后，所有 API 请求需带 `Authorization: Bearer <key>` 头。

三种角色：
- **admin** — 全部权限
- **agent** — 读写操作（不能管理 Key）
- **readonly** — 只读

```bash
vault auth create-key --name agent_a --role agent
vault auth list-keys
vault auth revoke-key --key-id ak_xxx
```

## 文档

更多细节参见 [docs/](./docs/) 目录：

- [PRD](./docs/PRD.md) — 产品需求
- [技术架构](./docs/TECHNICAL_ARCHITECTURE.md) — 系统设计
- [数据模型](./docs/DATA_MODEL.md) — 实体定义和表结构
- [API 与 MCP 规范](./docs/API_AND_MCP_SPEC.md) — 接口规范
- [Agent 协作协议](./docs/AGENT_PROTOCOL.md) — Agent 行为规则
- [前端设计](./docs/FRONTEND_DESIGN.md) — Web 控制台设计规范
- [功能分析报告](./docs/FULL_ANALYSIS.md) — 完整的代码功能分析

## 功能完成度

### P0（MVP 核心）— ✅ 全部完成

- ✅ 本地服务启动（HTTP / MCP 双模式）
- ✅ Task CRUD
- ✅ Agent Run 注册、心跳、结束
- ✅ Scope Lease 锁定、续租、释放
- ✅ 结构化 Commit 写入与检索
- ✅ Artifact 关联与内容寻址存储
- ✅ Snapshot 生成
- ✅ CLI（30+ 子命令）
- ✅ MCP 工具（18 个）
- ✅ 幂等写入 + 过时快照保护
- ✅ 事件时间线

### P1 — ✅ 全部完成

- ✅ Web 控制台（Dashboard / Tasks / Timeline / Scopes / Artifacts / Search）
- ✅ 冲突检测（精确 + 层级）
- ✅ 事件时间线
- ✅ 实体标签检索（EntityIndexService）
- ✅ 统计服务（StatsService）

### P2 — ✅ 全部完成（远程部署除外）

- ✅ 全文检索（SQLite FTS5）
- ✅ 代码仓库对象关联（GitAssociationService）
- ✅ 权限控制（API Key + Role）
- 🔲 远程部署模式（计划中，不在当前版本范围）

## 技术栈

| 组件 | 技术 |
|------|------|
| 运行时 | Node.js 22+ / TypeScript |
| 数据库 | SQLite（WAL 模式），better-sqlite3 |
| HTTP | Fastify 5.x |
| 校验 | Zod 4.x |
| MCP | @modelcontextprotocol/sdk |
| CLI | Commander 14.x |
| Web 控制台 | 原生 HTML/CSS/JS，深色主题 |

## License

ISC
