import groupRepository from "../db/groupRepository.js";

export default {
  // 获取所有分组
  async getAllGroups(env) {
    const groups = await groupRepository.getAllGroups(env);
    return groups.results.map(group => ({
      id: group.id,
      groupName: group.group_name,
      groupType: group.group_type,
      groupRegex: group.group_regex,
      url: group.url,
      interval: group.interval,
      createdAt: group.created_at
    }));
  },

  async getGroupsByType(env, type) {
    const groups = await groupRepository.getGroupsByType(env, type);
    return groups.results.map(group => ({
      id: group.id,
      groupName: group.group_name,
      groupType: group.group_type,
      groupRegex: group.group_regex,
      url: group.url,
      interval: group.interval,
      createdAt: group.created_at
    }));
  },

  // 通过id获取所有分组
  async getGroupById(env, id) {
    const data = await groupRepository.getGroupById(env, id);

    if (!data) return null;

    return {
      id: group.id,
      grooupName: group.group_name,
      groupType: group.group_type,
      groupRegex: group.group_regex,
      url: group.url,
      interval: group.interval,
      createdAt: group.created_at
    };
  },


  // 添加分组
  async addGroup(env, groupName, groupType, groupRegex, url, interval) {
    return await groupRepository.addGroup(env, groupName, groupType, groupRegex, url, interval);
  },

  // 修改分组
  async editGroup(env, id, groupName, groupType, groupRegex, url, interval) {
    return await groupRepository.editGroup(env, id, groupName, groupType, groupRegex, url, interval);
  },

  // 删除分组
  async deleteGroup(env, id) {
    console.log(id);
    return await groupRepository.deleteGroup(env, id);
  },
};