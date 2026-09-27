# Wave

基于 WebSocket 的高伪装性隧道代理协议。通过将代理流量伪装为真实 WebSocket 应用（如聊天室），在协议层面实现与正常业务流量伪装。

## 核心特性

- **协议级伪装** — 插件化编码系统，隧道流量在 WebSocket 帧层面与真实应用完全一致
- **流量统计伪装** — 包大小填充、发送间隔抖动、噪声注入，对抗流量分析
- **无缝回落** — 未认证连接返回真实网站内容，主动探测无法发现代理服务
- **多路复用** — 单条 WebSocket 连接承载多个 TCP 流，减少连接指纹
- **连接池与轮换** — 多条并行连接自动轮换，模拟真实用户行为
- **端到端加密** — ChaCha20-Poly1305 AEAD 逐消息加密，每会话独立密钥

## 架构

```
应用程序 → SOCKS5/HTTP代理 → Wave Client → [WebSocket隧道] → Wave Server → 目标服务器
                                    ↕                              ↕
                              本地SOCKS5端口                   TLS + 真实域名
```

### 分层设计

```
┌─────────────────────────────────────────────────┐
│  传输层: WebSocket over TLS                      │
├─────────────────────────────────────────────────┤
│  认证层: HMAC-SHA256 TOTP (URL参数)              │
├─────────────────────────────────────────────────┤
│  加密层: ChaCha20-Poly1305 AEAD (per-message)   │
├─────────────────────────────────────────────────┤
│  伪装层: 插件编码 + 流量整形 + 噪声注入          │
├─────────────────────────────────────────────────┤
│  复用层: 流式多路复用 (SYN/FIN/DATA/RST/PING)   │
├─────────────────────────────────────────────────┤
│  代理层: SOCKS5 + HTTP CONNECT                   │
└─────────────────────────────────────────────────┘
```

## 抗检测技术原理

### 1. 主动探测防御 (Active Probing Resistance)

**问题：** 审查者会主动连接可疑服务器，发送探测请求判断是否为代理。

**Wave 的应对：**

- **TOTP 认证路由** — 客户端通过 URL 查询参数携带 HMAC-SHA256 时间令牌（30秒窗口，允许±1偏移）。服务端验证失败时，请求被路由到 fallback 处理器，返回完全正常的网站内容。探测者看到的是一个普通的 Web 服务。
- **Fallback 模式** — 支持三种回落：内置页面、反向代理到真实后端、静态文件服务。配合真实域名和证书，与正常网站完全一致。
- **WebSocket 路径隐藏** — WS 升级路径可自定义（如 `/chat/ws`），非该路径的请求全部走 fallback。即使猜到路径，没有有效 token 也只会得到 fallback 响应。

### 2. 被动流量分析防御 (Traffic Analysis Resistance)

**问题：** 审查者通过分析流量的统计特征（包大小分布、发送间隔、突发模式）识别代理协议。

**Wave 的应对：**

- **包大小填充 (Payload Padding)** — 每个消息被填充到符合目标应用统计分布的大小。使用正态分布模型（均值120字节，标准差40字节，模拟聊天消息），真实数据长度通过2字节前缀标记，填充内容为随机字节。
- **发送间隔整形 (Timing Shaping)** — 消息发送前注入符合正态分布的延迟（均值800ms，标准差400ms，上限50ms），模拟人类打字和发送的时间模式。
- **自适应跳过 (Adaptive Bypass)** — 当写入速率超过 10次/秒 时，自动判定为批量传输阶段，跳过所有延迟和填充，保证吞吐性能。这是因为真实聊天应用在传输文件时也会有突发流量。
- **噪声注入 (Noise Injection)** — 独立 goroutine 持续发送与真实应用一致的噪声消息（typing 事件、用户加入/离开、随机聊天），即使隧道空闲也保持活跃，避免"沉默-突发"的代理特征。
- **突发模拟 (Burst Simulation)** — 15% 概率在数据帧前后插入额外噪声帧，模拟多人聊天的突发消息模式。

### 3. 协议指纹防御 (Protocol Fingerprinting Resistance)

**问题：** 审查者检查 WebSocket 帧的内容格式，识别非标准协议。

**Wave 的应对：**

- **插件化编码** — 数据帧被编码为目标应用的原生格式。chatroom 插件将加密数据编码为：
  ```json
  {"type":"msg","user":"user_42","text":"<base64-payload>","ts":1716000000000}
  ```
  WebSocket 帧类型为 TextMessage，与真实聊天应用的 WebSocket 流量在格式上完全一致。
- **噪声消息多样性** — 噪声不是简单重复，而是模拟真实事件（typing、join、leave、message），每种事件有独立的 JSON 结构。
- **帧类型匹配** — 插件声明使用 TextFrame 或 BinaryFrame，确保 WebSocket 帧类型与目标应用一致。

### 4. 连接行为防御 (Connection Behavior Resistance)

**问题：** 代理工具通常表现为单连接长时间高吞吐，与正常应用的连接模式不同。

**Wave 的应对：**

- **连接池** — 维护多条并行 WebSocket 连接（默认3条），新流按最少活跃流数分配，模拟多标签页/多用户场景。
- **连接轮换** — 连接定期关闭重建（默认5分钟），避免单连接存活时间异常。
- **Keepalive** — 15秒间隔的 Ping/Pong 保活，45秒无响应断开，与标准 WebSocket 行为一致。

