<template>
    <div class="rule-container">
        <a-form :model="formState" name="configForm" @finish="onFinish" layout="vertical">
            <!-- 基础配置部分 -->
            <a-row :gutter="24">
                <a-col :span="8">
                    <a-form-item label="Mixed Port" name="mixed-port">
                        <a-input-number v-model:value="formState['mixed-port']" :min="1" :max="65535" />
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item label="Allow LAN" name="allow-lan">
                        <a-switch v-model:checked="formState['allow-lan']" />
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item label="Bind Address" name="bind-address">
                        <a-input v-model:value="formState['bind-address']" />
                    </a-form-item>
                </a-col>
            </a-row>

            <a-row :gutter="24">
                <a-col :span="8">
                    <a-form-item label="Mode" name="mode">
                        <a-select v-model:value="formState.mode">
                            <a-select-option value="rule">Rule</a-select-option>
                            <a-select-option value="global">Global</a-select-option>
                            <a-select-option value="direct">Direct</a-select-option>
                        </a-select>
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item label="Log Level" name="log-level">
                        <a-select v-model:value="formState['log-level']">
                            <a-select-option value="info">Info</a-select-option>
                            <a-select-option value="warning">Warning</a-select-option>
                            <a-select-option value="error">Error</a-select-option>
                            <a-select-option value="debug">Debug</a-select-option>
                        </a-select>
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item label="External Controller" name="external-controller">
                        <a-input v-model:value="formState['external-controller']" />
                    </a-form-item>
                </a-col>
            </a-row>

            <a-row :gutter="24">
                <a-col :span="8">
                    <a-form-item label="Unified Delay" name="unified-delay">
                        <a-switch v-model:checked="formState['unified-delay']" />
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item label="TCP Concurrent" name="tcp-concurrent">
                        <a-switch v-model:checked="formState['tcp-concurrent']" />
                    </a-form-item>
                </a-col>
            </a-row>

            <a-divider>DNS 配置</a-divider>

            <!-- DNS 配置部分 -->
            <a-form-item name="dns">
                <a-card>
                    <a-row :gutter="24">
                        <a-col :span="8">
                            <a-form-item label="Enable DNS" name="['dns', 'enable']">
                                <a-switch v-model:checked="formState.dns.enable" />
                            </a-form-item>
                        </a-col>
                        <a-col :span="8">
                            <a-form-item label="IPv6" name="['dns', 'ipv6']">
                                <a-switch v-model:checked="formState.dns.ipv6" />
                            </a-form-item>
                        </a-col>
                        <a-col :span="8">
                            <a-form-item label="Use Hosts" name="['dns', 'use-hosts']">
                                <a-switch v-model:checked="formState.dns['use-hosts']" />
                            </a-form-item>
                        </a-col>
                    </a-row>

                    <a-row :gutter="24">
                        <a-col :span="12">
                            <a-form-item label="Enhanced Mode" name="['dns', 'enhanced-mode']">
                                <a-select v-model:value="formState.dns['enhanced-mode']">
                                    <a-select-option value="fake-ip">Fake-IP</a-select-option>
                                    <a-select-option value="redir-host">Redir-Host</a-select-option>
                                </a-select>
                            </a-form-item>
                        </a-col>
                        <a-col :span="12">
                            <a-form-item label="Fake-IP Range" name="['dns', 'fake-ip-range']">
                                <a-input v-model:value="formState.dns['fake-ip-range']" />
                            </a-form-item>
                        </a-col>
                    </a-row>

                    <a-form-item label="Default Nameservers" name="['dns', 'default-nameserver']">
                        <a-select v-model:value="formState.dns['default-nameserver']" mode="tags" style="width: 100%" />
                    </a-form-item>

                    <a-form-item label="Nameservers" name="['dns', 'nameserver']">
                        <a-select v-model:value="formState.dns.nameserver" mode="tags" style="width: 100%" />
                    </a-form-item>

                    <a-form-item label="Fallback" name="['dns', 'fallback']">
                        <a-select v-model:value="formState.dns.fallback" mode="tags" style="width: 100%" />
                    </a-form-item>
                </a-card>
            </a-form-item>

            <a-form-item>
                <a-space>
                    <a-button type="primary" html-type="submit">保存配置</a-button>
                    <a-button danger @click="handleReset">重置配置</a-button>
                </a-space>
            </a-form-item>
        </a-form>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { configApi } from '@/utils/request';

const formState = ref({
    'mixed-port': 7890,
    'allow-lan': false,
    'bind-address': '*',
    mode: 'rule',
    'log-level': 'info',
    'external-controller': '127.0.0.1:9090',
    'unified-delay': true,
    'tcp-concurrent': true,
    dns: {
        enable: true,
        ipv6: false,
        'default-nameserver': ['223.5.5.5', '119.29.29.29'],
        'enhanced-mode': 'fake-ip',
        'fake-ip-range': '198.18.0.1/16',
        'use-hosts': true,
        nameserver: ['https://dns.alidns.com/dns-query', 'https://doh.pub/dns-query'],
        fallback: ['https://dns.alidns.com/dns-query', 'https://doh.pub/dns-query'],
        'fallback-filter': {
            geoip: true,
            ipcidr: ['240.0.0.0/4', '0.0.0.0/32']
        }
    }
});

const fetchConfig = async () => {
    try {
        const response = await configApi.getConfig();
        formState.value = response.data;
    } catch (error) {
        message.error('获取配置失败');
    }
};

const onFinish = async (values) => {
    try {
        await configApi.updateConfig(values);
        message.success('配置更新成功');
    } catch (error) {
        message.error('配置更新失败');
    }
};

const handleReset = async () => {
    try {
        await configApi.resetConfig();
        await fetchConfig();
        message.success('配置重置成功');
    } catch (error) {
        message.error('配置重置失败');
    }
};

onMounted(() => {
    fetchConfig();
});
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

:deep(.ant-form-item-label > label) {
    font-weight: 500;
    color: #262626;
}

:deep(.ant-card) {
    border-radius: 8px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
}

:deep(.ant-input),
:deep(.ant-input-number),
:deep(.ant-select-selector) {
    border-radius: 6px;
}

:deep(.ant-input:hover),
:deep(.ant-input-number:hover),
:deep(.ant-select-selector:hover) {
    border-color: #4096ff;
}

:deep(.ant-divider) {
    margin: 16px 0;
    color: #262626;
    font-weight: 500;
    font-size: 16px;
}

:deep(.ant-btn) {
    height: 40px;
    padding: 0 24px;
    border-radius: 6px;
    font-weight: 500;
}

:deep(.ant-switch) {
    background: rgba(0, 0, 0, 0.25);
}

:deep(.ant-switch-checked) {
    background: #1890ff;
}

:deep(.ant-card-body) {
    padding: 16px;
}

:deep(.ant-form-item) {
    margin-bottom: 16px;
}

:deep(.ant-select-multiple .ant-select-selection-item) {
    background: #e6f4ff;
    border-color: #91caff;
    color: #1890ff;
}

:deep(.ant-row) {
    margin-bottom: -8px !important;
}

@media (max-width: 768px) {
    .rule-container {
        width: 100%;
        padding: 10px;
        border-radius: 0;
        box-shadow: none;
    }
}
</style>