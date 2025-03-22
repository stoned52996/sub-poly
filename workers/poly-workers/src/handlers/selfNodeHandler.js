import selfNodeService from '../services/selfNodeService.js';
import ResponseUtil from '../utils/ResponseUtil.js';

export default {
    // 获取订阅地址
    async converter(env, sub) {
        const subConverter = await selfNodeService.converter(env, sub);
        return ResponseUtil.success(subConverter, "success", 200);
    },
    // 获取所有自建节点
    async getAllNodes(env) {
        const results = await selfNodeService.getAllNodes(env);
        return ResponseUtil.success(results, "success", 200);
    },
    // 通过id获取自建节点
    async getNodeById(env, id) {
        const Node = await selfNodeService.getNodeById(env, id);

        if (!Node) {
            return ResponseUtil.error("Node not found", 404);
        }
        return ResponseUtil.success(Node, "success", 200);
    },
    // 添加自建节点
    async addNode(request, env) {
        const { link } = await request.json();
        await selfNodeService.addNode(env, link);
        return ResponseUtil.success(null, "Node added", 200);
    },
    // 修改自建节点
    async editNode(request, env) {
        const { id, link, convert } = await request.json();
        await selfNodeService.editNode(env, id, link, convert);
        return ResponseUtil.success(null, "Node updated", 200);
    },
    // 删除自建节点
    async deleteNode(env, id) {
        await selfNodeService.deleteNode(env, id);
        return ResponseUtil.success(null, "Node deleted", 200);
    },

}