## 加密方案

```
PSK (32字节hex) → HKDF-SHA256 → AuthKey (用于TOTP)
                              → EncryptionKey (主密钥)

握手阶段:
  Client → Server: [Version(1B) | Features(2B)]
  Server → Client: [Version(1B) | Features(2B) | Nonce(32B)]

会话密钥:
  SessionKey = HKDF(EncryptionKey, "wave-session-" + Nonce)

消息加密:
  每条消息独立加密: Nonce(12B) + ChaCha20-Poly1305(plaintext)
  Nonce = 递增计数器 (uint64, big-endian, 左填充0)
```

每条 WebSocket 消息是独立的 AEAD 密文，解密端无状态（nonce 前置于密文），支持乱序和丢包场景。

## 多路复用协议

帧格式（7字节头 + 变长载荷）：

```
┌──────────┬───────┬────────┬─────────────────┐
│ StreamID │ Flags │ Length │     Payload      │
│  4 bytes │ 1 byte│ 2 bytes│  0-65535 bytes   │
└──────────┴───────┴────────┴─────────────────┘
```

标志位：
- `SYN (0x01)` — 打开新流
- `FIN (0x02)` — 关闭流
- `DATA (0x04)` — 数据传输
- `RST (0x08)` — 强制重置流
- `PING (0x10)` — 保活探测

客户端使用奇数 StreamID，服务端使用偶数，避免冲突。

## 构建

```bash
make build
```

交叉编译 Linux：
```bash
GOOS=linux GOARCH=amd64 go build -o bin/wave-server ./cmd/wave-server
GOOS=linux GOARCH=amd64 go build -o bin/wave-client ./cmd/wave-client
```

## 配置

### Server (`server.yaml`)

```yaml
listen: ":443"
tls_cert: "certs/server.crt"
tls_key: "certs/server.key"
psk: "your-64-char-hex-psk"
auth_interval: 30
ws_path: "/chat/ws"
plugin: "chatroom"
fallback_mode: "builtin"       # builtin | reverse_proxy | static
fallback_url: ""               # reverse_proxy 模式的后端URL
static_dir: ""                 # static 模式的目录
```

### Client (`client.yaml`)

```yaml
server_url: "wss://your-server.com/chat/ws"
psk: "your-64-char-hex-psk"
auth_interval: 30
ws_path: "/chat/ws"
plugin: "chatroom"
proxy_listen: "127.0.0.1:1080"
pool_size: 3
rotate_minutes: 5
insecure: false                # 跳过TLS证书验证（仅测试用）
```

`psk` 必须是64字符的十六进制字符串（32字节），客户端和服务端必须一致。

## 使用

**启动服务端：**
```bash
./wave-server -config server.yaml
```

**启动客户端：**
```bash
./wave-client -config client.yaml
```

**配置应用程序使用代理：**
```bash
# SOCKS5
curl -x socks5://127.0.0.1:1080 https://example.com

# HTTP CONNECT
curl -x http://127.0.0.1:1080 https://example.com
```

## 伪装插件开发

实现 `disguise.Plugin` 接口即可添加新的伪装模板：

```go
type Plugin interface {
    Name() string                    // 插件名称
    FrameType() FrameType            // TextFrame 或 BinaryFrame
    TrafficProfile() TrafficModel    // 流量统计模型参数
    Encode(payload []byte) []byte    // 将密文编码为目标格式
    Decode(frame []byte) ([]byte, error)  // 从目标格式解码密文
    FallbackHandler() http.Handler   // 回落页面
    EmitNoise() []byte               // 生成噪声消息
}
```

`TrafficModel` 定义流量整形参数：

```go
type TrafficModel struct {
    AvgPacketSize    int           // 目标平均包大小
    PacketSizeStdDev int           // 包大小标准差
    AvgInterval      time.Duration // 平均发送间隔
    IntervalStdDev   time.Duration // 间隔标准差
    BurstProbability float64       // 突发概率
    BurstSize        int           // 突发消息数
}
```

## 性能

实测数据（chatroom 插件启用，跨境链路）：

| 场景 | 速度 | 效率 |
|------|------|------|
| 直连 | 4.85 MB/s | 100% |
| Wave 隧道 | 3.06 MB/s | 63% |

开销来源：额外网络跳转 + TLS + 加密。流量整形在批量传输时自动跳过（>10 writes/sec），不影响吞吐。

## 测试

```bash
make test        # 单元测试 + 集成测试
make lint        # 代码检查
```

## 项目结构

```
cmd/
  wave-server/          服务端入口
  wave-client/          客户端入口
internal/
  auth/                 HMAC-SHA256 TOTP 认证
  client/               客户端（连接池、轮换、重连）
  config/               配置加载
  crypto/               HKDF 密钥派生 + ChaCha20-Poly1305 AEAD
  disguise/             伪装框架（插件接口、流量整形器）
    chatroom/           聊天室伪装插件
  fallback/             回落处理（内置/反代/静态）
  mux/                  流式多路复用器
  proto/                帧协议 + 握手协议
  server/               服务端 + WebSocket 适配器
pkg/
  proxy/                SOCKS5 + HTTP CONNECT 代理
configs/                示例配置文件
tests/                  集成测试
docs/                   设计文档
```

## License

MIT
