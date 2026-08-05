<template>
    <div>
        <PageHead title="咨询管理" breadcrumb="咨询管理" />
        <el-table :data="tableData" style="width: 100%;">
            <el-table-column label="会话ID" width="100" >
                <template #default="scope">
                    <el-avatar>{{ scope.row.userNickname }}</el-avatar>
                </template>
            </el-table-column>
             <el-table-column label="情绪日志">
                <template #default="scope">
                    <div class="sssion-title">{{scope.row.sessionTitle}}</div>
                    <div class="sssion-content">{{scope.row.lastMessageContent}}</div>
                </template>
            </el-table-column>
            <el-table-column prop="messageContent" label="消息数" width="100" />
            <el-table-column prop="lastMessageTime" label="时间" width="100" />
            <el-table-column label="操作" width="100" >
                <template #default="scope">
                    <el-button type="primary" text @click="viewSessionDetail(scope.row)">详情</el-button>
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
    <el-dialog
        v-model="showDetailDialog"
        title="咨询会话详情"
        width="70%"
        :close-on-click-modal="false"
    >
        <div class="session-detail">
            <div class="detail-row">
                <div class="detail-label">用户：</div>
                <div class="detail-value">{{sessionDetail.userNickname}}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">开始时间：</div>
                <div class="detail-value">{{sessionDetail.startAt}}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">消息数：</div>
                <div class="detail-value">{{sessionDetail.messageCount}}</div>
            </div>
        </div>
        <div class="messages-container">
            <div class="messages-header">
                <h4>对话记录</h4>
            </div>
            <div class="messages-list">
                <div v-for="message in sessionMessages" :key="message.id" class="message-item" :class="message.senderType === 1 ? 'user-message' : 'ai-message'">
                    <div class="message-header">
                        <span class="sender">{{message.senderType === 1 ? '用户' : 'AI助手'}}</span>
                        <span class="time">{{ message.createdAt }}</span>
                    </div>
                    <div class="message-content">{{ message.content }}</div>
                </div>
                <div v-if="sessionMessages.length === 0" class="empty-message">暂无对话记录</div>
            </div>
        </div>
        <template #footer>
            <el-button @click="showDetailDialog = false">关闭</el-button>
        </template>
    </el-dialog>
    </div>
</template>
<script setup>
import { onMounted, ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import PageHead from '../components/PageHead.vue';
import { getConsultationPage, getSessionDetail } from '@/api/admin'

const tableData = ref([])

const pagination = reactive({
    currentPage: 1,
    size: 10,
    total: 0
})

const sessionDetail = ref({})
const sessionMessages = ref([])
const loadingMessages = ref(false)

const viewSessionDetail = async (row) => {
    loadingMessages.value = true
    showDetailDialog.value = true
    getSessionDetail(row.id).then(res => {
    loadingMessages.value = false
    sessionMessages.value = res
    sessionDetail.value = row
    })
}

const handleChange = (page) => {
    pagination.currentPage = page
    handleSearch({})
}

const handleSearch = async (formData) => {
    try {
        const res = await getConsultationPage(pagination)
        const { records, total } = res
        tableData.value = records || []
        pagination.total = total || 0
    } catch (error) {
        console.error('获取咨询列表出错:', error)
        ElMessage.error('获取咨询列表失败')
    }
}

const showDetailDialog = ref(false)

onMounted(() => {
    handleSearch()
})
</script>

<style lang="scss" scoped>
.session-title {
    font-weight: 500;
    color: #333;
    margin-bottom: 4px;
  }
  .sssion-content {
    font-size: 13px;
    color: #666;
    margin-bottom: 4px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .session-detail {
    max-height: 70vh;
    overflow-y: auto;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
    margin-bottom: 20px;

    .detail-row {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      :last-child {
        margin-bottom: 0;
      }
      .detail-label {
        font-weight: 500;
        color: #495057;
        min-width: 80px;
        margin-right: 8px;
      }

      .detail-value {
        color: #333;
      }
    }
  }
  .messages-container {
    .messages-header {
      margin-bottom: 16px;
      h4 {
        margin: 0;
        color: #333;
        font-size: 16px;
        font-weight: 500;
      }
    }
    .messages-list {
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 16px;
      background: #fff;
      .message-item {
        margin-bottom: 12px;
        padding: 12px;
        border-radius: 8px;
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        :last-child {
          margin-bottom: 0;
        }
        &.user-message {
          background: #e8f4fd;
        }

        &.ai-message {
          background: #f0f9f0;
        }
      }
      .message-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        .sender {
          font-weight: 500;
          color: #333;
        }

        .time {
          font-size: 12px;
          color: #999;
        }
      }
      .message-content {
        color: #333;
        line-height: 1.6;
        white-space: pre-wrap;
        font-size: 14px;
      }
      .empty-message {
        text-align: center;
        color: #999;
        padding: 20px;
      }
    }
  }
</style>