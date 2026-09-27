<div align="center">

# TSUNAMI

Windows 优先的桌面 Coding Agent Harness

![version](https://img.shields.io/badge/version-0.1.0-blue)
![platform](https://img.shields.io/badge/platform-Windows%20x64-0078D6)
![electron](https://img.shields.io/badge/Electron-38.3.0-47848F)
![node](https://img.shields.io/badge/Node-24-339933)
![typescript](https://img.shields.io/badge/TypeScript-5.9-3178C6)
![status](https://img.shields.io/badge/status-release%20candidate-orange)

[快速开始](#快速开始) · [功能](#功能) · [架构](#架构) · [开发](#开发) · [验证状态](#验证状态) · [文档](#文档)

</div>

---

TSUNAMI 把真实的 Agent 工具循环、多 Agent 协作和长期记忆放进一个桌面应用。Electron UI 连接独立常驻的 Runtime Host；Host 通过本地 [pi](https://github.com/earendil-works/pi) 的 Agent/RPC 运行时执行工具，并把协作任务、运行记录与记忆写入嵌入式 [Vault](https://github.com/RavenholmAlpha/vault)。

项目数据和凭据保存在当前 Windows 用户的数据目录，不写入安装目录。

## 功能

| 模块 | 说明 |
|---|---|
| 模型接入 | OpenAI Chat Completions、OpenAI Responses、Anthropic Messages，以及 ChatGPT / Codex OAuth（浏览器登录或设备码） |
| 运行模式 | Plan、Execute、Goal；Execute 通过 Pi 调用真实工具，事件与文件差异在会话和 Changes 面板可查 |
| 权限 | 人工审批、自动审批、完全权限、YOLO 四档，统一审批审计 |
| 后台运行 | 关闭窗口或退出 UI 后 Host 继续执行；重新打开按事件游标补齐会话 |
| 崩溃恢复 | Host 被强杀后，运行中任务标记为 `interrupted` / `unknown`，不自动重放可能有副作用的工具 |
| 多 Agent | 独立 Git worktree、Vault 交接、失败与重复保护 |
| Goal | 持久目标，支持暂停/继续、无进展阻断、预算耗尽和证据完成 |
| Skills | 本地目录或固定 Git commit 安装，可选子目录；启停、按需读取引用、脚本执行、更新冲突保护 |
| MCP | 官方 SDK，支持 stdio、Streamable HTTP、兼容 SSE；Tools / Resources / Prompts |
| 记忆 | Vault 跨会话记忆，按项目检索，保留来源和状态 |
| 浏览器与附件 | 打包的 Playwright Chromium Headless Shell；附件按 SHA-256 存储并校验篡改 |
| 调度 | 唯一运行键 CAS 认领，支持 skip / catch-up-once 错过策略 |
| 插件 | 本地插件安装、调用、启停、卸载，见 [PLUGIN_SDK.md](PLUGIN_SDK.md) |
| Git | status、diff、checkpoint、worktree，保留用户改动 |
| 更新 | 读取 manifest、SHA-256 校验、下载、备份和待安装标记 |
| 界面 | 中文 / 英文，浅色 / 深色，已测试 1280×800 与 125% 缩放 |

## 快速开始

### 安装

1. 运行 `dist/TSUNAMI-0.1.0-Windows-x64.exe`（本地构建，未签名，Windows SmartScreen 可能提示）。
2. 打开 TSUNAMI，选择 **添加项目**。
3. 进入 **设置 → 配置模型** 添加模型连接。

### 配置模型

- **API Key / 兼容端点**：选择 OpenAI Chat Completions、OpenAI Responses 或 Anthropic Messages，填入 Base URL 与 Key。
- **ChatGPT 订阅**：选择 “ChatGPT / Codex OAuth”，保留官方 Base URL 和预填的 Codex 模型，点击 “ChatGPT 登录” 或 “设备码登录”。授权成功后连接自动保存并选中。

OAuth 凭据由 Host 加密保存，运行前自动刷新。ChatGPT 订阅凭据只用于 Codex 路径，不用于 OpenAI API 计费端点。

### 第一个任务

选择 Plan、Execute 或 Goal，输入任务即可。首次使用建议保持 **人工审批**。

> [!WARNING]
> 权限档位是应用内审批规则，不是操作系统沙箱。插件和第三方 Skills/MCP 以当前 Windows 用户权限运行。升级权限前请确认项目和工具来源。

## 架构

```text
┌──────────────────────────┐        ┌──────────────────────────────────────────┐
│  Electron                │        │  Runtime Host（独立常驻进程）              │
│  ├─ main / preload       │  IPC   │  ├─ Agent Engine ── Pi RPC 子进程          │
│  └─ React renderer       │◀──────▶│  ├─ Vault core（任务/运行/快照/记忆）       │
│     仅持有展示状态        │ named  │  ├─ SQLite（项目/会话/运行/审批/事件）      │
└──────────────────────────┘  pipe  │  ├─ Skills · MCP · Plugins · Scheduler    │
                                    │  ├─ Git · Browser · Attachments           │
                                    │  └─ SecretStore（模型与 OAuth 凭据）        │
                                    └──────────────────────────────────────────┘
```

- Renderer 不直接访问数据库、命令或密钥。
- `src/shared/contracts.ts` 定义 Host 方法、事件和读模型。事件带 `sequence`、`eventId`、`timestamp`、`schemaVersion`，UI 重连后从 snapshot 补齐。
- Pi JSONL session 是模型上下文的权威来源；跨数据库更新不宣称原子，不确定副作用标为 `unknown`。

完整说明见 [ARCHITECTURE.md](ARCHITECTURE.md)，关键取舍见 [DECISIONS.md](DECISIONS.md)。

## 开发

### 环境要求

- Windows 10/11 x64
- Node.js 24（ABI 137）
- Git

### 安装依赖

```powershell
npm install --ignore-scripts
npx playwright install chromium
```

`better-sqlite3` 是原生模块，Node 与 Electron 的 ABI 不同，需要按目标重建（见下文）。

### 本地运行

```powershell
npm run rebuild:electron
npm run dev
```

`dev` 同时启动 Vite（`127.0.0.1:5173`）、Electron 主进程 TypeScript watch 和 Electron。

### 常用脚本

| 命令 | 作用 |
|---|---|
| `npm run typecheck` | renderer 与 Electron 两套 tsconfig 类型检查 |
| `npm run lint` | Biome 检查 `src` 与 `tests`，警告即失败 |
| `npm test` | Vitest 单元与集成测试 |
| `npm run verify:node` | 重建 Node ABI，运行测试和 Pi/Vault fixture |
| `npm run verify:electron` | 重建 Electron ABI，编译 Host，运行 packaged-host 检查 |
| `npm run verify:pi` / `verify:mcp` / `verify:vault` | 单项 fixture 验证 |
| `npm run build` | 类型检查并构建 renderer、Electron、Vault bundle，staging 浏览器运行时 |
| `npm run package` | `build` 后生成 NSIS 安装包 |

`verify:node` 与 `verify:electron` 需分开运行，因为二者会把 `better-sqlite3` 重建到不同 ABI。

### 打包 Windows 安装包

```powershell
npx electron-rebuild -f -w better-sqlite3 -v 38.3.0
npm run build
npx electron-builder --win nsis
```

产物位于 `dist/`。打包后如需继续跑 Node 测试，先执行 `npm run rebuild:node` 恢复 Node ABI。缺少 Playwright Chromium 时 `npm run build` 会明确失败。

### 项目结构

```text
src/
├─ desktop/     Electron main、preload、Host 客户端
├─ renderer/    React UI（会话、Changes、Goal、调度、记忆、MCP、工作站等面板）
├─ runtime/     Runtime Host：Agent Engine、Pi/Vault adapter、Skills、MCP、Git、调度、更新
└─ shared/      Host 契约：方法、事件、读模型
skills/         内置 Skills
tests/          Vitest 测试与 fixture 脚本
scripts/        构建与验证脚本
pi/  vault/     上游源码基线（只读）
```

TSUNAMI 的适配代码位于 `src/runtime/`。`pi/` 与 `vault/` 固定在特定 revision，不直接修改，规则见 [UPSTREAM.md](UPSTREAM.md)。

## 数据、更新与卸载

- **数据位置**：项目、会话、记忆、附件和凭据位于当前用户数据目录。
- **更新**：未配置发布源时不会报告新版本。安装更新需先结束运行中的任务并退出 Host。
- **备份与恢复**：只允许在 Host 停止后离线执行。
- **卸载**：NSIS 卸载默认只删除程序文件，保留用户数据。删除数据前请先确认备份，再明确选择离线删除。

## 验证状态

当前为 0.1.0 release candidate。验收矩阵区分 `implemented`、`fixture-verified`、`verified` 与 `external-blocked`，详见 [REQUIREMENTS.md](REQUIREMENTS.md)。

| 状态 | 范围 |
|---|---|
| 本地安装包已验证 | 安装与首次配置、单 Agent 纵向闭环、UI 退出后台继续与重连、浏览器运行时、NSIS 安装/卸载 |
| fixture 已验证 | 三种模型协议、多 Agent、Goal、崩溃恢复、Skills、MCP 三种传输、Vault 协作、调度、插件、权限矩阵 |
| 外部阻塞 | 真实 ChatGPT/Codex 授权、真实模型服务联调、远程 MCP OAuth、代码签名、更新发布服务 |

尚未覆盖：IME 输入与更完整的高 DPI 矩阵、调度在系统休眠/时钟跳变下的行为、插件细粒度权限 UI。macOS/Linux 仅保留平台抽象，未构建或验收。

验收命令与安装包 SHA-256 见 [VERIFICATION.md](VERIFICATION.md)。

## 文档

| 文档 | 内容 |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | 进程模型、数据归属、adapter 边界 |
| [BUILD_SPEC.md](BUILD_SPEC.md) | 产品构建规格（需求事实源） |
| [REQUIREMENTS.md](REQUIREMENTS.md) | 需求与验收矩阵 |
| [VERIFICATION.md](VERIFICATION.md) | 验收命令、证据与产物哈希 |
| [DECISIONS.md](DECISIONS.md) | 架构决策记录 |
| [PLUGIN_SDK.md](PLUGIN_SDK.md) | 插件 manifest 与入口约定 |
| [UPSTREAM.md](UPSTREAM.md) | 上游 revision、复用范围与升级流程 |
| [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) · [PROGRESS.md](PROGRESS.md) | 实施计划与进度 |

## 致谢

- [pi](https://github.com/earendil-works/pi)（MIT）：Agent 运行时、模型 Provider 与工具循环
- [Vault](https://github.com/RavenholmAlpha/vault)（ISC）：协作任务、快照与记忆核心
- [Lucide](https://lucide.dev)：图标，许可见 `src/renderer/public/licenses/LUCIDE-LICENSE.txt`

## 许可

本仓库目前未声明开源许可（`package.json` 标记为 `private`）。第三方组件遵循各自许可证。
