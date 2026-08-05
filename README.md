[Uploading README.md…]()
# 宁渡 · AI 心理健康助手

> 基于 Vue 3 构建的心理健康 AI 咨询平台 —— SSE 流式对话 · 实时情绪分析 · 数据可视化看板

一个集 AI 心理咨询、情绪日记记录、心理健康知识库和后台数据管理于一体的全栈前端项目。AI 回复采用 SSE 流式传输，逐字呈现，体验接近 ChatGPT；对话过程实时分析用户情绪，动态展示情绪评分与治愈建议。

---

## 目录

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

## 功能特性

### AI 心理对话（核心功能）

- **SSE 流式对话**：基于 `@microsoft/fetch-event-source`，AI 回复逐字呈现，体验接近 ChatGPT
- **多会话管理**：支持新建、切换、删除历史会话，会话独立保存
- **实时情绪分析**：对话过程实时分析用户情绪，左侧「情绪花园」动态展示情绪评分、风险等级、治愈建议
- **Markdown 渲染**：自研轻量 Markdown 渲染器，支持代码块、标题、列表、粗体、引用等

### 情绪日记

- 10 级情绪评分（绝望崩溃 → 极致幸福）+ 8 种情绪图标可视化选择
- 记录情绪触发因素、睡眠质量、压力水平，形成完整情绪档案
- AI 自动分析情绪日记，生成风险等级评估与专业建议

### 后台数据看板

- **ECharts 可视化**：情绪趋势（双 Y 轴折线）、咨询活动统计（渐变柱状图）、用户活跃度趋势（多折线面积图）
- **核心指标卡片**：总用户数、情绪日志数、咨询会话数、平均情绪评分
- 知识文章管理（富文本编辑器）、咨询记录查看、情绪日志管理

### 权限控制

- 路由前置守卫按 `userType`（1=普通用户 / 2=管理员）精确控制前台/后台访问权限
- Token + userInfo 双重校验，Pinia 持久化存储，刷新不丢失登录态

### 心理健康知识库

- 文章列表（封面、分类、作者、阅读量）+ 文章详情页
- 后台支持富文本编辑（WangEditor）、发布/下线/删除

---

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue 3 | ^3.5.32 | 渐进式框架，Composition API + `<script setup>` |
| Vite | ^8.0.10 | 构建工具，路径别名 + 代理转发 |
| Element Plus | ^2.13.7 | UI 组件库，unplugin 按需自动导入 |
| Pinia | ^3.0.4 | 状态管理，pinia-plugin-persistedstate 持久化 |
| Vue Router | ^4.6.4 | 路由管理，前置守卫实现权限控制 |
| Axios | ^1.16.0 | HTTP 请求，统一封装拦截器 |
| ECharts | ^6.1.0 | 数据可视化图表 |
| @microsoft/fetch-event-source | ^2.0.1 | SSE 流式对话核心库 |
| WangEditor | ^5.1.23 | 富文本编辑器 |
| Sass | ^1.97.2 | CSS 预处理器 |
| dayjs | ^1.11.21 | 日期处理 |
| unplugin-auto-import | ^21.0.0 | API 自动导入 |
| unplugin-vue-components | ^32.0.0 | 组件自动导入 |

---

## 项目结构

