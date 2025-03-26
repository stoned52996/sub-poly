import ruleRepository from "../db/ruleRepository.js";
import groupRepository from "../db/groupRepository.js";
import yaml from 'js-yaml';
import axios from 'axios';

export default {
  // 获取所有规则
  async getAllRules(env) {
    const rules = await ruleRepository.getAllRules(env);

    // 这里可以做更多的业务处理，比如字段转换等
    return rules.results.map(rule => ({
      id: rule.id,
      ruleType: rule.rule_type,
      ruleParam: rule.rule_param,
      ruleConfig: rule.rule_config,
      resolveDns: rule.resolve_dns,
      createdAt: rule.created_at
    }));
  },

  async getRulesPage(env, type, pageNum, pageSize, keyWord) {
    const count = await ruleRepository.getRulesCount(env, type, keyWord);
    console.log("count: " + count.total);
    const rules = await ruleRepository.getRulesPage(env, type, pageNum, pageSize, keyWord);
    const rulesDeal =  rules.results.map(rule => ({
      id: rule.id,
      ruleType: rule.rule_type,
      ruleParam: rule.rule_param,
      ruleConfig: rule.rule_config,
      resolveDns: rule.resolve_dns,
      createdAt: rule.created_at
    }));
    return {
      count: count.results[0].total,
      results: rulesDeal
    };
  },

  // 根据type查询所有
  async getAllRulesByType(env, type) {
    const rules = await ruleRepository.getAllRulesByType(env, type);
    return rules.results.map(rule => ({
      id: rule.id,
      ruleType: rule.rule_type,
      ruleParam: rule.rule_param,
      ruleConfig: rule.rule_config,
      resolveDns: rule.resolve_dns,
      createdAt: rule.created_at
    }));
  },

  // 根据ID获取规则
  async getRuleById(env, id) {
    const rule = await ruleRepository.getRuleById(env, id);

    if (!rule) return null;

    return {
      id: rule.id,
      ruleType: rule.rule_type,
      ruleParam: rule.rule_param,
      ruleConfig: rule.rule_config,
      resolveDns: rule.resolve_dns,
      createdAt: rule.created_at
    };
  },

  // 创建规则
  async createRule(env, { ruleType, ruleParam, ruleConfig, resolveDns }) {
    if (ruleType === 'MATCH') {
      const rules = await ruleRepository.getAllRulesByType(env, 'MATCH');
      if (rules.results.length > 0) {
        console.log("已经存在MATCH规则");
        return null;
      }
    }
    const result = await ruleRepository.createRule(env, { ruleType, ruleParam, ruleConfig, resolveDns });
    return result;
  },

  // 更新规则
  async updateRule(env, { id, ruleType, ruleParam, ruleConfig, resolveDns }) {
    const result = await ruleRepository.updateRule(env, { id, ruleType, ruleParam, ruleConfig, resolveDns });
    return result;
  },

  // 导入规则
  async importRule(env, url) {
    const yml = await this.getYmlFromUrl(url);
    const groups = yml['proxy-groups'];
    const groupInDb = {}
    // 获取所有的分组
    for (const group of groups) {
      if (group.type === 'select') {
        const single = await groupRepository.addGroup(env, group.name, group.type, null, null, null)
        groupInDb[group.name] = single
      }
    }
    const rules = yml['rules'];
    const rulesList = [];
    for (const ruleSingle of rules) {
      // 通过, 分割
      const ruleStr = ruleSingle.split(',');
      let configId;
      if (ruleStr.length === 2) {
        configId = groupInDb[ruleStr[1]]["id"];
      } else if (ruleStr[2].toUpperCase() === 'REJECT') {
        configId = -2;
      } else if (ruleStr[2].toUpperCase() === 'DIRECT') {
        configId = -1;
      } else {
        configId = groupInDb[ruleStr[2]]['id'];
      }
      const rule = {
        ruleType: ruleStr[0],
        ruleParam: ruleStr.length === 2 ? "" : ruleStr[1],
        ruleConfig: configId,
        resolveDns: ""
      }
      // 如果长度为3
      if (ruleStr.length === 4) {
        rule.resolveDns = "1";
      }
      rulesList.push(rule);
    }
    console.log("rulesList");
    console.log(rulesList.length);
    const num = await ruleRepository.createRulesBatch(env, rulesList)
    const result = {
      num: num,
      newGroup: groupInDb
    }
    return result;
  },


  async getYmlFromUrl(url) {
    // 如果以 &flag=clash结尾
    url = await this.ensureFlagInUrl(url);
    console.log("url: " + url);
    try {
      const response = await axios.get(url); // 使用await等待响应
      console.log(response.status);
      if (response.status === 200) {
        const jsonData = yaml.load(response.data);
        return jsonData;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching URL:', error);
      return null;
    }
  },

  async ensureFlagInUrl(urlString) {
    try {
      let url = new URL(urlString);
      let params = url.searchParams;
  
      // 如果已经包含 flag=clashVerge，则直接返回
      if (!params.has('flag')) {
        params.set('flag', 'clashVerge'); // 添加 flag=clashVerge
      }
  
      return url.toString(); // 返回修改后的 URL
    } catch (error) {
      console.error('Invalid URL:', error);
      return urlString; // 如果 URL 无效，返回原始字符串
    }
  },

  // 删除规则
  async deleteRule(env, id) {
    const result = await ruleRepository.deleteRule(env, id);
    return result;
  },
  async deleteAll(env) {
    const result = await ruleRepository.deleteAll(env);
    return result;
  },
};
