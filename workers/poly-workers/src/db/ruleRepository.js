export default {
  // 获取所有规则
  async getAllRules(env) {
    return await env.DB.prepare(`
      SELECT * FROM rules
      order by
      case rule_type
      WHEN 'DOMAIN' THEN 1
      WHEN 'DOMAIN-SUFFIX' THEN 2
      WHEN 'DOMAIN-KEYWORD' THEN 3
      WHEN 'IP-CIDR' THEN 4
      WHEN 'IP-CIDR6' THEN 5
      WHEN 'SRC-IP-CIDR' THEN 6
      WHEN 'SRC-PORT' THEN 7
      WHEN 'DST-PORT' THEN 8
      WHEN 'PROCESS-NAME' THEN 9
      WHEN 'PROCESS-PATH' THEN 10
      WHEN 'GEOIP' THEN 11
      WHEN 'MATCH' THEN 12
      ELSE 13
        END,
        id`).all();
  },
  async getRulesCount(env, type, keyWord) {
    const conditions = [];
    const binds = [];

    if (type !== 'ALL') {
      conditions.push("rule_type = ?");
      binds.push(type);
    }

    if (keyWord) {
      conditions.push("rule_param LIKE ?");
      binds.push(`%${keyWord}%`); // 添加模糊匹配通配符
    }

    let sql = "SELECT COUNT(*) as total FROM rules";
    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    return await env.DB.prepare(sql).bind(...binds).all();
  },

  async getRulesPage(env, type, pageNum, pageSize, keyWord) {
    const conditions = [];
    const binds = [];

    if (type !== 'ALL') {
      conditions.push("rule_type = ?");
      binds.push(type);
    }

    if (keyWord) {
      conditions.push("rule_param LIKE ?");
      binds.push(`%${keyWord}%`);
    }

    let sql = "SELECT * FROM rules";
    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(" AND ")}`;
    }
    
    // 添加分页参数
    const offset = (pageNum - 1) * pageSize;
    sql += " LIMIT ? OFFSET ?";
    binds.push(pageSize, offset);

    return await env.DB.prepare(sql).bind(...binds).all();
  },

  async getAllRulesByType(env, type) {
    return await env.DB.prepare("SELECT * FROM rules where rule_type = ?").bind(type).all();
  },

  // 根据ID获取单个规则
  async getRuleById(env, id) {
    return await env.DB.prepare("SELECT * FROM rules WHERE id = ?").bind(id).first();
  },

  // 创建新规则
  async createRule(env, { ruleType, ruleParam, ruleConfig, resolveDns }) {
    const createdAt = new Date().toISOString();
    const result = await env.DB.prepare(`
        INSERT INTO rules (rule_type, rule_param, rule_config, resolve_dns, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).bind(ruleType, ruleParam, ruleConfig, resolveDns, createdAt).run();

    return result;
  },

  // 批量创建新规则
  async createRulesBatch(env, rules, batchSize = 10) {
    const createdAt = new Date().toISOString();
    const chunks = [];
    for (let i = 0; i < rules.length; i += batchSize) {
      chunks.push(rules.slice(i, i + batchSize));
    }

    for (const chunk of chunks) {
      const placeholders = chunk.map(() => "(?, ?, ?, ?, ?)").join(", ");
      const values = chunk.flatMap(({ ruleType, ruleParam, ruleConfig, resolveDns }) =>
        [ruleType, ruleParam, ruleConfig, resolveDns, createdAt]
      );

      await env.DB.prepare(`
      INSERT INTO rules (rule_type, rule_param, rule_config, resolve_dns, created_at)
      VALUES ${placeholders}
    `).bind(...values).run();
    }

    return rules.length;
  },

  // 更新规则
  async updateRule(env, { id, ruleType, ruleParam, ruleConfig, resolveDns }) {
    const result = await env.DB.prepare(`
        UPDATE rules SET rule_type = ?, rule_param = ?, rule_config = ?, resolve_dns = ? WHERE id = ?
      `).bind(ruleType, ruleParam, ruleConfig, resolveDns, id).run();

    return result;
  },

  // 删除规则
  async deleteRule(env, id) {
    const result = await env.DB.prepare("DELETE FROM rules WHERE id = ?").bind(id).run();
    return result;
  },
  async deleteAll(env) {
    const result = await env.DB.prepare("DELETE FROM rules").run();
    return result;
  },
};
