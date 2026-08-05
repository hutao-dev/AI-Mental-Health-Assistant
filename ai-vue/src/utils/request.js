import axios from "axios";
import { ElMessage } from 'element-plus'


// 创建axios实例
const service = axios.create({
    baseURL: '/api', // 基础URL
    timeout: 5000, // 超时时间
})

// 请求拦截器
service.interceptors.request.use(
    config => {
        // 在发送请求之前做些什么
        const token = localStorage.getItem('token')
        if (token) {
            config.headers['token'] = token
        } else {
            delete config.headers['token']
        }
        return config
    },
    (error) => {
        // 对请求错误做些什么
        return Promise.reject(error)
    }
)
// 响应拦截器
service.interceptors.response.use(
    response => {
        // 对响应数据做点什么
        const { data, config } = response
        
        // 如果响应没有code字段，直接返回data
        if (!data.hasOwnProperty('code')) {
            return data
        }
        
        // 处理响应数据
        const code = String(data.code)
        if (code === '200') {
            // 如果有data字段，返回data.data，否则返回整个data
            return data.hasOwnProperty('data') ? data.data : data
        } else if (code === '-1') {
            if( !config.url?.includes('/login')) {
                ElMessage.error(data.msg || '登录过期，请重新登录')

                // 清除token
                localStorage.removeItem('token')
                localStorage.removeItem('userInfo')
                // 跳转到登录页
                window.location.href = '/auth/login'
            } else {
                ElMessage.error(data.msg || '登录过期，请重新登录')
                return Promise.reject('网络请求失败')
            }
        }
        
        // 其他情况，直接返回data
        return data
    },
    (error) => {
        // 对响应错误做点什么
        return Promise.reject(error)
    }
)

export default service