```
ai-vue/
├── public/                     # 静态资源
├── src/
│   ├── api/                    # 接口定义
│   │   ├── admin.js            # 后台接口（15个）
│   │   └── frontend.js         # 前台接口（9个）
│   ├── assets/                 # 图片、样式等资源
│   ├── components/             # 公共组件
│   │   ├── FrontendLayout.vue  # 前台布局（导航栏+内容+底部）
│   │   ├── BackendLayout.vue   # 后台布局（侧边栏+顶栏+内容）
│   │   ├── AuthLayout.vue      # 认证布局（品牌+表单）
│   │   ├── Sidebar.vue         # 后台侧边栏菜单
│   │   ├── Navbar.vue          # 后台顶栏
│   │   ├── PageHead.vue        # 页面标题组件
│   │   ├── TableSearch.vue     # 表格搜索组件
│   │   ├── MarkdownRenderer.vue# Markdown 渲染器（自研）
│   │   ├── ArticlaDialog.vue   # 文章编辑弹窗
│   │   └── RichTextEditor.vue  # 富文本编辑器
│   ├── config/                 # 配置文件
│   │   └── index.js            # 文件服务地址等
│   ├── router/                 # 路由配置
│   │   └── index.js            # 前台/后台/认证路由 + 权限守卫
│   ├── stores/                 # Pinia 状态管理
│   │   └── admin.js            # 后台侧边栏折叠状态
│   ├── utils/                  # 工具函数
│   │   └── request.js          # Axios 封装（拦截器）
│   ├── views/                  # 页面视图
│   │   ├── home.vue            # 首页
│   │   ├── consultation.vue    # AI 心理咨询对话（核心）
│   │   ├── emotionDiary.vue    # 情绪日记
│   │   ├── frontendKnowledge.vue # 知识库列表
│   │   ├── articleDetail.vue   # 文章详情
│   │   ├── login.vue           # 登录
│   │   ├── register.vue        # 注册
│   │   ├── dashboard.vue       # 数据看板
│   │   ├── knowledge.vue       # 知识文章管理
│   │   ├── consultations.vue   # 咨询记录管理
│   │   └── emotional.vue       # 情绪日志管理
│   ├── App.vue                 # 根组件
│   └── main.js                 # 入口文件
├── index.html                  # HTML 模板
├── vite.config.js              # Vite 配置
└── package.json                # 依赖管理
```

---

## 快速开始

### 环境要求

- Node.js >= 16
- npm 或 yarn 或 pnpm

### 安装与运行

```bash
# 1. 克隆项目
git clone <repository-url>
cd ai-vue

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 构建生产版本
npm run build

# 5. 预览构建结果
npm run preview
```

启动后访问 `http://localhost:5173` 即可。

> **注意**：项目依赖后端服务，默认代理到 `http://159.75.169.224:1235`。如需修改，请编辑 `vite.config.js` 中的 `server.proxy` 配置。

---

## 页面说明

### 前台页面（普通用户）

| 页面 | 路由 | 文件 | 说明 |
|------|------|------|------|
| 首页 | `/` | `home.vue` | 品牌展示，引导用户开始对话或记录心情 |
| AI 心理咨询 | `/consultation` | `consultation.vue` | SSE 流式 AI 对话 + 情绪花园 |
| 情绪日记 | `/emotion-diary` | `emotionDiary.vue` | 情绪评分 + 触发因素 + 睡眠压力记录 |
| 知识库 | `/knowledge` | `frontendKnowledge.vue` | 心理健康文章列表 |
| 文章详情 | `/knowledge/article/:id` | `articleDetail.vue` | 文章正文阅读 |

### 后台页面（管理员）

| 页面 | 路由 | 文件 | 说明 |
|------|------|------|------|
| 数据看板 | `/back/dashboard` | `dashboard.vue` | 统计卡片 + ECharts 图表 |
| 知识管理 | `/back/knowledge` | `knowledge.vue` | 文章增删改查 + 富文本编辑 |
| 咨询记录 | `/back/consultations` | `consultations.vue` | 会话列表 + 对话详情查看 |
| 情绪日志 | `/back/emotional` | `emotional.vue` | 日志列表 + AI 情绪分析详情 |

### 认证页面

| 页面 | 路由 | 文件 | 说明 |
|------|------|------|------|
| 登录 | `/auth/login` | `login.vue` | 用户名/邮箱 + 密码登录 |
| 注册 | `/auth/register` | `register.vue` | 注册新账号（默认普通用户） |

---

## 核心技术实现

### 1. SSE 流式 AI 对话

