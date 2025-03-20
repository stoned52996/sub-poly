import groupService from '../services/groupService.js';
import ResponseUtil from '../utils/ResponseUtil.js';

export default {
    // 获取所有分组
    async getAllGroups(env) {
        const results = await groupService.getAllGroups(env);
        return ResponseUtil.success(results, "success", 200);
    },

    async getGroupsByType(env, type) {
        const results = await groupService.getGroupsByType(env, type);
        return ResponseUtil.success(results, "success", 200);
    },

    // 通过id获取分组
    async getGroupById(env, id) {
        const group = await groupService.getGroupById(env, id);

        if (!group) {
            return ResponseUtil.error("group not found", 404);
        }
        return ResponseUtil.success(group, "success", 200);
    },


    // 添加分组
    async addGroup(request, env) {
        const { groupName, groupType, groupRegex, url, interval } = await request.json();
        await groupService.addGroup(env, groupName, groupType, groupRegex, url, interval);
        return ResponseUtil.success(null, "Group added", 200);
    },

    // 修改分组
    async editGroup(request, env) {
        const { id, groupName, groupType, groupRegex, url, interval } = await request.json();
        await groupService.editGroup(env, id, groupName, groupType, groupRegex, url, interval);
        return ResponseUtil.success(null, "Group updated", 200);
    },

    // 删除分组
    async deleteGroup(env, id) {
        await groupService.deleteGroup(env, id);
        return ResponseUtil.success(null, "Group deleted", 200);
    },
};
