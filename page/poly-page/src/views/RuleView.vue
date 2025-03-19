<template>
    <div class="rule-container">
        <div class="rule-header">
            <h1>规则管理</h1>
            <div class="header-actions">
                <el-button type="primary" @click="showAddDialog">添加规则</el-button>
                <el-button type="danger" @click="deleteAll">清除所有规则</el-button>
                <el-button type="primary" @click="showImportDialog">导入规则</el-button>
            </div>
        </div>

        <div class="rule-desc">
            <!-- 页面描述介绍 -->
            <pre>描述: {{ tabDesc }}</pre>
        </div>

        <!-- 规则类型选择 -->
        <div class="rule-tabs">
            <el-tabs v-model="activeRuleType" @tab-click="handleTabClick">
                <el-tab-pane label="全部规则" name="ALL"></el-tab-pane>
                <el-tab-pane v-for="type in ruleTypes" :key="type.value" :label="type.label" :name="type.value">
                </el-tab-pane>
            </el-tabs>
        </div>

        <!-- 新增搜索和分页 -->
        <div class="list-controls">
            <div class="search-box">
                <el-input v-model="searchKeyword" placeholder="输入关键词搜索" clearable @clear="handleSearch"
                    @keyup.enter="handleSearch" style="width: 300px">
                    <template #append>
                        <el-button @click="handleSearch">搜索 </el-button>
                    </template>
                </el-input>
            </div>

            <el-pagination v-model:current-page="currentPage" :page-sizes="[10, 20, 50, 100]" :page-size="pageSize"
                layout="total, sizes, prev, pager, next" :total="total" @size-change="handleSizeChange"
                @current-change="handleCurrentChange" class="pagination" />
        </div>

        <!-- 规则列表 -->
        <div class="rule-list">
            <el-table v-loading="loading" :data="rules" border style="width: 100%"
                :header-cell-style="{ background: '#f5f7fa', color: '#606266' }" :max-height="tableMaxHeight">
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="ruleType" label="规则类型" width="200" />
                <el-table-column label="规则参数" min-width="150" show-overflow-tooltip >
                    <template #default="scope">
                        {{ scope.row.ruleType === 'MATCH' ? '❌' : scope.row.ruleParam }}
                    </template>              
                </el-table-column>
                <el-table-column label="配置" min-width="150" show-overflow-tooltip>
                    <template #default="scope">
                        {{ getGroupName(scope.row.ruleConfig) }}
                    </template>
                </el-table-column>
                <el-table-column label="解析DNS" width="100" v-if="showResolveDnsColumn">
                    <template #default="scope">
                        <el-tag
                            :type="scope.row.resolveDns ? (scope.row.resolveDns === '1' ? 'success' : 'info') : 'danger'">
                            {{ scope.row.resolveDns ? (scope.row.resolveDns === '1' ? '是' : '否') : '❌' }}
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

        <!-- 添加/编辑规则对话框 -->
        <el-dialog :title="dialogType === 'add' ? '添加规则' : '编辑规则'" v-model="dialogVisible" width="500px"
            :fullscreen="isMobile">
            <el-form :model="ruleForm" :rules="formRules" ref="ruleFormRef" label-width="100px">
                <el-form-item label="规则类型" prop="ruleType">
                    <el-select v-model="ruleForm.ruleType" placeholder="请选择规则类型" style="width: 100%">
                        <el-option v-for="type in ruleTypes" :key="type.value" :label="type.label"
                            :value="type.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="规则参数" prop="ruleParam" v-if="ruleForm.ruleType !== 'MATCH'">
                    <el-input v-model="ruleForm.ruleParam" placeholder="请输入规则参数" />
                    <div class="param-hint" v-if="paramHint">{{ paramHint }}</div>
                </el-form-item>
                <el-form-item label="配置" prop="ruleConfig">
                    <!-- 修改为下拉框 -->
                    <el-select v-model="ruleForm.ruleConfig" placeholder="请选择配置" style="width: 100%">
                        <el-option v-for="option in groupOptions" :key="option.value" :label="option.label"
                            :value="option.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="解析DNS" v-if="showResolveDnsForm">
                    <el-switch v-model="ruleForm.resolveDns" active-text="是" inactive-text="否" :active-value="'1'"
                        :inactive-value="'0'" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitForm" :loading="submitLoading">确认</el-button>
                </span>
            </template>
        </el-dialog>

        <el-dialog title="导入规则" v-model="importDialogVisible" width="600px" :fullscreen="isMobile" :loading="importLoading">
            <div class="import-desc">
                <pre>此导入功能是 获取你输入的订阅地址里的规则,然后入库到本站</pre>
            </div>

            <el-input v-model="importContent" type="textarea"
                placeholder="请输入你觉得好用的订阅地址" clearable autofocus 
                />

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="importDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="handleImport" :loading="importLoading">导入</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import { ref, reactive, onMounted, computed, onBeforeUnmount } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ruleApi, groupApi } from '@/utils/request';

