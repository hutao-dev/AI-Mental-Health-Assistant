<template>
    <el-dialog
        :title="isEdit ? '编辑文章' : '新增文章'"
        v-model="dialogVisible"
        width="50%"
        @close="handleClose"
    >
    <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="文章标题" prop="title">
            <el-input v-model="formData.title" placeholder="请输入文章标题" maxlength="200" show-word-limit clearable></el-input>
        </el-form-item>
        <el-form-item label="所属分类" prop="categoryId">
            <el-select v-model="formData.categoryId" placeholder="请选择所属分类" clearable>
                <el-option v-for="item in props.categoryies" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="文章摘要" prop="summary">
            <el-input type="textarea" v-model="formData.summary" placeholder="请输入文章摘要(可选)" maxlength="1000" show-word-limit :rows="4"></el-input>
        </el-form-item>
        <el-form-item label="标签" prop="tags">
            <el-select v-model="formData.tagArray" placeholder="请选择标签(可选)" multiple filterable allow-create width="100%">
                <el-option v-for="tag in commonTags" :key="tag" :label="tag" :value="tag"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="封面图片">
            <div class="cover-upload">
                <el-upload
                    class="avatar-uploader"
                    action="#"
                    :before-upload="beforeUpload"
                    :http-request="handleUploadRequest"
                    :show-file-list="false"
                    accept="image/*"
                >
                    <template #default>
                        <div v-if="!imgUrl" class="cover-placeholder"><p>点击上传封面</p></div>
                        <img v-else :src="imgUrl" alt="封面图片" class="cover-image">
                    </template>
                </el-upload>
                <div v-if="imgUrl" class="cover-actions">
                    <el-button type="danger" size="mini" @click="handleRemove">移除封面</el-button>
                </div>
            </div>
        </el-form-item>
        <el-form-item label="文章内容" prop="content">
            <RichTextEditor 
            v-model="formData.content" 
            :maxCharCount="5000"
            placeholder="请输入文章内容"
            @change="handleCountentChange"
            @created="handleEditorCreated"
            min-height="400px"
            ></RichTextEditor>
        </el-form-item>
    </el-form>
        <div v-if="btnPreview">
            <h3>内容预览</h3>
            <div v-html="formData.content"></div>
        </div>
        <template #footer>
            <el-button @click="btnPreview = !btnPreview">{{ btnPreview ? '隐藏预览' : '预览效果' }}</el-button>
            <el-button @click="handleClose">{{ isEdit ? '取消' : '关闭' }}</el-button>
            <el-button type="primary" @click="handleSubmit" :loading="loading">{{ isEdit ? '更新文章' : '新增文章' }}</el-button>
    </template>
    </el-dialog>
</template>
<script setup>
import { ref,reactive,computed, nextTick,watch } from 'vue'
import { ElMessage } from 'element-plus'
import { uploadFile, createArticle, updateArticle } from '@/api/admin'
import { fileBaseUrl } from '@/config/index'
import RichTextEditor from '@/components/RichTextEditor.vue'

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    categoryies: {
        type: Array,
        default: () => []
    },
    article: {
        type: Object,
        default: null
    }
})

const emit = defineEmits(['update:modelValue','success'])

const dialogVisible = computed({
    get() {
        return props.modelValue
    },
    set(val) {
        emit('update:modelValue', val)
    }   
})

const isEdit = computed(() => !!props.article?.id)

watch(() => props.article, (newVal) => {
    if (newVal) {
        nextTick(() => {
            Object.assign(formData, newVal)
            // 使用现有id
            businessId.value = newVal.id
            // 封面Url
            imgUrl.value = newVal.coverImage ? fileBaseUrl + newVal.coverImage : ''
        })
    } else {
        handleRemove()
    }
})

const handleClose = () => {
    // 重置表单
    formRef.value.resetFields()
    // 重置业务id
    businessId.value = null
    // 重置标签
    formData.tagArray = []
    // 重置图片和数据
    handleRemove()
    emit('update:modelValue', false)
}

const formData = reactive({
    "title": "",
    "content": "",
    "coverImage": "",
    "categoryId": '',
    "summary": "",
    "tags": "",
    "id": ""
})

const rules = reactive({
    title: [
        { required: true, message: '请输入文章标题', trigger: 'blur' },
        { max: 200, message: '文章标题最多200个字符', trigger: 'blur' }
    ],
    categoryId: [
        { required: true, message: '请选择所属分类', trigger: 'change' }
    ],
    content: [
        { required: true, message: '请输入文章内容', trigger: 'blur' },
        { max: 5000, message: '文章内容最多5000个字符', trigger: 'blur' }   
    ]
})

const commonTags = [
  '情绪管理', '焦虑', '抑郁', '压力', '睡眠',
  '冥想', '正念', '放松', '心理健康', '自我成长',
  '人际关系', '工作压力', '学习方法', '生活技巧'
]

const imgUrl = ref('')
const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/')
    const isLit5M = file.size / 1024 / 1024 < 5
    if (!isImage) {
        ElMessage.error('请上传图片文件')
        return false
    }
    if (!isLit5M) {
        ElMessage.error('图片文件大小不能超过5MB')
        return false
       }
    return true
}

const businessId = ref(null)

const handleUploadRequest = async ({ file }) => {
    businessId.value = crypto.randomUUID()
    const fileRes = await uploadFile(file, { 
        businessId: businessId.value
     })
     imgUrl.value = fileBaseUrl + fileRes.filePath
     formData.coverImage = fileRes.filePath
    }

const handleRemove = () => {
    formData.coverImage = ''
    imgUrl.value = ''
    }

const handleCountentChange = (data) => {
    formData.content = data.html
}

const editorInstance = ref(null)
const handleEditorCreated = (editor) => {
    editorInstance.value = editor
    if(formData.content && editor) {
        nextTick(() => {
            editor.setHtml(formData.content)
        })
    }
}

const formRef = ref()
const btnPreview = ref(false)
const loading = ref(false)

const handleSubmit = () => {
    formRef.value.validate((valid, fields) => {
        if(valid) {
            loading.value = true
            const submitData = {
                ...formData,
                tags: formData.tagArray.join(',')
            }
            delete submitData.tagArray

            if(!isEdit.value) {
                submitData.id = businessId.value
                createArticle(submitData).then(res => {
                loading.value = false
                emit('success')
                })
            } else {
                updateArticle(formData.id, submitData).then(res => {
                loading.value = false
                emit('success')
                })
            }  
        }
    })
}
</script>

<style lang="scss" scoped>
.cover-placeholder {
  width: 200px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8b949e;
  background: #f6f8fa;
}
.cover-image {
  width: 200px;
  height: 120px;
  display: block;
  object-fit: cover;
}
.cover-upload {
  position: relative;
}
.cover-actions {
  margin-top: 8px;
}
</style>