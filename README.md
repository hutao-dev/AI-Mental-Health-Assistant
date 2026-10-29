[README.md](https://github.com/user-attachments/files/34109095/README.md)
# 宁渡 · AI 心理健康助手（前端）

> Vue 3 + Vite 构建的心理健康 AI 咨询平台前端。核心是一条**可中断、可超时、可退避重试的 SSE 流式对话链路**，配套 Spring Boot 后端提供大模型能力、JWT 认证与数据分析接口。

- 前端仓库：本项目 `ai-vue`
- 配套后端：`ai-springboot`（Spring Boot 3 + Spring AI，独立仓库）
- 当前代码基线：`c243690 feat: SSE 支持停止生成、首字节超时与指数退避重试`

---

## 目录

- [一、核心亮点](#一核心亮点)
- [二、技术栈](#二技术栈)
- [三、目录结构](#三目录结构)
- [四、快速开始](#四快速开始)
- [五、页面与路由](#五页面与路由)
- [六、核心机制详解](#六核心机制详解)
  - [6.1 SSE 流式链路分层](#61-sse-流式链路分层)
  - [6.2 createStream 状态机](#62-createstream-状态机utils-ssejs)
  - [6.3 停止语义：四种 reason](#63-停止语义四种-reason)
  - [6.4 重试策略与防重复输出](#64-重试策略与防重复输出)
  - [6.5 会话与消息流转](#65-会话与消息流转)
  - [6.6 认证与权限](#66-认证与权限)
  - [6.7 Markdown 渲染](#67-markdown-渲染自研)
  - [6.8 数据看板](#68-数据看板echarts)
- [七、接口清单](#七接口清单)
- [八、配置说明](#八配置说明)
- [九、已知边界与后续优化](#九已知边界与后续优化)
- [十、排错手册](#十排错手册)

---

## 一、核心亮点

| # | 亮点 | 位置 | 一句话 |
|---|------|------|--------|
| 1 | **可中断的 SSE 流** | `src/utils/sse.js` + `views/consultation.vue` | `AbortController` 真取消连接，停止后已生成内容完整保留 |
| 2 | **首字节超时** | `sse.js:47-54` | 连接建立但 10s 未收到任何数据 → 主动 abort，不会永久挂起 |
| 3 | **指数退避重试** | `sse.js:83-89` | 1s / 2s 退避重试，且只在「一个字都没吐」时才重试，杜绝重复回复 |
| 4 | **四种停止原因分流** | `consultation.vue:439-443` | `user` / `done` / `error` / `unmount` 各走各的收尾逻辑，中断 ≠ 报错 |
| 5 | **自研 Markdown 渲染器** | `components/MarkdownRenderer.vue` | 零依赖，先转义再解析，兼顾了 XSS 防护 |
| 6 | **角色级路由守卫** | `router/index.js:114-145` | `userType` 1/2 分流前台与后台，越权直接重定向 |

---

## 二、技术栈

### 前端（本项目）

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | ^3.5.32 | Composition API + `<script setup>` |
| Vite | ^8.0.10 | 构建、路径别名 `@`、开发代理 |
| Vue Router | ^4.6.4 | 路由 + 前置守卫权限控制 |
| Pinia | ^3.0.4 | 状态管理（当前仅侧边栏折叠） |
| pinia-plugin-persistedstate | ^4.7.1 | 持久化插件（已注册，见[已知边界](#九已知边界与后续优化)） |
| Element Plus | ^2.13.7 | UI 组件库 |
| **@microsoft/fetch-event-source** | ^2.0.1 | **SSE 流式对话核心库** |
| Axios | ^1.16.0 | 普通 HTTP 请求封装 |
| ECharts | ^6.1.0 | 后台数据看板图表 |
| WangEditor | ^5.1.23 | 后台文章富文本编辑 |
| dayjs | ^1.11.21 | 日期处理（情绪日记日期） |
| Sass | ^1.97.2 | 样式预处理 |

### 配套后端

| 技术 | 说明 |
|------|------|
| Spring Boot 3 + Spring AI | 大模型接入（OpenAI 兼容协议） |
| Reactor `Flux<ServerSentEvent>` | SSE 流式推送 |
| Spring Security + JWT | 无状态认证，校验 `token` 请求头 |
| MyBatis-Plus + MySQL | 数据持久化 |

---

## 三、目录结构

```
ai-vue/
├── index.html
├── vite.config.js              # 别名 @ -> src，/api 代理转发
├── package.json
└── src/
    ├── main.js                 # 应用入口：Element Plus 全量注册 + Pinia + Router
    ├── style.css
    ├── config/index.js         # fileBaseUrl（图片/文件服务地址）
    ├── api/
    │   ├── frontend.js         # 前台接口（会话、情绪日记、知识库）
    │   └── admin.js            # 后台接口（登录、文章、记录、看板）
    ├── utils/
    │   ├── request.js          # Axios 封装：token 注入 + code 统一处理
    │   └── sse.js              # ★ SSE 客户端：可中断 / 超时 / 退避重试
    ├── router/index.js         # 路由表 + 角色守卫
    ├── stores/admin.js         # Pinia：侧边栏折叠状态
    ├── components/
    │   ├── FrontendLayout.vue  # 前台布局
    │   ├── BackendLayout.vue   # 后台布局（侧边栏 + 顶栏）
    │   ├── AuthLayout.vue      # 登录注册布局
    │   ├── Sidebar.vue / Navbar.vue / PageHead.vue
    │   ├── TableSearch.vue     # 配置式搜索表单
    │   ├── MarkdownRenderer.vue# ★ 自研 Markdown 渲染器
    │   ├── ArticlaDialog.vue   # 文章新增/编辑弹窗
    │   └── RichTextEditor.vue  # WangEditor 封装
    ├── views/
    │   ├── home.vue                 # 首页
    │   ├── consultation.vue         # ★ AI 咨询对话（1079 行，核心页面）
    │   ├── emotionDiary.vue         # 情绪日记填写
    │   ├── frontendKnowledge.vue    # 前台知识库列表
    │   ├── articleDetail.vue        # 文章详情
    │   ├── login.vue / register.vue # 认证
    │   ├── dashboard.vue            # 后台看板（ECharts）
    │   ├── knowledge.vue            # 后台文章管理
    │   ├── consultations.vue        # 后台咨询记录
    │   └── emotional.vue            # 后台情绪日志
    └── assets/                 # 图片资源（情绪图标、机器人等）
```

---

## 四、快速开始

### 环境要求

- Node.js **>= 20.19**（Vite 8 要求，推荐 22 LTS）
- 后端：JDK 17+、MySQL 8.x、Maven 3.6+

### 启动

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器（默认 http://localhost:5173）
npm run dev

# 3. 生产构建
npm run build
```

> **联调前提**：前端所有请求都走 `/api` 前缀，由 Vite 代理转发（后端未开 CORS）。
> 默认代理目标为 `http://159.75.169.224:1235`（`vite.config.js:26`），若后端跑在本地或其他端口，请修改该 `target`。

---

## 五、页面与路由

### 前台（`/`，普通用户）

| 页面 | 路由 | 文件 | 说明 |
|------|------|------|------|
| 首页 | `/` | `home.vue` | 品牌展示与入口引导 |
| AI 心理咨询 | `/consultation` | `consultation.vue` | **核心页面**：SSE 流式对话 + 多会话 + 情绪分析 |
| 情绪日记 | `/emotion-diary` | `emotionDiary.vue` | 1-10 分评分、8 种情绪、触发因素、睡眠/压力 |
| 知识库 | `/knowledge` | `frontendKnowledge.vue` | 文章分页列表 |
| 文章详情 | `/knowledge/article/:id` | `articleDetail.vue` | `props: true` 接收 id，正文阅读 |

### 后台（`/back`，管理员）

| 页面 | 路由 | 文件 | 说明 |
|------|------|------|------|
| 数据看板 | `/back/dashboard` | `dashboard.vue` | 4 张指标卡 + 3 张 ECharts 图 |
| 知识管理 | `/back/knowledge` | `knowledge.vue` | 增删改查、发布/下线、WangEditor 富文本 |
| 咨询记录 | `/back/consultations` | `consultations.vue` | 会话分页 + 对话详情抽屉 |
| 情绪日志 | `/back/emotional` | `emotional.vue` | 日志分页 + 删除 |

### 认证（`/auth`）

| 页面 | 路由 | 说明 |
|------|------|------|
| 登录 | `/auth/login` | 按 `userType` 跳转后台或首页 |
| 注册 | `/auth/register` | 注册（默认普通用户） |

---

## 六、核心机制详解

### 6.1 SSE 流式链路分层

```
┌──────────────────────────────────────────────────────────────┐
│ 视图层  consultation.vue                                     │
│  · 组装消息气泡、持有 push 引用、请求情绪分析结果              │
│  · 通过 stopGeneration() / onUnmounted 调用 stop(reason)      │
└───────────────────────┬──────────────────────────────────────┘
                        │ createStream(url, opts)
┌───────────────────────▼──────────────────────────────────────┐
│ 传输层  utils/sse.js                                          │
│  · AbortController 中断   · 首字节超时   · 指数退避重试        │
│  · stopped / stopReason 状态机                                │
└───────────────────────┬──────────────────────────────────────┘
                        │ fetchEventSource（POST + 自定义 Header）
┌───────────────────────▼──────────────────────────────────────┐
│ 后端  /psychological-chat/stream → Flux<ServerSentEvent>      │
│  · message（增量片段）→ done（结束）→ error（异常）            │
└──────────────────────────────────────────────────────────────┘
```

**为什么不用原生 `EventSource`**：只支持 GET，无法带请求体与自定义 Header（传不了 Token）。
**为什么 SSE 不走 axios**：axios 实例设了 `timeout: 5000`（`utils/request.js:8`），会掐断长连接，因此流式接口单独直连。

### 6.2 createStream 状态机（`utils/sse.js`）

`createStream(url, opt)` 返回 `{ start, stop }`，内部维护四个变量：

| 变量 | 作用 |
|------|------|
| `ctrl` | 每次尝试新建的 `AbortController` |
| `stopped` | 持久停止标记，整次 `start` 只重置一次（`sse.js:30`） |
| `stopReason` | `null / user / done / error / unmount` |
| `firstByteAt` | 首字节到达时间戳，用于判定是否真的开始输出 |

执行流程：

```
start()
 ├─ stopped = false
 └─ for attempt = 0..retries
     ├─ if (stopped) → onstopped(reason) 直接收手      # 重试等待期被叫停
     ├─ 新建 AbortController
     ├─ fetchEventSource(...)
     │    ├─ onopen  → 启动首字节计时器（timeout 默认 10000ms）
     │    ├─ onmessage → 记录 firstByteAt，回调 handlers.onmessage
     │    ├─ onclose → clearTimer，resolve
     │    └─ onerror → clearTimer，reject + throw      # 必须 throw
     ├─ 成功 → { ok: true, stopped: stopReason === 'user' }
     └─ catch
          ├─ 有 stopReason → onstopped(reason) 返回
          ├─ attempt === retries 或 !canRetry() → onerror(err) 返回
          └─ 否则 sleep(baseDelay * 2 ** attempt) 后进入下一次 attempt
```

> **关键细节**：`onerror` 里 `reject(err)` 之后必须 `throw err`（`sse.js:70`）。
> 不抛的话 `fetch-event-source` 会按自己的策略无限重连，我们精心设计的退避调度就失效了。

### 6.3 停止语义：四种 reason

| reason | 触发点 | 视图层行为 |
|--------|--------|-----------|
| `user` | 点击「停止生成」`consultation.vue:366-369` | 关闭输入态，提示「已停止生成」，**已生成内容保留** |
| `done` | 收到 `event: done` `consultation.vue:411-416` | 关闭输入态 + 拉取情绪分析结果 |
| `error` | `handleError()` `consultation.vue:453-466` | 一句没吐→气泡标记为错误；吐了一半→内容保留+顶部报错 |
| `unmount` | `onUnmounted` `consultation.vue:546-548` | 离开页面静默断开，避免内存泄漏与后台残留请求 |

### 6.4 重试策略与防重复输出

```js
// consultation.vue:394-404
streamer = createStream('/api/psychological-chat/stream', {
  headers: { 'Content-Type': 'application/json', Token: localStorage.getItem('token'), Accept: 'text/event-stream' },
  body: { sessionId, userMessage: message },
  timeout: 10000,          // 首字节超时
  retries: 2,              // 最多重试 2 次（共 3 次尝试）
  canRetry: () => !hasContent,   // ★ 已经吐过字就不再重试
  handlers: { /* onopen / onmessage / onclose / onretry / onstopped / onerror */ },
})
```

| 参数 | 默认 | 说明 |
|------|------|------|
| `timeout` | 10000 | 连接建立后等待首字节的毫秒数 |
| `retries` | 2 | 额外重试次数 |
| `baseDelay` | 1000 | 退避基数，实际延迟 `1000 * 2^attempt` → 1s、2s |
| `canRetry` | `() => true` | 业务侧闸门，返回 false 立即放弃重试 |

**为什么要 `canRetry: () => !hasContent`**：网络抖动导致流中断时，如果已经输出了一半内容还去重试，用户会看到两段拼接的重复回复。只有当「一个字都没收到」时才重试，是安全的。

### 6.5 会话与消息流转

```
进入页面 → createNewFrontendSession() 建临时会话（status='TEMP'，标题「新会话」）
发送消息 → startNewSession(message)
           ├─ 首次发言：调 /session/start 拿真实 sessionId，Object.assign 回写
           └─ startAIResponse(sessionId, message) 开流
流进行中 → push = messages[length-1]（持有对象引用，中途切会话也不会写错气泡）
流结束   → event: done / onclose → requestEmotion()（emotionRequested 保证每轮只拉一次）
切换会话 → 先 stopGeneration() 再拉历史消息，避免旧流继续写入新会话
```

- 会话列表：`getSessionPage()` 兼容 `res.data` / `res.records` / 数组三种返回结构（`consultation.vue:475-483`）
- 流式帧解析：`JSON.parse` 包 `try/catch`，非 JSON 帧直接忽略，不打断整条流（`consultation.vue:419-424`）

### 6.6 认证与权限

**登录**：`login()` → 后端返回 `{ token, userInfo }` → 写入 `localStorage`，按 `userType` 跳转（`login.vue:79-87`）。

**守卫**（`router/index.js:114-145`）：

| 状态 | 访问 `/back/*` | 访问前台 | 访问 `/auth/*` |
|------|---------------|---------|---------------|
| 未登录 | 重定向 `/auth/login` | 放行 | 放行 |
| `userType === 1` | 重定向 `/` | 放行 | 重定向 `/` |
| `userType === 2` | 放行 | 重定向 `/back/dashboard` | — |
| 其他值 | 重定向 `/auth/login` | — | — |

**请求层**（`utils/request.js`）：

- 请求拦截器：有 token 就写入 `token` 请求头，没有就 `delete` 掉，避免脏值
- 响应拦截器：`code === '200'` 返回 `data.data`；`code === '-1'` 清 token + 跳登录（登录接口本身除外，只提示不跳转）
- 无 `code` 字段的响应直接原样返回（兼容第三方/文件接口）

### 6.7 Markdown 渲染（自研）

`components/MarkdownRenderer.vue` 用 `computed` + 正则链实现，未引入 `marked` / `markdown-it`：

1. **先转义** `<` `>`，再做后续替换 —— 顺序保证了 XSS 防护
2. 支持：代码块（带语言）、行内代码、粗体、斜体、H1-H3、链接（`target="_blank" rel="noopener noreferrer"`）、无序列表、有序列表、引用、分割线、换行
3. `isAiMessage` 开关切换 AI 气泡配色（蓝调）与普通文本配色（灰调）
4. 通过 `v-html` 输出，仅在受控内容上使用

### 6.8 数据看板（ECharts）

数据源：单个接口 `GET /data-analytics/overview`（`api/admin.js:65`），一次性返回全部统计。

| 区域 | 内容 |
|------|------|
| 指标卡 ×4 | 总用户数 / 情绪日志数 / 咨询会话数 / 平均情绪分 |
| 情绪趋势分析 | 双 Y 轴折线：平均情绪评分 + 记录数量 |
| 咨询会话统计 | 渐变柱状图：日会话数 + 参与用户数（附总会话/平均时长/活跃用户） |
| 用户活跃度趋势 | 多系列面积折线 |

图表初始化前统一 `dispose()` 旧实例（`dashboard.vue:253 / 376`），避免重复渲染叠加。

---

## 七、接口清单

### 前台 `src/api/frontend.js`

| 方法 | 接口 | 调用方 |
|------|------|--------|
| POST | `/user/add` | 注册 |
| POST | `/psychological-chat/session/start` | 创建会话 |
| GET | `/psychological-chat/sessions` | 会话列表 |
| DELETE | `/psychological-chat/sessions/{id}` | 删除会话 |
| GET | `/psychological-chat/sessions/{id}/messages` | 会话历史消息 |
| GET | `/psychological-chat/session/{id}/emotion` | 会话情绪分析结果 |
| POST | `/emotion-diary` | 提交情绪日记 |
| GET | `/knowledge/article/page` | 知识库分页 |
| GET | `/knowledge/article/{id}` | 文章详情 |

### 后台 `src/api/admin.js`

| 方法 | 接口 | 调用方 |
|------|------|--------|
| POST | `/user/login`、`/user/logout` | 登录 / 登出 |
| GET | `/knowledge/category/tree` | 分类下拉 |
| GET / POST | `/knowledge/article/page`、`/knowledge/article` | 文章分页 / 新增 |
| GET / PUT / DELETE | `/knowledge/article/{id}` | 详情 / 更新 / 删除 |
| PUT | `/knowledge/article/{id}/status` | 发布 / 下线 |
| POST | `/file/upload` | 封面上传（`multipart/form-data`） |
| GET | `/psychological-chat/sessions`、`/sessions/{id}/messages` | 咨询记录 |
| GET / DELETE | `/emotion-diary/admin/page`、`/emotion-diary/admin/{id}` | 情绪日志 |
| GET | `/data-analytics/overview` | 看板统计 |

### 流式接口（不走 axios）

| 方法 | 接口 | 说明 |
|------|------|------|
| POST | `/api/psychological-chat/stream` | `consultation.vue:394` 直连，请求头 `Token`，body `{ sessionId, userMessage }` |

---

## 八、配置说明

**Vite 代理**（`vite.config.js:23-30`）

```js
server: {
  proxy: {
    '/api': {
      target: 'http://159.75.169.224:1235',
      changeOrigin: true,
    },
  },
}
```

**文件服务地址**（`src/config/index.js`）

```js
export const fileBaseUrl = 'http://159.75.169.224:1235'
```

上传/静态资源拼接使用该常量，后端地址变更时只需改这两处。

**路径别名**：`@` → `src`（`vite.config.js:19-21`），全项目统一用 `@/api/...`、`@/components/...` 引用。

---

## 九、已知边界与后续优化

如实记录当前代码的限制，便于后续迭代：

1. **Element Plus 实际是全量引入**：`main.js` 里 `app.use(ElementPlus)` + 全量 CSS，同时 `vite.config.js` 又配了 `unplugin-auto-import` / `unplugin-vue-components` 的 `ElementPlusResolver`。二者并存时按需插件形同虚设，产物体积偏大。二选一即可（要按需就删掉 `main.js` 的全量注册与 CSS import）。
2. **Pinia 持久化未启用**：`pinia-plugin-persistedstate` 已注册（`main.js:12`），但 `stores/admin.js` 的 store 没有传 `persist` 选项，当前仅管理侧边栏折叠，刷新即还原。
3. **Markdown 渲染器是正则实现**：覆盖常用语法，但表格、嵌套列表、HTML 混排等复杂场景不支持；如需完整 GFM 建议换 `markdown-it` + DOMPurify。
4. **看板未监听窗口 resize**：ECharts 实例不会随窗口变化自适应，需要补 `window.addEventListener('resize', () => chart.resize())`。
5. **后端接口覆盖度**：前端 `api/` 中共 9 + 14 个接口，当前公开的后端仓库仅实现其中一部分，情绪分析、文章管理等模块依赖后端完整版，联调时需确认接口可用性。
6. **Token 请求头大小写**：axios 用 `token`，SSE 用 `Token`，依赖后端兼容；统一成一种更稳妥。

---

## 十、排错手册

| 现象 | 排查方向 |
|------|---------|
| 页面能开但所有接口 404/超时 | `vite.config.js` 的 `target` 是否指向正在运行的后端地址与端口 |
| 登录后立刻被踢回登录页 | 后端返回 `code === '-1'`；检查 token 是否过期、`userType` 是否为 1/2 |
| AI 一直转圈不出字 | 10s 后应触发首字节超时并提示重试；多为后端大模型调用超时或 Key 失效 |
| 停止生成后又冒出内容 | 检查 `stop()` 是否被调用、`onerror` 里是否 `throw`（未 throw 会导致库自动重连） |
| 断网后出现两段重复回复 | `canRetry` 是否传了 `() => !hasContent` |
| 控制台报 `Uncaught (in promise)` | `sse.js:74` 已用 `p?.catch?.(() => {})` 吞掉库自身的 rejection，若仍报错检查 handlers 抛异常 |
| 构建报语法错误 | Node 版本需 >= 20.19（Vite 8） |

---

## License

个人学习与作品展示用途。