使用 `@microsoft/fetch-event-source` 替代原生 `EventSource`，支持 POST 请求和自定义 Headers。

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

> **关键设计**：流式接口绕过 axios 直接调用，避免 axios 的 5s 超时中断 SSE 长连接。

### 2. 实时情绪分析

每次 AI 对话后调用 `getSessionEmotion` 接口，实时更新左侧「情绪花园」：
- 情绪评分（0-10）
- 风险等级（正常 / 关注 / 预警 / 危机）
- 治愈建议与小行动

### 3. 角色权限控制

路由前置守卫按 `userType` 精确控制访问：

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

### 4. ECharts 数据可视化

- **情绪趋势**：双 Y 轴折线图（平均情绪评分 + 记录数量）
- **咨询统计**：渐变柱状图（会话数量 + 参与用户数）
- **用户活跃度**：多折线面积图

### 5. 工程化优化

- **Element Plus 按需导入**：`unplugin-auto-import` + `unplugin-vue-components` 自动按需导入组件和 API
- **Pinia 持久化**：`pinia-plugin-persistedstate` 刷新不丢失登录态
- **Vite 路径别名**：`@/` 映射到 `src/`
- **Axios 统一封装**：请求拦截器自动添加 Token，响应拦截器统一处理业务状态码

---

## 接口说明

### 前台接口（`src/api/frontend.js`）

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| register | POST | `/user/add` | 用户注册 |
| startSession | POST | `/psychological-chat/session/start` | 开始咨询会话 |
| getSessionList | GET | `/psychological-chat/sessions` | 会话列表 |
| deleteSession | DELETE | `/psychological-chat/sessions/{id}` | 删除会话 |
| getSessionDetail | GET | `/psychological-chat/sessions/{id}/messages` | 会话消息 |
| getSessionEmotion | GET | `/psychological-chat/session/{id}/emotion` | 会话情绪分析 |
| addEmotionDiary | POST | `/emotion-diary` | 添加情绪日记 |
| getKnowledgeList | GET | `/knowledge/article/page` | 知识文章列表 |
| getKnowledgeDetail | GET | `/knowledge/article/{id}` | 文章详情 |

### 后台接口（`src/api/admin.js`）

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| login | POST | `/user/login` | 用户登录 |
| logout | POST | `/user/logout` | 退出登录 |
| categoryTree | GET | `/knowledge/category/tree` | 分类树 |
| articlePage | GET | `/knowledge/article/page` | 文章分页 |
| createArticle | POST | `/knowledge/article` | 创建文章 |
| getArticleDetail | GET | `/knowledge/article/{id}` | 文章详情 |
| updateArticle | PUT | `/knowledge/article/{id}` | 更新文章 |
| changeArticleStatus | PUT | `/knowledge/article/{id}/status` | 文章状态变更 |
| deleteArticle | DELETE | `/knowledge/article/{id}` | 删除文章 |
| uploadFile | POST | `/file/upload` | 文件上传 |
| getConsultationPage | GET | `/psychological-chat/sessions` | 咨询会话分页 |
| getSessionDetail | GET | `/psychological-chat/sessions/{id}/messages` | 会话消息 |
| getEmotionalPage | GET | `/emotion-diary/admin/page` | 情绪日志分页 |
| deleteEmotional | DELETE | `/emotion-diary/admin/{id}` | 删除情绪日志 |
| getAnalyticsOverview | GET | `/data-analytics/overview` | 数据分析概览 |

---

## 配置说明

### Vite 代理配置

```js
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://159.75.169.224:1235',
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
  timeout: 5000,
})

// 请求拦截器：自动添加 Token
// 响应拦截器：统一处理 code=200(成功) / code=-1(登录过期)
```

### 文件服务地址

```js
// src/config/index.js
export const fileBaseUrl = 'http://159.75.169.224:1235'
```

---

## License

本项目仅用于学习交流，版权归作者所有。
