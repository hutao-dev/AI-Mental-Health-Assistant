import { createRouter, createWebHistory } from 'vue-router'
import BackendLayout from '@/components/BackendLayout.vue'
import HelloWorld from '@/components/HelloWorld.vue'
import AuthLayout from '@/components/AuthLayout.vue'
import FrontendLayout from '@/components/FrontendLayout.vue'

// 路由配置
const backendRoutes = [
//   {
//     path: '/',
//     redirect: '/auth/login'
//   },
  {
    path: '/back',
    redirect: '/back/dashboard',
    component: BackendLayout,
    children: [
        {
            path: 'dashboard',
            component: () => import('@/views/dashboard.vue'),
            meta: {
                title: '数据分析',
                icon: 'PieChart'
            }
        },
        {
            path: 'knowledge',
            component: () => import('@/views/knowledge.vue'),
            meta: {
                title: '知识文章',
                icon: 'ChatLineSquare'
            }
        },
        {
            path: 'consultations',
            component: () => import('@/views/consultations.vue'),
            meta: {
                title: '咨询记录',
                icon: 'Message'
            }
        },
         {
            path: 'emotional',
            component: () => import('@/views/emotional.vue'),
            meta: {
                title: '情绪日志',
                icon: 'User'
            }
        }
    ]
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
        {
            path: 'login',
            component: () => import('@/views/login.vue'),
            meta: {
                title: '登录',
            }
        },
        {
            path: 'register',
            component: () => import('@/views/register.vue'),
            meta: {
                title: '注册',
            }
        }
    ]
  }
]

// 前端路由配置
const frontendRoutes = [
    {
        path: '/',
        component: FrontendLayout,
        children: [
            {
                path: '',
                component: () => import('@/views/home.vue'),
            }, 
            {
                path: 'consultation',
                component: () => import('@/views/consultation.vue'),
            },
            {
                path: 'emotion-diary',
                component: () => import('@/views/emotionDiary.vue'),
            },
            {
                path: 'knowledge',
                component: () => import('@/views/frontendKnowledge.vue'),
            },
            {
                path: 'knowledge/article/:id',
                component: () => import('@/views/articleDetail.vue'),
                props: true
            },
        ]
    }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes: [...backendRoutes, ...frontendRoutes]
})

// 路由前置守卫
router.beforeEach((to, from, next) => {
    // 检查用户是否已登录
    const token = localStorage.getItem('token')
    if (token) {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'))
        if (userInfo.userType == 2) {
            if (to.path.startsWith('/back')) {
                next()
            } else {
                next('/back/dashboard')
            }
        } else if (userInfo.userType == 1) {
            // 用户端账号只能访问前台路由
            if (to.path.startsWith('/back') || to.path.startsWith('/auth')) {
                next('/')
            } else {
                next()
            }
        } else {
            next('/auth/login')
        }
    } else {
            // 如果用户已登录，继续导航
            if (to.path.startsWith('/back')) {
            // 如果用户未登录，重定向到登录页
            next('/auth/login')
        } else {
            next()
        }
    }
})

export default router