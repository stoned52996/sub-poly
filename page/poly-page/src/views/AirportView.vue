<template>
    <div class="airport-container">
        <div class="airport-header">
            <h1>机场管理</h1>
            <el-button type="primary" @click="showAddDialog">添加机场</el-button>
        </div>

        <!-- 机场列表 -->
        <div class="airport-list">
            <el-table v-loading="loading" :data="airports" border style="width: 100%"
                :header-cell-style="{ background: '#f5f7fa', color: '#606266' }">
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="name" label="机场名称" min-width="150" />
                <el-table-column prop="subscriptionUrl" label="订阅地址" min-width="250" show-overflow-tooltip />
                <el-table-column prop="remarks" label="备注" min-width="150" show-overflow-tooltip />
                <el-table-column label="状态" width="100">
                    <template #default="scope">
                        <el-tag :type="scope.row.isEnabled ? 'success' : 'info'">
                            {{ scope.row.isEnabled ? '启用' : '禁用' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200" fixed="right">
                    <template #default="scope">
                        <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <!-- 添加/编辑机场对话框 -->
        <el-dialog :title="dialogType === 'add' ? '添加机场' : '编辑机场'" v-model="dialogVisible" width="500px">
            <el-form :model="airportForm" :rules="rules" ref="airportFormRef" label-width="100px">
                <el-form-item label="机场名称" prop="name">
                    <el-input v-model="airportForm.name" placeholder="请输入机场名称" />
                </el-form-item>
                <el-form-item label="订阅地址" prop="subscriptionUrl">
                    <el-input v-model="airportForm.subscriptionUrl" placeholder="请输入订阅地址" />
                </el-form-item>
                <el-form-item label="节点前缀" prop="remarks">
                    <el-input v-model="airportForm.remarks" type="textarea" placeholder="请输入节点前缀 将会该订阅地址的节点名称前添加" />
                </el-form-item>
                <el-form-item label="状态">
                    <el-switch v-model="airportForm.isEnabled" active-text="启用" inactive-text="禁用" :active-value='1'
                        :inactive-value='0' />
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
import { airportApi } from '@/utils/request';

export default {
    name: 'AirportView',
    setup() {
        // 数据列表
        const airports = ref([]);
        const loading = ref(false);

        // 表单相关
        const airportFormRef = ref(null);
        const dialogVisible = ref(false);
        const dialogType = ref('add'); // 'add' 或 'edit'
        const submitLoading = ref(false);
        const currentId = ref(null);

        const airportForm = reactive({
            name: '',
            subscriptionUrl: '',
            remarks: '',
            isEnabled: 0
        });

        const rules = {
            name: [
                { required: true, message: '请输入机场名称', trigger: 'blur' },
                { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
            ],
            subscriptionUrl: [
                { required: true, message: '请输入订阅地址', trigger: 'blur' },
                { type: 'url', message: '请输入正确的URL地址', trigger: 'blur' }
            ]
        };

        // 获取所有机场数据
        const fetchAirports = async () => {
            loading.value = true;
            try {
                const res = await airportApi.getAirports();
                console.log('00000')
                console.log(res.data);
                airports.value = res.data;
            } catch (error) {
                ElMessage.error('获取机场列表失败');
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

            // 填充表单
            Object.keys(airportForm).forEach(key => {
                if (key in row) {
                    airportForm[key] = row[key];
                }
            });

            dialogVisible.value = true;
        };

        // 删除机场
        const handleDelete = (row) => {
            ElMessageBox.confirm(
                `确定要删除机场 "${row.name}" 吗？`,
                '警告',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                }
            )
                .then(async () => {
                    try {
                        await airportApi.deleteAirport(row.id);
                        ElMessage.success('删除成功');
                        fetchAirports();
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
            if (airportFormRef.value) {
                airportFormRef.value.resetFields();
            }

            airportForm.name = '';
            airportForm.subscriptionUrl = '';
            airportForm.remarks = '';
            airportForm.isEnabled = true;
            currentId.value = null;
        };

        // 提交表单
        const submitForm = async () => {
            if (!airportFormRef.value) return;
            // 检查名称是否重复
            const isDuplicateName = airports.value.some(airport =>
                airport.name === airportForm.name && airport.id !== currentId.value
            );

            if (isDuplicateName) {
                ElMessage.error('机场名称已存在，请输入不同的名称');
                return;
            }
            await airportFormRef.value.validate(async (valid) => {
                if (!valid) return;

                submitLoading.value = true;
                try {
                    if (dialogType.value === 'add') {
                        await airportApi.createAirport(airportForm);
                        ElMessage.success('添加成功');
                    } else {
                        airportForm.id = currentId.value;
                        await airportApi.updateAirport(airportForm);
                        ElMessage.success('更新成功');
                    }

                    dialogVisible.value = false;
                    fetchAirports();
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
            fetchAirports();
        });

        return {
            airports,
            loading,
            dialogVisible,
            dialogType,
            airportForm,
            airportFormRef,
            rules,
            submitLoading,
            showAddDialog,
            handleEdit,
            handleDelete,
            submitForm
        };
    }
}
</script>

<style scoped>
.airport-container {
    width: 1200px;
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.airport-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.airport-header h1 {
    font-size: 24px;
    color: #303133;
    margin: 0;
}

.airport-list {
    margin-top: 20px;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
}
</style>