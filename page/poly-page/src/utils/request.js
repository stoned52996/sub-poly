import axios from 'axios';
import { ElMessageBox } from 'element-plus';
let tokenPromise = null;
let tokenRespPromise = null;
// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  timeout: 15000
});

// 请求拦截器
service.interceptors.request.use(
  async config => {
    const token = localStorage.getItem('token');
    if (!token) {
      if (!tokenPromise) {
        tokenPromise = ElMessageBox.prompt('请输入访问秘钥', '配置访问秘钥', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /\S+/,
          inputErrorMessage: '访问秘钥不能为空'
        }).then(({ value }) => {
          localStorage.setItem('token', value);
          tokenPromise = null;
          return value;
        }).catch(err => {
          tokenPromise = null;
          return Promise.reject(new Error('用户取消输入访问秘钥'));
        });
      }
      
      try {
        const value = await tokenPromise;
        config.headers['Authorization'] = `${value}`;
      } catch (err) {
        return Promise.reject(err);
      }
    } else {
      config.headers['Authorization'] = `${token}`;
    }
    return config;
  },
  error => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  async response => {
    if (response.data.code === 401) {
      if (!tokenRespPromise) {
        tokenRespPromise = ElMessageBox.prompt('访问秘钥无效，请重新输入', '配置访问秘钥', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /\S+/,
          inputErrorMessage: '访问秘钥不能为空'
        }).then(({ value }) => {
          localStorage.setItem('token', value);
          tokenRespPromise = null;
          return value;
        }).catch(err => {
          tokenRespPromise = null;
          return Promise.reject(new Error('用户取消输入访问秘钥'));
        });
      }
      
      try {
        const newToken = await tokenRespPromise;
        // 使用新的token重新发起请求
        const config = response.config;
        config.headers['Authorization'] = newToken;
        return service(config).then(res => res);
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return response.data;
  },
  error => {
    console.error('响应错误:', error);
    return Promise.reject(error);
  }
);

// 机场相关接口
export const airportApi = {
  // 获取所有机场
  getAirports() {
    return service.get('/airports/all');
  },

  // 获取单个机场
  getAirport(id) {
    return service.get(`/airports/single?id=${id}`);
  },

  // 创建机场
  createAirport(data) {
    return service.post('/airports/add', data);
  },

  // 更新机场
  updateAirport(data) {
    return service.post(`/airports/update`, data);
  },

  // 删除机场
  deleteAirport(id) {
    return service.get(`/airports/del?id=${id}`);
  }
};

// 规则相关API
export const ruleApi = {
  // 获取所有规则
  getRules() {
    return service.get('/rules/all');
  },

  // 根据类型获取规则
  getRulesByType(type) {
    return service.get(`/rules/type?type=${type}`);
  },
  getRulesPage(type, pageNum, pageSize, keyWord) {
    return service.get(`/rules/page?type=${type}&pageNum=${pageNum}&pageSize=${pageSize}&keyWord=${keyWord}`);
  },

  // 获取规则详情
  getRuleById(id) {
    return service.get(`/rules/single?id=${id}`);
  },

  // 创建规则
  createRule(data) {
    return service.post('/rules/add', data);
  },

  // 更新规则
  updateRule(data) {
    return service.post(`/rules/update`, data);
  },

  // 删除规则
  deleteRule(id) {
    return service.get(`/rules/del?id=${id}`);
  },

  // 删除所有规则
  deleteAll() {
    return service.get(`/rules/deleteAll`);
  },

  // 导入规则
  importRules(data) {
    return service.post('/rules/import', data);
  }
};

// 分组相关接口
export const groupApi = {
  // 获取所有分组
  getAllGroups() {
    return service.get('/group/all');
  },

  // 获取类型分组
  getGroupType(type) {
    return service.get(`/group/type?type=${type}`);
  },

  // 获取单个分组
  getGroupSingle(id) {
    return service.get(`/group/single?id=${id}`);
  },

  // 创建分组
  createGroup(data) {
    return service.post('/group/add', data);
  },

  // 更新分组
  updateGroup(data) {
    return service.post(`/group/update`, data);
  },

  // 删除分组
  deleteGroup(id) {
    return service.get(`/group/del?id=${id}`);
  }

};

// 规则相关API
export const subApi = {
  // 获取所有规则
  getSub() {
    return service.get('/sub');
  },
  generateSub() {
    return service.get('/sub/generate');
  },
};

// 规则相关API
export const configApi = {
  // 获取所有规则
  getConfig() {
    return service.get('/config');
  },
  resetConfig() {
    return service.get('/config/reset');
  },
  updateConfig(data) {
    return service.post('/config/update', data);
  },
};

export const userApi = {
  // 获取所有规则
  reset(data) {
    return service.post(`/user/reset`, data);
  }
};

export const selfNodeApi = {
  // 获取所有自建节点
  getAllNodes() {
    return service.get('/selfNode/all');
  },

  // 获取单个节点
  getNodeSingle(id) {
    return service.get(`/selfNode/single?id=${id}`);
  },

  // 创建节点
  createNode(data) {
    return service.post('/selfNode/add', data);
  },

  // 更新节点
  updateNode(data) {
    return service.post(`/selfNode/update`, data);
  },

  // 删除节点
  deleteNode(id) {
    return service.get(`/selfNode/del?id=${id}`);
  }
};

export default service;