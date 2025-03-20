<template>
    <div class="group-container">
        <div class="group-header">
            <h1>分组管理</h1>
            <el-button type="primary" @click="showAddDialog">添加分组</el-button>
        </div>

        <!-- 分组列表 -->
        <div class="group-list">
            <el-table v-loading="loading" :data="groups" border style="width: 100%"
                :header-cell-style="{ background: '#f5f7fa', color: '#606266' }">
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="groupName" label="分组名称" min-width="150" />
                <el-table-column prop="groupType" label="分组类型" min-width="150" />
                <el-table-column prop="groupRegex" label="正则表达式" min-width="150" />
                <el-table-column label="测试url" min-width="250" show-overflow-tooltip>
                    <template #default="scope">
                        {{ scope.row.url ? scope.row.url : '❌' }}
                    </template>
                </el-table-column>
                <el-table-column label="间隔时间" min-width="150" show-overflow-tooltip>
                    <template #default="scope">
                        {{ scope.row.interval ? scope.row.interval : '❌' }}
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

        <!-- 添加/编辑分组对话框 -->
        <el-dialog :title="dialogType === 'add' ? '添加分组' : '编辑分组'" v-model="dialogVisible" width="500px">
            <el-form :model="groupsForm" :rules="rules" ref="groupsFormRef" label-width="100px">
                <el-form-item label="分组名称" prop="groupName">
                    <el-input v-model="groupsForm.groupName" placeholder="请输入分组名称" />
                </el-form-item>
                <el-form-item label="分组类型" prop="groupType">
                    <el-select v-model="groupsForm.groupType" placeholder="请选择分组类型" style="width: 100%"
                        :disabled="dialogType === 'edit'">
                        <el-option v-for="groupType in groupTypes" :key="groupType.value" :label="groupType.label"
                            :value="groupType.value" />
                    </el-select>
                    <span class="description">分组类型选择保存后不可以更改</span>
                </el-form-item>
                <el-form-item label="正则表达式" prop="groupRegex">
                    <el-input v-model="groupsForm.groupRegex" type="textarea" placeholder="请输入正则表达式 为空则获取所有" />
                </el-form-item>
                <el-form-item label="测试URL" prop="url" v-if='groupsForm.groupType != "select"'>
                    <el-input v-model="groupsForm.url" type="textarea" placeholder="请输入测试URL" />
                </el-form-item>
                <el-form-item label="间隔时间" prop="interval" v-if='groupsForm.groupType != "select"'>
                    <el-input v-model="groupsForm.interval" type="textarea" placeholder="请输入测试间隔时间 单位:秒" />
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
import { groupApi } from '@/utils/request';

export default {
    name: 'GroupView',
    setup() {
        // 数据列表
        const groups = ref([]);
        const loading = ref(false);

        // 表单相关
        const groupsFormRef = ref(null);
        const dialogVisible = ref(false);
        const dialogType = ref('add'); // 'add' 或 'edit'
        const submitLoading = ref(false);
        const currentId = ref(null);

        const groupTypes = [
            { label: 'select 节点选择', value: 'select' },
            { label: 'url-test 自动选择', value: 'url-test' },
            { label: 'fallback 故障转移', value: 'fallback' }
        ];

        const groupsForm = reactive({
            groupName: '',
            groupType: '',
            groupRegex: '',
            url: '',
            interval: ''
        });

        const rules = {
            interval: [
                { required: true, message: '请输入测试地址测试间隔时间,但是为秒', trigger: 'blur' },
                { type: 'int', message: '请输入正确的测试地址测试间隔时间', trigger: 'blur' }
            ],
            url: [
                { required: true, message: '请输入测试地址', trigger: 'blur' },
                { type: 'url', message: '请输入正确的URL测试地址', trigger: 'blur' }
            ],
            groupRegex: [
                {
                    validator: (rule, value, callback) => {
                        if (value) {
                            try {
                                new RegExp(value);
                                callback();
                            } catch (e) {
                                callback(new Error('请输入有效的正则表达式'));
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur'
                }
            ]
        };

        // 获取所有分组数据
        const fetchGroups = async () => {
            loading.value = true;
            try {
                const res = await groupApi.getAllGroups();
                groups.value = res.data;
            } catch (error) {
                ElMessage.error('获取分组列表失败');
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
            Object.keys(groupsForm).forEach(key => {
                if (key in row) {
                    groupsForm[key] = row[key];
                }
            });
            dialogVisible.value = true;
        };

        // 删除分组
        const handleDelete = (row) => {
            ElMessageBox.confirm(
                `确定要删除分组 "${row.groupName}" 吗？`,
                '警告',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                }
            )
                .then(async () => {
                    try {
                        await groupApi.deleteGroup(row.id);
                        ElMessage.success('删除成功');
                        fetchGroups();
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
            if (groupsFormRef.value) {
                groupsFormRef.value.resetFields();
            }

            groupsForm.groupName = '';
            groupsForm.groupType = 'select';
            groupsForm.url = '';
            groupsForm.interval = null;
            currentId.value = null;
        };

        // 提交表单
        const submitForm = async () => {
            if (!groupsFormRef.value) return;
            // 检查名称是否重复
            const isDuplicateName = groups.value.some(group =>
                group.groupName === groupsForm.groupName && group.id !== currentId.value
            );

            if (isDuplicateName) {
                ElMessage.error('分组名称已存在，请输入不同的名称');
                return;
            }
            await groupsFormRef.value.validate(async (valid) => {
                if (!valid) return;

                submitLoading.value = true;
                if (groupsForm.groupType === 'select') {
                    groupsForm.url = null;
                    groupsForm.interval = null;
                }
                try {
                    if (dialogType.value === 'add') {
                        await groupApi.createGroup(groupsForm);
                        ElMessage.success('添加成功');
                    } else {
                        groupsForm.id = currentId.value;
                        await groupApi.updateGroup(groupsForm);
                        ElMessage.success('更新成功');
                    }

                    dialogVisible.value = false;
                    fetchGroups();
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
            fetchGroups();
        });

        return {
            groups,
            loading,
            dialogVisible,
            dialogType,
            groupsForm,
            groupsFormRef,
            rules,
            groupTypes,
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
.group-container {
    width: 1200px;
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.group-header h1 {
    font-size: 24px;
    color: #303133;
    margin: 0;
}

.group-list {
    margin-top: 20px;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
}

/* 新增样式 */
.description {
    display: block;
    margin-top: 5px;
    font-size: 12px;
    color: #909399;
}
</style>