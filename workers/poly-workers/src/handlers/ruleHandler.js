import ruleService from "../services/ruleService.js";
import ResponseUtil from '../utils/ResponseUtil.js';

export default {
  // 获取所有规则
  async getAllRules(env) {
    const rules = await ruleService.getAllRules(env);
    return ResponseUtil.success(rules, "success", 200);
  },

    // 获取规则分页
    async getRulesPage(env, type, pageNum, pageSize, keyWord) {
      const rules = await ruleService.getRulesPage(env, type, pageNum, pageSize, keyWord);
      return ResponseUtil.success(rules, "success", 200);
    },

  // 根据ID获取规则
  async getRuleById(env, id) {
    const rule = await ruleService.getRuleById(env, id);

    if (!rule) {
      return ResponseUtil.error("Rule not found", 404);
    }
    return ResponseUtil.success(rule, "success", 200);
  },

  // 根据type获取所有

  async getAllRulesByType(env, type) {
    const results = await ruleService.getAllRulesByType(env, type);
    return ResponseUtil.success(results, "success", 200);
  },


  // 创建规则
  async createRule(request, env) {
    const { ruleType, ruleParam, ruleConfig, resolveDns } = await request.json();
    const result = await ruleService.createRule(env, { ruleType, ruleParam, ruleConfig, resolveDns });
    if (result) {
      return ResponseUtil.success(result, "success", 200);
    } else {
      return ResponseUtil.error("Match规则只能存在一个", 601);
    }
  },

  // 更新规则
  async updateRule(request, env) {
    const { id, ruleType, ruleParam, ruleConfig, resolveDns } = await request.json();
    const result = await ruleService.updateRule(env, { id, ruleType, ruleParam, ruleConfig, resolveDns });

    if (result === 0) {
      return ResponseUtil.error("Rule not found or no changes", 404);
    }
    return ResponseUtil.success(null, "Rule updated successfully", 200);
  },

  // 导入规则
  async importRule(request, env) {
    const { url } = await request.json();
    const result = await ruleService.importRule(env, url);
    return ResponseUtil.success(result, "success", 200);
  },

  // 删除规则
  async deleteRule(env, id) {
    const result = await ruleService.deleteRule(env, id);

    if (result === 0) {
      return ResponseUtil.error("Rule not found", 404);
    }
    return ResponseUtil.success(null, "Rule deleted successfully", 200);
  },
  async deleteAll(env) {
    const result = await ruleService.deleteAll(env);

    if (result === 0) {
      return ResponseUtil.error("Rule not found", 404);
    }
    return ResponseUtil.success(null, "Rule deleted successfully", 200);
  },
};
