<template>
     <div class="navbar">
          <div class="flex-box">
               <el-button @click="handleCollapse">
                    <el-icon><Expand /></el-icon>
               </el-button>
               <p class="page-title">{{ route.meta.title }}</p>
          </div>
          <div class="flex-box">
               <el-dropdown @command="handleCommand">
                    <div class="flex-box">
                        <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"></el-avatar>
                        <p class="user-name">admin</p>
                        <el-icon><ArrowDown /></el-icon>
                    </div>    
                    <!-- 定义插槽 -->
                    <template #dropdown>
                         <el-dropdown-menu>
                            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                         </el-dropdown-menu>
                    </template>
               </el-dropdown>
          </div>
     </div>
</template>
<script setup>
import { ref } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { logout } from '@/api/admin'

const router = useRouter()
const route = useRoute()

const handleCommand = (command) => {
     // console.log(command)
    if (command === 'logout') {
        // 退出登录逻辑
        ElMessageBox.confirm('确定退出登录吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
            // 退出登录逻辑
            logout().then(() => {
               // 清除本地存储中的用户信息
               localStorage.removeItem('token')
               localStorage.removeItem('userInfo')
               // 退出登录成功
               router.push('/auth/login')
            })
        }).catch(() => {
            // 取消退出登录
        })
    }
}
// 切换折叠状态
const handleCollapse = () => {
     useAdminStore().toggleCollapse() 
}
</script>
<style lang="scss" scoped>
.navbar {
    height: 100%;
    background-color: #fff;
    padding: 0 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    border-bottom: 1px solid #e4e7ed;
     .flex-box {
     display: flex;
     justify-content: center;
     align-items: center;
     }
     .page-title {
          margin-left: 20px;
        font-size: 20px;
        font-weight: bold;
        color: #1f2937;
     }
}

</style>