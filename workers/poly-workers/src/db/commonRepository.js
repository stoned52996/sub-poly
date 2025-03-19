export default {
  // 获取所有分组
  async getInfoByType(env, type) {
    return await env.DB.prepare("SELECT json FROM common where type = ?").bind(type).first();
  },

  // 创建新订阅
  async createCommon(env, type, json) {
    const createdAt = new Date().toISOString();
    const result = await env.DB.prepare(`
        INSERT INTO common (type, json, created_at)
        VALUES (?, ?, ?)
        RETURNING *
      `).bind(type, json, createdAt).first();

    return result;
  },

  // 更新
  async updateCommon(env, type, json) {
    const createdAt = new Date().toISOString();
    return await env.DB.prepare(
      `UPDATE common 
       SET json = ? , created_at = ?
       WHERE type = ?`
    ).bind(json, createdAt, type).run();
  },

  // 查询订阅
  async typeFind(env, type) {
    return await env.DB.prepare("SELECT * FROM common WHERE type = ?").bind(type).first();
  },

  // 删除订阅
  async deleteSub(env) {
    const result = await env.DB.prepare("DELETE FROM common").run();
    return result;
  },
};