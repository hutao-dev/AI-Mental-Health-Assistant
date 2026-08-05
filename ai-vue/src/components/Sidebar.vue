<template>
    <el-aside :width="isCollapse ? '64px' : '264px'">
        <el-menu
        :collapse="isCollapse"
        :collapse-transition="false"
        default-active="2"
        @open="handleOpen"
        @close="handleClose"
        class="menu-style"
      >
        <div class="brand">
            <el-image style="width: 50px; height: 50px; margin-right: 10px;" :src="iconUrl"></el-image>
            <div v-show="!isCollapse" class="info-card">
                <h1 class="brand-title">心理健康AI助手</h1>
                <p class="brand-subtitle">管理后台</p>
            </div>
        </div>
        <el-menu-item @click="selectMenu(item.path)" v-for="item in routeMenu" :key="item.path" :index="item.path">
          <el-icon><component :is="item.meta.icon"></component></el-icon>
          <span>{{ item.meta.title }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
</template>
<script setup>
import { useAdminStore } from '@/stores/admin'
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
const router = useRouter()
const route = useRoute()

const iconUrl = new URL('@/assets/images/机器人.png', import.meta.url).href

const isCollapse = computed(() => useAdminStore().isCollapse)

const routeMenu = computed(() => {
  const backendRoute = router.options.routes.find(r => r.path === '/back')
  return backendRoute?.children || []
})

const handleOpen = (key, keyPath) => {
  console.log('open', key, keyPath)
}

const handleClose = (key, keyPath) => {
  console.log('close', key, keyPath)
}

const selectMenu = (index) => {
  router.push(`/back/${index}`)
}
</script>
<style lang="scss" scoped>
.menu-style {
    height: 100%;
    .brand {
    display: flex;
    justify-content: center;
    padding: 10px;
    background-color: #fff;
    border-bottom: 1px solid #e4e7ed;
    .info-card {
        .brand-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 5px;
            color: #1f2937;
        }
        .brand-subtitle {
            font-size: 14px;
            color: #909399;
        }
    }
}
}
</style>
