<template>
    <div class="container">
        <div class="title">
            <div class="back-home">
                <el-icon><Back /></el-icon>
                <span>返回首页</span>
            </div>
            <div class="title-text">
                <h2>登录您的账户</h2>
                <p>请输入您的登录信息</p>
            </div>
        </div>
        <div class="form-container">
            <el-form 
            ref="ruleFormRef"
            :model="formData"
            :rules="rules"
            label-position="top"
        >
                <el-form-item label="用户名和邮箱" prop="username">
                    <el-input v-model="formData.username" size="large" placeholder="请输入用户名" />
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="formData.password" size="large" type="password" show-password placeholder="请输入密码" />
                </el-form-item>
                <el-button class="btn" size="large" type="primary" @click="submitForm(ruleFormRef)">登录</el-button>
            </el-form>
            <div class="footer">
                <p>还没有账户？<router-link to="/auth/register">去注册</router-link></p>
                <!-- <el-button type="primary" @click="submitForm()">登录</el-button> -->
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, reactive } from 'vue'
import { login } from '@/api/admin'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const ruleFormRef = ref()

const formData = reactive({
    username: '',
    password: ''
})

const rules = reactive({
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' }
    ]
})
// 登录
const router = useRouter()
const submitForm = async (formEl) => {
    if (!formEl)  return
    await formEl.validate(async (valid, fields) => {
        if (!valid) return
        try {
            const data = await login(formData)
            console.log('后端返回的完整数据：', data)
            
            // 判断是否登录成功
            if (data && data.token) {
                // 登录成功
                localStorage.setItem('token', data.token)
                localStorage.setItem('userInfo', JSON.stringify(data.userInfo))
                if (data.userInfo?.userType === 2) {
                    router.push('/back/dashboard')
                } else {
                    router.push('/')
                }
            } else if (data && data.code !== undefined) {
                // 根据错误码显示不同的提示
                const errorCode = String(data.code)
                const errorMsg = data.msg || data.message || '登录失败'
                
                // 根据错误信息判断具体错误类型
                if (errorMsg.includes('邮箱') || errorMsg.includes('已注册')) {
                    ElMessage.error('该邮箱已被注册')
                } else if (errorMsg.includes('密码') || errorMsg.includes('错误')) {
                    ElMessage.error('密码错误，请重新输入')
                } else if (errorMsg.includes('用户') || errorMsg.includes('不存在')) {
                    ElMessage.error('用户名不存在')
                } else {
                    ElMessage.error(errorMsg)
                }
            } else {
                // 其他未知错误
                ElMessage.error('登录失败，请检查用户名和密码')
            }
        } catch (error) {
            console.error('登录失败:', error)
            ElMessage.error(error.message || '登录失败，请重试')
        }
    })
}

</script>
<style scoped lang="scss">
    .container {
        width: 384px;
        .title {
            .back-home {
                margin-bottom: 60px;
            }
            .title-text {
                text-align: center;
                h2 {
                    font-size: 36px;
                    margin-bottom: 10px;
                    color: #1f2937;
                }
                p {
                    font-size: 18px;
                    color: #909399;
                }
            }
        }
        .form-container {
            .btn {
                margin-top: 40px;
                width: 100%;
            }
            .footer {
                padding: 30px;
                text-align: center;
            }
        }
    }
</style>
