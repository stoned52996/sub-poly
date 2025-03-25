<template>
    <div class="rule-container">
        <div class="subscription-section">
            <div class="key-container">
                <h3>当前访问秘钥</h3>
                <el-input v-model="currentKey" placeholder="当前访问秘钥" type="password"></el-input>
            </div>
            <div class="key-container">
                <h3>新访问秘钥</h3>
                <el-input v-model="newKey" placeholder="请输入新的访问秘钥" type="password"></el-input>
            </div>
            <div class="reset-section">
                <el-button type="warning" @click="showResetConfirm">重置访问秘钥</el-button>
                <p class="param-hint">注意：重置后原访问秘钥将立即失效，请确保新秘钥设置正确</p>
            </div>
        </div>

        <el-dialog
            v-model="resetDialogVisible"
            title="确认重置"
            width="30%"
        >
            <span>重置后原访问秘钥将立即失效，是否继续？</span>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="resetDialogVisible = false">取消</el-button>
                    <el-button type="warning" @click="resetKey">确认重置</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { userApi } from '@/utils/request.js';

export default {
    name: 'ReSet',
    setup() {
        const currentKey = ref('');
        const newKey = ref('');
        const resetDialogVisible = ref(false);

        const showResetConfirm = () => {
            if (!newKey.value) {
                ElMessage.warning('请输入新的访问秘钥');
                return;
            }
            if (!currentKey.value) {
                ElMessage.warning('请输入旧的访问秘钥');
                return;
            }
            resetDialogVisible.value = true;
        };

        const resetKey = async () => {
            try {
                const res = await userApi.reset({oldToken:currentKey.value, token:newKey.value});
                if (res.code === 200) {
                    currentKey.value = '';
                    newKey.value = '';
                    ElMessage.success('重置成功');
                    localStorage.setItem('token', res.data.token)
                    resetDialogVisible.value = false;
                } else {
                    ElMessage.error(res.message);
                }
            } catch (err) {
                ElMessage.error('重置失败');
                console.error('重置失败:', err);
            }
        };

        return {
            currentKey,
            newKey,
            resetDialogVisible,
            showResetConfirm,
            resetKey
        };
    }
}
</script>

<style scoped>
.rule-container {
    width: 1200px;
    padding: 20px;
    margin: 0 auto;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.subscription-section {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.key-container h3 {
    margin-bottom: 15px;
    color: #303133;
}

.reset-section {
    margin-top: 10px;
}

.param-hint {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
    line-height: 1.4;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

@media screen and (max-width: 768px) {
    .rule-container {
        width: 100%;
        padding: 10px;
        border-radius: 0;
        box-shadow: none;
    }
}
</style>