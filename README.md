[README.md](https://github.com/user-attachments/files/32561144/README.md)# 宁渡 · AI 心理健康助手（前端）

> Vue 3 + Spring Boot 前后端分离的心理健康 AI 咨询平台 —— SSE 流式对话 · 大模型接入 · JWT 认证 · 数据可视化

本项目为「宁渡 AI 心理助手」的**前端部分**（Vue 3），配套后端为 Spring Boot 项目（`../code/ai-springboot`）。AI 回复采用 **SSE 流式传输**，逐字呈现，体验接近 ChatGPT；对话过程实时分析用户情绪，动态展示情绪评分与治愈建议。

---

## 目录

- [整体架构](#整体架构)
- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [页面说明](#页面说明)
- [核心技术实现](#核心技术实现)
- [接口说明](#接口说明)
- [配置说明](#配置说明)
- [License](#license)

---

## 整体架构

```
┌─────────────────────────┐        ┌──────────────────────────────┐
│   前端 ai-vue (Vue 3)   │  /api  │  后端 ai-springboot          │
│  Element Plus · ECharts │ ─────▶ │  Spring Boot 3 + Spring AI   │
│  fetch-event-source     │  SSE   │  Spring Security + JWT       │
└─────────────────────────┘ ◀───── └──────────────┬───────────────┘
         浏览器渲染逐字输出        token 流         │ OpenAI 兼容协议
                                                  ▼
                                     硅基流动 SiliconFlow
                                     Qwen/Qwen2.5-7B-Instruct
                                                  │
                                                  ▼
                                     MySQL（用户/会话/消息）
```

- **流式链路**：前端 `fetchEventSource` → 后端 `Flux<ServerSentEvent>` → 大模型 token 流逐段推送 → 前端增量拼接渲染
- **认证链路**：登录获取 JWT → 前端存 localStorage + 路由守卫 → 后端 Spring Security 过滤器校验（自定义 `token` 请求头）

---

## 功能特性

### 已前后端闭环 ✅

- **AI 心理咨询流式对话**（核心功能）
  - SSE 流式输出，AI 回复逐字呈现，体验接近 ChatGPT
  - 多会话管理：新建、切换、删除历史会话
  - 多轮对话记忆（后端 30 条滑动窗口，按会话隔离上下文）
  - 自研 Markdown 渲染器渲染 AI 回复（代码块、标题、列表、粗体、引用）
- **用户认证**
  - 登录（用户名/邮箱 + 密码）、注册
  - JWT 无状态认证 + BCrypt 密码加密
  - 路由前置守卫按 `userType`（1=普通用户 / 2=管理员）控制前台/后台访问权限

### 前端已完成 / 后端开发中 🚧

- **情绪分析（情绪花园）**：对话过程实时展示情绪评分、风险等级、治愈建议（前端 UI 已完成，后端接口开发中，数据库字段已预留）
- **情绪日记**：10 级情绪评分 + 8 种情绪图标、触发因素、睡眠质量、压力水平记录
- **后台数据看板**：ECharts 情绪趋势（双 Y 轴折线）、咨询统计（渐变柱状图）、用户活跃度（多折线面积图）+ 核心指标卡片
- **知识库**：文章列表 + 详情阅读，后台富文本管理（WangEditor）

---

## 技术栈

### 前端（本项目）

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue 3 | ^3.5.32 | Composition API + `<script setup>` |
| Vite | ^8.0.10 | 构建工具，路径别名 + 代理转发 |
| Element Plus | ^2.13.7 | UI 组件库，unplugin 按需自动导入 |
| Pinia | ^3.0.4 | 状态管理，pinia-plugin-persistedstate 持久化 |
| Vue Router | ^4.6.4 | 路由管理，前置守卫实现权限控制 |
| Axios | ^1.16.0 | HTTP 请求，统一封装拦截器 |
| **@microsoft/fetch-event-source** | ^2.0.1 | **SSE 流式对话核心库** |
| ECharts | ^6.1.0 | 数据可视化图表 |
| WangEditor | ^5.1.23 | 富文本编辑器 |
| Sass | ^1.97.2 | CSS 预处理器 |
| dayjs | ^1.11.21 | 日期处理 |

### 后端（配套项目 `../code/ai-springboot`）

| 技术 | 版本 | 说明 |
|------|------|------|
| Java | 17 | 运行环境 |
| Spring Boot | 3.4.0 | 核心框架 |
| **Spring AI** | 1.1.0-M1 | 大模型接入（OpenAI 兼容客户端） |
| Spring Security | 6.x | 无状态认证 + 自研 JWT 过滤器 |
| java-jwt (auth0) | 4.4.0 | JWT 生成与校验（HMAC256） |
| MyBatis-Plus | 3.5.7 | ORM |
| MySQL | 8.x | 数据库 `mental_health_assistant` |
| Reactor（传递依赖） | - | `Flux<ServerSentEvent>` SSE 流式推送 |

> **大模型**：`Qwen/Qwen2.5-7B-Instruct`，通过 OpenAI 兼容协议接入**硅基流动（SiliconFlow）**平台，换模型只改配置不改代码。

---

## 项目结构

```
ai-vue/
├── src/
│   ├── api/                    # 接口定义
│   │   ├── admin.js            # 后台接口
│   │   └── frontend.js         # 前台接口
│   ├── components/             # 公共组件
│   │   ├── FrontendLayout.vue  # 前台布局（导航栏+内容+底部）
│   │   ├── BackendLayout.vue   # 后台布局（侧边栏+顶栏+内容）
│   │   ├── AuthLayout.vue      # 认证布局（品牌+表单）
│   │   ├── Sidebar.vue         # 后台侧边栏菜单
│   │   ├── Navbar.vue          # 后台顶栏
│   │   ├── PageHead.vue        # 页面标题组件
│   │   ├── TableSearch.vue     # 表格搜索组件（配置式）
│   │   ├── MarkdownRenderer.vue# Markdown 渲染器（自研，正则+XSS防护）
│   │   ├── ArticlaDialog.vue   # 文章编辑弹窗
│   │   └── RichTextEditor.vue  # 富文本编辑器（WangEditor）
│   ├── config/                 # 文件服务地址等配置
│   ├── router/                 # 路由配置 + 权限守卫
│   ├── stores/                 # Pinia 状态管理（持久化）
│   ├── utils/
│   │   └── request.js          # Axios 封装（拦截器）
│   └── views/                  # 页面视图（11 个）
│       ├── home.vue            # 首页
│       ├── consultation.vue    # AI 心理咨询对话（核心，SSE）
│       ├── emotionDiary.vue    # 情绪日记
│       ├── frontendKnowledge.vue # 知识库列表
│       ├── articleDetail.vue   # 文章详情
│       ├── login.vue / register.vue # 登录注册
│       └── dashboard.vue / knowledge.vue / consultations.vue / emotional.vue # 后台管理
├── vite.config.js              # Vite 配置（别名+代理）
└── package.json
```

---

## 快速开始

### 环境要求

- Node.js >= 16
- JDK 17+、MySQL 8.x、Maven 3.6+（运行配套后端）
- 硅基流动平台 API Key

### 启动后端

```bash
cd ../code/ai-springboot

# 1. 修改 application.yml：数据库连接 + spring.ai.openai.api-key（建议环境变量注入）
# 2. 创建数据库 mental_health_assistant 并建表（详见后端 README）
# 3. 启动（默认端口 1236）
mvn spring-boot:run
```

### 启动前端

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器（默认端口 5173）
npm run dev

# 3. 构建生产版本
npm run build
```

启动后访问 `http://localhost:5173`。

> **联调提示**：后端未配置 CORS，前端通过 Vite 代理转发 `/api` 请求。请确认 `vite.config.js` 中 `server.proxy.target` 指向后端实际地址（后端默认端口为 **1236**，如部署地址不同请相应修改）。

---

## 页面说明

### 前台页面（普通用户）

| 页面 | 路由 | 说明 |
|------|------|------|
| 首页 | `/` | 品牌展示，引导用户开始对话或记录心情 |
| AI 心理咨询 | `/consultation` | **SSE 流式 AI 对话 + 情绪花园**（核心页面） |
| 情绪日记 | `/emotion-diary` | 情绪评分 + 触发因素 + 睡眠压力记录 |
| 知识库 | `/knowledge` | 心理健康文章列表 |
| 文章详情 | `/knowledge/article/:id` | 文章正文阅读 |

### 后台页面（管理员）

| 页面 | 路由 | 说明 |
|------|------|------|
| 数据看板 | `/back/dashboard` | 统计卡片 + ECharts 图表 |
| 知识管理 | `/back/knowledge` | 文章增删改查 + 富文本编辑 |
| 咨询记录 | `/back/consultations` | 会话列表 + 对话详情查看 |
| 情绪日志 | `/back/emotional` | 日志列表 + AI 情绪分析详情 |

### 认证页面

| 页面 | 路由 | 说明 |
|------|------|------|
| 登录 | `/auth/login` | 用户名/邮箱 + 密码，按角色跳转 |
| 注册 | `/auth/register` | 注册新账号（默认普通用户） |

---

## 核心技术实现

### 1. 端到端 SSE 流式对话

**前端**（`src/views/consultation.vue`）：

```js
import { fetchEventSource } from '@microsoft/fetch-event-source'

fetchEventSource('/api/psychological-chat/stream', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Token': localStorage.getItem('token'),
    'Accept': 'text/event-stream',
  },
  body: JSON.stringify({ sessionId, userMessage }),
  onmessage(event) {
    const payload = JSON.parse(event.data)
    // 增量拼接内容，Vue 响应式自动更新 UI
    currentAiMessage.content += payload.data.content
  },
})
```

前端关键设计：

- **为什么不用原生 `EventSource`**：原生只支持 GET，无法携带请求体和自定义 Header（传不了 Token）
- **为什么绕过 axios**：axios 封装有 `timeout: 5000`，会掐断 SSE 长连接，流式接口单独直连
- **三重流结束判定**：服务器推空 content / 3 秒空闲超时兜底 / onClose 回调
- **中断控制**：`AbortController` 随时可取消；AI 输出期间禁用输入框防并发

**后端**（`PsychologicalChat` Controller）：

```java
@PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<ServerSentEvent<String>> streamChat(@Valid @RequestBody ConsultationStreamDTO streamDTO) {
    return psychologicalSupportService.streamPsychologicalChat(sessionId, userMessage)
            .map(fragment -> ServerSentEvent.<String>builder()
                    .event("message")
                    .data(JSONUtil.toJsonStr(Result.ok(Map.of("content", fragment))))
                    .build())
            .concatWith(Flux.just(/* done 事件 */))
            .delayElements(Duration.ofMillis(50)); // 平滑输出，避免渲染卡顿
}
```

- `Flux.create(sink)` 桥接大模型 token 流，逐段推送 + 累积全文，流结束后完整回复落库
- 事件协议：`message`（逐段内容）→ `done`（结束）→ `error`（错误）

### 2. 大模型接入与多轮记忆（后端）

- Spring AI `ChatClient` + `MessageChatMemoryAdvisor`（Advisor 架构零侵入注入记忆）
- `MessageWindowChatMemory` 30 条滑动窗口，`conversation_session_{id}` 按会话隔离
- 专业心理疏导系统提示词：角色定位、对话原则（先共情 → 梳理情绪 → 温和建议 → 鼓励求助）、自杀风险应对策略

### 3. 角色权限控制（前端）

```js
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')

  if (to.path.startsWith('/back')) {
    // 后台路由：需要登录 + 管理员权限
    if (!token) return next('/auth/login')
    if (userInfo.userType !== 2) return next('/')
  }
  // ...
})
```

与后端 Spring Security JWT 过滤器（自定义 `token` 请求头、HMAC256、BCrypt）构成前后端一体化认证授权体系。

### 4. 数据可视化

- 情绪趋势：双 Y 轴折线图（平均情绪评分 + 记录数量）
- 咨询统计：渐变柱状图（会话数量 + 参与用户数）
- 用户活跃度：多折线面积图

### 5. 工程化

- **Element Plus 按需导入**：unplugin-auto-import + unplugin-vue-components
- **Pinia 持久化**：刷新不丢失登录态
- **自研 MarkdownRenderer**：正则解析 + XSS 转义，零第三方依赖
- **统一封装**：Axios 拦截器自动添加 Token、统一处理业务状态码

---

## 接口说明

### 已实现（前后端闭环）

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 登录 | POST | `/api/user/login` | 返回 JWT + 用户信息 |
| 注册 | POST | `/api/user/add` | 创建普通用户 |
| 创建会话 | POST | `/api/psychological-chat/session/start` | 开始咨询会话 |
| **流式对话** | POST | `/api/psychological-chat/stream` | SSE 流式 AI 回复 |
| 当前用户 | GET | `/api/user/current` | 获取登录用户信息 |

### 前端已对接 / 后端开发中

| 模块 | 接口 | 说明 |
|------|------|------|
| 会话管理 | `/api/psychological-chat/sessions` | 列表 / 删除 / 详情 |
| 情绪分析 | `/api/psychological-chat/session/{id}/emotion` | 会话情绪（数据库字段已预留） |
| 情绪日记 | `/api/emotion-diary` | 添加日记 / 管理端分页 |
| 知识库 | `/api/knowledge/article/*` | 列表 / 详情 / 管理端 CRUD |
| 数据分析 | `/api/data-analytics/overview` | 看板统计数据 |
| 文件上传 | `/api/file/upload` | 封面图片等 |

> 完整后端说明（数据库设计、配置细节、已知限制）见 `../code/ai-springboot/README.md`。

---

## 配置说明

### Vite 代理配置

```js
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:1236',  // 后端地址，按实际部署修改
      changeOrigin: true,
    },
  },
}
```

### Axios 封装

```js
// src/utils/request.js
const service = axios.create({
  baseURL: '/api',
  timeout: 5000,  // 注意：流式接口不走 axios，避免超时中断 SSE
})
// 请求拦截器：自动添加 Token
// 响应拦截器：统一处理 code=200(成功) / code=-1(登录过期)
```

---
