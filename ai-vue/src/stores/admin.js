import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAdminStore = defineStore('admin', () => {
    // 是否折叠 false 表示不折叠 即 展开
       const isCollapse = ref(false)

    // 切换折叠状态
    const toggleCollapse = () => {
        isCollapse.value = !isCollapse.value
    }

    return {
        isCollapse,
        toggleCollapse
    }
})
