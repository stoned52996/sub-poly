<template>
    <div class="self-sub-container">
        <div class="self-sub-header">
            <h1>自建节点管理</h1>
            <el-button type="primary" @click="showAddDialog">添加节点</el-button>
        </div>
        <div class="sub-desc">
            <!-- 页面描述介绍 -->
            <pre>描述: {{ tabDesc }}</pre>
        </div>

        <!-- 节点列表 -->
        <div class="self-sub-list">
            <el-table v-loading="loading" :data="nodes" border style="width: 100%"
                :header-cell-style="{ background: '#f5f7fa', color: '#606266' }">
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="link" label="自建节点地址" min-width="300" show-overflow-tooltip />
                <el-table-column prop="convert" label="转换为clash格式" min-width="300" show-overflow-tooltip />
                <el-table-column label="操作" width="200" fixed="right">
                    <template #default="scope">
                        <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <!-- 添加/编辑节点对话框 -->
        <el-dialog :title="dialogType === 'add' ? '添加节点' : '编辑节点'" v-model="dialogVisible" width="600px">
            <el-form :model="nodeForm" :rules="rules" ref="nodeFormRef" label-width="140px">
                <el-form-item label="自建节点地址" prop="link">
                    <el-input v-model="nodeForm.link" type="textarea" placeholder="`请输入自建节点地址
例如: hysteria2://d011f09a-ae52-43d2-a840-6e1f11a7bee1@118.181.22.153:20000/?insecure=1&sni=www.bing.com&mport=20000-55000#%E5%89%A9%E4%BD%99%E6%B5%81%E9%87%8F%EF%BC%9A97.68%20GB`" :rows="8"/>
                </el-form-item>
                <el-form-item label="转换为clash格式" prop="convert" v-if="dialogType === 'edit'">
                    <el-input v-model="nodeForm.convert" type="textarea" placeholder="" :rows="8"/>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitForm" :loading="submitLoading">
                        确认
                    </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { selfNodeApi } from '@/utils/request';

export default {
    name: 'SelfSub',
    setup() {
        // 数据列表
        const nodes = ref([]);
        const loading = ref(false);

        // 表单相关
        const nodeFormRef = ref(null);
        const dialogVisible = ref(false);
        const dialogType = ref('add');
        const submitLoading = ref(false);
        const currentId = ref(null);
        const tabDesc = ref('支持自建节点导入 协议支持 VMess Vless Trojan Shadowsocks hadowsocksR Hysteria Hysteria2 如需修改节点名 请导入后修改转换后的clash格式字段内容');

        const nodeForm = reactive({
            link: '',
            convert: ''
        });

        const rules = {
            link: [
                { required: true, message: '请输入自建节点地址', trigger: 'blur' }
            ]
        };

        // 获取所有节点数据
        const fetchNodes = async () => {
            loading.value = true;
            try {
                const res = await selfNodeApi.getAllNodes();
                nodes.value = res.data;
            } catch (error) {
                ElMessage.error('获取节点列表失败');
                console.error(error);
            } finally {
                loading.value = false;
            }
        };

        // 显示添加对话框
        const showAddDialog = () => {
            dialogType.value = 'add';
            resetForm();
            dialogVisible.value = true;
        };

        // 显示编辑对话框
        const handleEdit = (row) => {
            dialogType.value = 'edit';
            currentId.value = row.id;
            nodeForm.link = row.link;
            nodeForm.convert = row.convert;
            dialogVisible.value = true;
        };

        // 删除节点
        const handleDelete = (row) => {
            ElMessageBox.confirm(
                `确定要删除该节点吗？`,
                '警告',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                }
            )
                .then(async () => {
                    try {
                        await selfNodeApi.deleteNode(row.id);
                        ElMessage.success('删除成功');
                        fetchNodes();
                    } catch (error) {
                        ElMessage.error('删除失败');
                        console.error(error);
                    }
                })
                .catch(() => {
                    ElMessage.info('已取消删除');
                });
        };

        // 重置表单
        const resetForm = () => {
            if (nodeFormRef.value) {
                nodeFormRef.value.resetFields();
            }
            nodeForm.link = '';
            currentId.value = null;
        };

        // 提交表单
        const submitForm = async () => {
            if (!nodeFormRef.value) return;

            await nodeFormRef.value.validate(async (valid) => {
                if (!valid) return;

                submitLoading.value = true;
                try {
                    if (dialogType.value === 'add') {
                        await selfNodeApi.createNode(nodeForm);
                        ElMessage.success('添加成功');
                    } else {
                        nodeForm.id = currentId.value;
                        await selfNodeApi.updateNode(nodeForm);
                        ElMessage.success('更新成功');
                    }

                    dialogVisible.value = false;
                    fetchNodes();
                } catch (error) {
                    ElMessage.error(dialogType.value === 'add' ? '添加失败' : '更新失败');
                    console.error(error);
                } finally {
                    submitLoading.value = false;
                }
            });
        };

        // 页面加载时获取数据
        onMounted(() => {
            fetchNodes();
        });

        return {
            nodes,
            loading,
            dialogVisible,
            dialogType,
            nodeForm,
            nodeFormRef,
            rules,
            submitLoading,
            showAddDialog,
            handleEdit,
            handleDelete,
            tabDesc,
            submitForm
        };
    }
}
</script>

<style scoped>
.self-sub-container {
    width: 1200px;
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.self-sub-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.self-sub-header h1 {
    font-size: 24px;
    color: #303133;
    margin: 0;
}

.self-sub-list {
    margin-top: 20px;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
}

.sub-desc {
    font-size: 14px;
    color: #909399;
    word-wrap: break-word;
    /* 自动换行 */
    overflow: hidden;
    /* 隐藏溢出内容 */
    text-overflow: ellipsis;
    /* 使用省略号表示溢出 */
}
</style>