export default {
    name: 'RuleView',
    setup() {
        // 数据列表
        const rules = ref([]);
        const loading = ref(false);
        const activeRuleType = ref('ALL');
        const tableMaxHeight = ref(window.innerHeight - 250);
        const isMobile = ref(window.innerWidth <= 768);
        const tabDesc = ref('');
        // 存储配置数据
        const groupOptions = ref([]);
        const importDialogVisible = ref(false);
        const importContent = ref('');
        // 新增分页和搜索相关变量
        const currentPage = ref(1);
        const pageSize = ref(10);
        const total = ref(0);
        const searchKeyword = ref('');
        const importLoading = ref(false);

        // 规则类型定义
        const ruleTypes = [
            { label: '域名', value: 'DOMAIN', hint: '例如: www.google.com', desc: '将指定关键字的域名 流量路由到 指定的分组\n例如DOMAIN,www.google.com,DIRECT 将 www.google.com 路由到 DIRECT.' },
            { label: '域名后缀', value: 'DOMAIN-SUFFIX', hint: '例如: youtube.com', desc: '将匹配域名后缀关键字的域名 流量路由到 指定的分组\n例如DOMAIN-SUFFIX,youtube.com,DIRECT 将任何以 youtube.com 结尾域名都路由到 DIRECT.如www.youtube.com 和 foo.bar.youtube.com 都将路由到 DIRECT.' },
            { label: '域名关键字', value: 'DOMAIN-KEYWORD', hint: '例如: google', desc: '将任何包含关键字的域名 流量路由到 指定的分组\n例如DOMAIN-KEYWORD,google,DIRECT 在这种情况下, www.google.com 或 googleapis.com 都将路由到 DIRECT.' },
            { label: 'IP地理位置', value: 'GEOIP', hint: '例如: CN (国家代码)', desc: '用于根据数据包的目标 IP 地址的国家代码路由数据包. Clash 使用 MaxMind GeoLite2 数据库来实现这一功能.\n例如 GEOIP,CN,DIRECT 将任何目标 IP 地址为中国的数据包路由到 DIRECT.' },
            { label: 'IPv4地址段', value: 'IP-CIDR', hint: '例如: 127.0.0.0/8', desc: '用于根据数据包的目标 IPv4 地址路由数据包.\n例如 IP-CIDR,127.0.0.0/8,DIRECT 将任何目标 IP 地址为 127.0.0.0/8 的数据包路由到 DIRECT.' },
            { label: 'IPv6地址段', value: 'IP-CIDR6', hint: '例如: 2620:0:2d0:200::7/32', desc: '用于根据数据包的目标 IPv6 地址路由数据包.\n例如 P-CIDR6,2620:0:2d0:200::7/32,DIRECT 将任何目标 IP 地址为 2620:0:2d0:200::7/32 的数据包路由到 DIRECT.' },
            { label: '源IP段地址', value: 'SRC-IP-CIDR', hint: '例如: 192.168.1.201/32', desc: '用于根据数据包的源 IPv4 地址路由数据包.\n例如 SRC-IP-CIDR,192.168.1.201/32,DIRECT 将任何源 IP 地址为 192.168.1.201/32 的数据包路由到 DIRECT' },
            { label: '源端口', value: 'SRC-PORT', hint: '例如: 80', desc: '用于根据数据包的源端口路由数据包.\n例如 SRC-PORT,80,DIRECT 将任何源端口为 80 的数据包路由到 DIRECT' },
            { label: '目标端口', value: 'DST-PORT', hint: '例如: 80', desc: '用于根据数据包的目标端口路由数据包.\n例如 DST-PORT,80,DIRECT 将任何目标端口为 80 的数据包路由到 DIRECT' },
            { label: '源进程名', value: 'PROCESS-NAME', hint: '例如: nc', desc: '用于根据数据包的源进程名路由数据包.\n例如 PROCESS-NAME,nc,DIRECT 将任何源进程名为 nc 的数据包路由到 DIRECT' },
            { label: '源进程路径', value: 'PROCESS-PATH', hint: '例如: /usr/local/bin/nc', desc: '用于根据数据包的源进程路径路由数据包.\n例如 PROCESS-PATH,/usr/local/bin/nc,DIRECT 将任何源进程路径为 /usr/local/bin/nc 的数据包路由到 DIRECT' },
            { label: '漏网之鱼', value: 'MATCH', hint: '', desc: '用于将剩余未匹配到的流量包路由到指定分组 MATCH规则只允许存在一个' },
        ];

        // 表单相关
        const ruleFormRef = ref(null);
        const dialogVisible = ref(false);
        const dialogType = ref('add'); // 'add' 或 'edit'
        const submitLoading = ref(false);
        const currentId = ref(null);
        const showTypes = ['GEOIP', 'IP-CIDR', 'IP-CIDR6'];

        const ruleForm = reactive({
            ruleType: 'DOMAIN',
            ruleParam: '',
            ruleConfig: '',
            resolveDns: '0'
        });

        const formRules = {
            ruleType: [
                { required: true, message: '请选择规则类型', trigger: 'change' }
            ],
            ruleParam: [
                { required: true, message: '请输入规则参数', trigger: 'blur', validator: (rule, value, callback) => {
                    if (ruleForm.ruleType === 'MATCH' || value) {
                        callback();
                    } else {
                        callback(new Error('请输入规则参数'));
                    }
                }}
            ],
            ruleConfig: [
                { required: true, message: '请输入配置值', trigger: 'blur' }
            ]
        };

        // 计算属性：参数提示
        const paramHint = computed(() => {
            const selectedType = ruleTypes.find(type => type.value === ruleForm.ruleType);
            return selectedType ? selectedType.hint : '';
        });

        // 计算属性：是否可以切换DNS解析选项
        const canToggleResolve = computed(() => {
            const noResolveTypes = ['SRC-PORT', 'DST-PORT', 'PROCESS-NAME', 'PROCESS-PATH', 'SRC-IP-CIDR'];
            return !noResolveTypes.includes(ruleForm.ruleType);
        });

        // 计算属性：是否显示解析DNS列
        const showResolveDnsColumn = computed(() => {
            // 如果当前选中的是ALL，则显示列
            if (activeRuleType.value === 'ALL') return true;

            // 否则根据当前选中的规则类型决定
            const showTypes = ['GEOIP', 'IP-CIDR', 'IP-CIDR6'];
            return showTypes.includes(activeRuleType.value);
        });

        // 获取规则数据
        const fetchRules = async () => {
            tabDesc.value = ruleTypes.find((item) => item.value === activeRuleType.value)?.desc;
            loading.value = true;
            try {
                const res = await ruleApi.getRulesPage(activeRuleType.value, currentPage.value, pageSize.value, searchKeyword.value);
                rules.value = res.data.results;
                total.value = res.data.count;
            } catch (error) {
                ElMessage.error('获取规则列表失败');
                console.error(error);
            } finally {
                loading.value = false;
            }
        };

        // 新增分页和搜索处理方法
        const handleSizeChange = (newSize) => {
            pageSize.value = newSize;
            fetchRules();
        };

        const handleCurrentChange = (newPage) => {
            currentPage.value = newPage;
            fetchRules();
        };

        const handleSearch = () => {
            currentPage.value = 1;
            fetchRules();
        };

        // 获取组数据
        const fetchGroupOptions = async () => {
            try {
                const res = await groupApi.getGroupType("select");
                groupOptions.value = res.data.map(group => ({
                    label: group.groupName,
                    value: group.id
                }));
                groupOptions.value.unshift({ label: 'DIRECT', value: -1 }, { label: 'REJECT', value: -2 });
            } catch (error) {
                ElMessage.error('获取组数据失败');
                console.error(error);
            }
        };
        // 获取组名
        const getGroupName = (id) => {
            const group = groupOptions.value.find(option => option.value === id);
            return group ? group.label : id;
        };

        // Tab切换处理
        const handleTabClick = () => {
            fetchRules();
        };

        // 计算属性：是否显示解析DNS表单项
        const showResolveDnsForm = computed(() => {
            return showTypes.includes(ruleForm.ruleType);
        });

        // 显示添加对话框
        const showAddDialog = () => {
            dialogType.value = 'add';
            resetForm();
            if (activeRuleType.value !== 'ALL') {
                ruleForm.ruleType = activeRuleType.value;
            }
            dialogVisible.value = true;
        };

        const deleteAll = () => {
            ElMessageBox.confirm(
                `确定要删除所有规则吗？`,
                '警告',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                }
            )
                .then(async () => {
                    try {
                        await ruleApi.deleteAll();
                        ElMessage.success('删除成功');
                        fetchGroupOptions();
                        fetchRules();
                    } catch (error) {
                        ElMessage.error('删除失败');
                        console.error(error);
                    }
                })
                .catch(() => {
                    ElMessage.info('已取消删除');
                });
        };

        const showImportDialog = () => {
            importDialogVisible.value = true;
        };

        const handleImport = async () => {
            importLoading.value = true;
            try {
                // await new Promise(resolve => setTimeout(resolve, 1000));
                const response = await ruleApi.importRules({ url: importContent.value });
                const text = `本次导入成功规则${response.data.num}条,新增分组 ${Object.keys(response.data.newGroup).join(',')} `
                ElMessage.success(text);
                importDialogVisible.value = false;
                importContent.value = '';
                fetchGroupOptions();
                fetchRules();
            } catch (error) {
                ElMessage.error('导入失败: ' + error.message);
            } finally {
                importLoading.value = false;
            }
        };

        // 显示编辑对话框
        const handleEdit = async (row) => {
            dialogType.value = 'edit';
            currentId.value = row.id;

            try {
                // 获取详细信息
                const ruleDetailApi = await ruleApi.getRuleById(row.id);
                const ruleDetail = ruleDetailApi.data;

                // 填充表单
                Object.keys(ruleForm).forEach(key => {
                    if (key in ruleDetail) {
                        if (key === 'resolveDns') {
                            // 确保 resolveDns 是字符串类型
                            ruleForm[key] = ruleDetail[key] ? String(ruleDetail[key]) : '0';
                        } else {
                            ruleForm[key] = ruleDetail[key];
                        }
                    }
                });
                console.log("ruleForm");
                console.log(ruleForm);
                // 修改：将ruleConfig设置为对应的groupName
                const group = groupOptions.value.find(option => option.value === ruleForm.ruleConfig);
                ruleForm.ruleConfig = group ? group.value : ruleForm.ruleConfig;

                // ruleForm.resolveDns = String(ruleForm.resolveDns);
                dialogVisible.value = true;
            } catch (error) {
                ElMessage.error('获取规则详情失败');
                console.error(error);
            }
        };

        // 删除规则
        const handleDelete = (row) => {
            ElMessageBox.confirm(
                `确定要删除规则 "${row.ruleParam}" 吗？`,
                '警告',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                }
            )
                .then(async () => {
                    try {
                        await ruleApi.deleteRule(row.id);
                        ElMessage.success('删除成功');
                        fetchRules();
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
            if (ruleFormRef.value) {
                ruleFormRef.value.resetFields();
            }

            ruleForm.ruleType = 'DOMAIN';
            ruleForm.ruleParam = '';
            ruleForm.ruleConfig = '';
            ruleForm.resolveDns = '0';
            currentId.value = null;
        };

        // 提交表单
        const submitForm = async () => {
            if (!ruleFormRef.value) return;

            await ruleFormRef.value.validate(async (valid) => {
                if (!valid) return;

                submitLoading.value = true;
                if (ruleForm.ruleType === 'MATCH') {
                    ruleForm.ruleParam = null;
                }
                // const showTypes = ['GEOIP', 'IP-CIDR', 'IP-CIDR6'];
                if (!showTypes.includes(ruleForm.ruleType)) {
                    ruleForm.resolveDns = null;
                }
                try {
                    if (dialogType.value === 'add') {
                        const resp = await ruleApi.createRule(ruleForm);
                        if (resp.code !== 200) {
                            ElMessage.warning(resp.message);
                        } else {
                            ElMessage.success('添加成功');
                        }
                    } else {
                        ruleForm.id = currentId.value;
                        await ruleApi.updateRule(ruleForm);
                        ElMessage.success('更新成功');
                    }

                    dialogVisible.value = false;
                    fetchRules();
                } catch (error) {
                    ElMessage.error(dialogType.value === 'add' ? '添加失败' : '更新失败');
                    console.error(error);
                } finally {
                    submitLoading.value = false;
                }
            });
        };

        // 响应式处理
        const handleResize = () => {
            tableMaxHeight.value = window.innerHeight - 250;
            isMobile.value = window.innerWidth <= 768;
        };

        // 页面加载时获取数据
        onMounted(() => {
            fetchGroupOptions();
            fetchRules();
            window.addEventListener('resize', handleResize);
        });

        onBeforeUnmount(() => {
            window.removeEventListener('resize', handleResize);
        });

        return {
            rules,
            loading,
            importLoading,
            activeRuleType,
            ruleTypes,
            dialogVisible,
            dialogType,
            ruleForm,
            ruleFormRef,
            formRules,
            submitLoading,
            tableMaxHeight,
            isMobile,
            paramHint,
            canToggleResolve,
            showAddDialog,
            deleteAll,
            showImportDialog,
            handleEdit,
            handleDelete,
            submitForm,
            handleTabClick,
            tabDesc,
            showResolveDnsForm,
            showResolveDnsColumn,
            groupOptions,
            getGroupName,
            importDialogVisible,
            handleImport,
            importContent,
            currentPage,
            pageSize,
            total,
            searchKeyword,
            handleSizeChange,
            handleCurrentChange,
            handleSearch
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

.rule-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.import-desc {
    margin-bottom: 15px;

    pre {
        background: #f5f7fa;
        padding: 10px;
        border-radius: 4px;
        margin: 5px 0;
    }
}

.rule-desc {
    font-size: 14px;
    color: #909399;
    word-wrap: break-word;
    /* 自动换行 */
    overflow: hidden;
    /* 隐藏溢出内容 */
    text-overflow: ellipsis;
    /* 使用省略号表示溢出 */
}

.rule-header h1 {
    font-size: 24px;
    color: #303133;
    margin: 0;
}

.rule-tabs {
    margin-bottom: 20px;
}

.rule-tabs :deep(.el-tabs__item) {
    padding: 0 15px;
}

.rule-list {
    margin-top: 20px;
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

.list-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 15px 0;
}

.search-box {
    display: flex;
    gap: 10px;
}

.pagination {
    margin: 0;
}


/* 移动端适配 */
@media screen and (max-width: 768px) {
    .rule-container {
        width: 100%;
        padding: 10px;
        border-radius: 0;
        box-shadow: none;
    }

    .rule-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .rule-header h1 {
        margin-bottom: 10px;
    }

    .rule-tabs :deep(.el-tabs__nav) {
        width: 100%;
        overflow-x: auto;
    }

    .list-controls {
        flex-direction: column;
        gap: 10px;
    }

    .search-box {
        width: 100%;
    }

    .pagination {
        width: 100%;
        justify-content: center;
    }
}
</style>