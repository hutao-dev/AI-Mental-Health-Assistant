<template>
    <div>
        <PageHead title="知识文章">
            <template #buttons>
                <el-button @click="handleEdit({})" type="primary">新增</el-button>
            </template>
        </PageHead>
        <TableSearch :formItem="formItem" @search="handleSearch"></TableSearch>
        <el-table :data="tableData" style="width: 100%; margin-top: 25px;">
            <el-table-column label="文章标题" width="200px" fixed="left">
                <template #default="scope">
                    <div style="display: flex; align-items: center;">
                        <el-icon><timer /></el-icon>
                        <span>{{ scope.row.title }}</span>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="分类" width="200px">
                <template #default="scope">
                    <div style="display: flex; align-items: center;">
                        <el-icon><timer /></el-icon>
                        <span>{{ categoryMap[scope.row.categoryId] }}</span>
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="authorName" label="作者" width="150px"></el-table-column>
            <el-table-column prop="readCount" label="阅读量" width="150px"></el-table-column>
            <el-table-column prop="updateAt" label="发布时间" width="150px"></el-table-column>
             <el-table-column label="操作" width="240px" fixed="right">
                <template #default="scope">
                    <el-button text @click="handleEdit(scope.row)" type="primary" size="mini">编辑</el-button>
                    <el-button @click="handlePublish(scope.row)" v-if="scope.row.status === 0 || scope.row.status === 2" text type="success" size="mini">发布</el-button>
                    <el-button @click="handleUnpublish(scope.row)" v-if="scope.row.status === 1" text type="warning" size="mini">下线</el-button>
                    <el-button @click="handleDelete(scope.row)" text type="danger" size="mini">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination 
        style="margin-top: 25px;"
        :page-size="pagination.size"
        @change="handleChange"
        layout="prev, pager, next" 
        :total="pagination.total"
    />
    <ArticlaDialog v-model:modelValue="dialogVisible" :article="currentArticle" :categoryies="categoryies" @success="handleSuccess"></ArticlaDialog>
    </div>
</template>
<script setup>
import { onMounted, ref, reactive } from 'vue'
import PageHead from '../components/PageHead.vue';
import TableSearch from '../components/TableSearch.vue';
import { categoryTree, articlePage, getArticleDetail, deleteArticle, changeArticleStatus } from '@/api/admin'
import ArticlaDialog from '../components/ArticlaDialog.vue'
import { ElMessageBox, ElMessage } from 'element-plus'

const formItem = [
    { comp: 'input', prop: 'title', label: '文章标题', placeholder: '请输入文章标题' },
    { comp: 'select', prop: 'categoryId', label: '文章类型',placeholder: '请选择文章类型' },
    { comp: 'select', prop: 'status', label: '状态', placeholder: '请输入文章内容', options: [{
        label: '草稿',
        value: '0'
    },{
        label: '已发布',
        value: '1'
    },{
        label: '已下载',
        value: '2'
    }]}
]

// 分页参数
const pagination = reactive({
    currentPage: 1,
    size: 10,
    total: 0
})
const handleSearch = async (formData) => {
    console.log(formData, '查询参数')

    const params = {
        ...pagination,
        ...formData
    }
    const { records,total } = await articlePage(params)
    tableData.value = records
    pagination.total = total
}    

// 分页切换
const handleChange = (page) => {
    pagination.currentPage = page
    handleSearch({})
}
// 分类映射
const categoryMap = reactive({})
// 分类列表
const categoryies = ref([])

// 列表数据
const tableData = ref([])

// 新增和编辑
const dialogVisible = ref(false)
const currentArticle = ref(null)
const handleSuccess = () => {
    dialogVisible.value = false
    // 刷新列表
    handleSearch()
}
const handleEdit = (row) => {
    if(!row.id) {
        // 新增
        currentArticle.value = {}
        dialogVisible.value = true
    }else{
        // 编辑
        currentArticle.value = row
        dialogVisible.value = true
        return
        getArticleDetail(row.id).then(res => {
            console.log(res, '编辑详情')
            currentArticle.value = res
            dialogVisible.value = true
        })
    }
    
}
// 发布
const handlePublish = (row) => {
    ElMessageBox.confirm(`确认发布文章${row.title}吗？`, 
    '确认', 
    {
        confirmButtonText: '确定发布',
        cancelButtonText: '取消',
        type: 'info'
    }).then(() => {
        changeArticleStatus(row.id, { status: 1 }).then(res => {
            ElMessage.success('发布成功')
            handleSearch()
        })
    })
}
// 下线
const handleUnpublish = (row) => {
    ElMessageBox.confirm(`确认下线文章${row.title}吗？`, 
    '确认', 
    {
        confirmButtonText: '确定下线',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        changeArticleStatus(row.id, { status: 2 }).then(res => {
            ElMessage.success('下线成功')
            handleSearch()
        })
    })
}
// 删除
const handleDelete = (row) => {
    ElMessageBox.confirm(`确认删除文章${row.title}吗？`, 
    '确认', 
    {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'danger'
    }).then(() => {
        deleteArticle(row.id).then(res => {
            ElMessage.success('删除成功')
            handleSearch()
        })
    })
}


onMounted(async () => {
    const data = await categoryTree()

    categoryies.value = data.map(item => {
        categoryMap[item.id] = item.categoryName
        return {
            label: item.categoryName,
            value: item.id
        }
    })
    console.log(categoryies.value, '分类列表')
    formItem[1].options = categoryies.value

    // 获取列表
    handleSearch({})
})
</script>