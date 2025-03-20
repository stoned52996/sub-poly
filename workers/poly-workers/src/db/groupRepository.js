export default {
  // 获取所有分组
  async getAllGroups(env) {
    return await env.DB.prepare("SELECT * FROM groups").all();
  },

  async getGroupsByType(env, type) {
    return await env.DB.prepare("SELECT * FROM groups where group_type = ?").bind(type).all();
  },

  // 通过id获取所有分组
  async getGroupById(env, id) {
    return await env.DB.prepare("SELECT * FROM groups where id = ?").bind(id).all();
  },

  // 添加分组
  async addGroup(env, groupName, groupType, groupRegex, url, interval) {
    const lasteResult = await env.DB.prepare("SELECT * FROM groups order by id desc").first();
    let newId;
    if(lasteResult == null) {
      newId = 1
    } else {
      newId = lasteResult.id + 1
    }
    const result = await env.DB.prepare(
      "INSERT INTO groups (id, group_name, group_type, group_regex, url, interval) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(newId, groupName, groupType, groupRegex, url, interval).run();
    console.log("newId:" + newId);
    return { id: newId, groupName, groupType, groupRegex, url, interval };
  },

  // 修改分组
  async editGroup(env, id, groupName, groupType, groupRegex, url, interval) {
    await env.DB.prepare(
      "UPDATE groups SET group_name = ?, group_type = ?, group_regex = ?, url = ?, interval = ? WHERE id = ?"
    ).bind(groupName, groupType, groupRegex, url, interval, id).run();
  },

  // 删除分组
  async deleteGroup(env, id) {
    
    await env.DB.prepare("DELETE FROM groups WHERE id = ?").bind(id).run();
  },
};