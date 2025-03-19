<template>
    <div class="rule-container">
        <div class="subscription-section">
            <el-button type="primary" @click="generateSubscription">{{ titleDesc }}</el-button>
            <div class="subscription-url-container">
                <el-input v-model="subscriptionUrl" placeholder="订阅地址" readonly></el-input>
                <el-button type="primary" @click="copySubscription" class="copy-btn" >
                    <el-icon><Document /></el-icon>复制
                </el-button>
            </div>
        </div>
    </div>
</template>
<script>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Document } from '@element-plus/icons-vue';
import { subApi } from '@/utils/request.js';
export default {
    name: 'Sub',
    components: { Document },
    setup() {
        // 新增部分
        const subscriptionUrl = ref('');
        const titleDesc = ref('');

        const getSub = async () => {
            const res = await subApi.getSub();
            if (res.data) {
                const domain = import.meta.env.VITE_API_BASE;
                subscriptionUrl.value = domain + '/subscribe?token=' + res.data.subUrl;
                titleDesc.value = '重新生成订阅地址';
            } else {
                titleDesc.value = '生成订阅地址';
                console.log('获取订阅地址失败');
            }
        };

        const copySubscription = async () => {
            try {
                await navigator.clipboard.writeText(subscriptionUrl.value);
                ElMessage.success('复制成功');
            } catch (err) {
                ElMessage.error('复制失败');
                console.error('复制失败:', err);
            }
        };

        const generateSubscription = async () => {
            const res = await subApi.generateSub();
            if (res.data) {
                const domain = import.meta.env.VITE_API_BASE;
                subscriptionUrl.value = domain + '/subscribe?token=' + res.data.subUrl;
            } else {
                console.log('生成订阅地址失败');
            }
           
        };
        onMounted(() => {
            getSub();
        })

        return {
            subscriptionUrl,
            generateSubscription,
            titleDesc,
            copySubscription
        };
    }
}
</script>

<style scoped>
.rule-container {
    width: 1200px;
    /* width: 100%; */
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
    gap: 10px;
}


.dialog-footer {
    display: flex;
    justify-content: flex-end;
}

.param-hint {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
    line-height: 1.4;
}

.resolve-hint {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
}

.subscription-url-container {
    display: flex;
    gap: 10px;
    align-items: center;
}

.subscription-url-container .el-input {
    flex: 1;
}

.subscription-url-container .el-button {
    flex-shrink: 0;
}

.copy-btn {
    background-color: #909399 !important;
    border-color: #909399 !important;
}

.copy-btn:hover {
    background-color: #a6a9ad !important;
    border-color: #a6a9ad !important;
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