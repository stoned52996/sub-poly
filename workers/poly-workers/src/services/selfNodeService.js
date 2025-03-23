import Sub2Clash from '../utils/Sub2Clash.js';
import selfNodeRepository from "../db/selfNodeRepository.js";


export default {
    // 获取所有自建节点
    async converter(link) {
        try {
            let protocol;
            if (link.startsWith('vmess://')) protocol = 'vmess';
            else if (link.startsWith('vless://')) protocol = 'vless';
            else if (link.startsWith('trojan://')) protocol = 'trojan';
            else if (link.startsWith('ss://')) protocol = 'ss';
            else if (link.startsWith('ssr://')) protocol = 'ssr';
            else if (link.startsWith('hysteria://')) protocol = 'hysteria';
            else if (link.startsWith('hysteria2://')) protocol = 'hysteria2';
            else throw new Error('不支持的协议');

            const config = Sub2Clash.convert(protocol, link);
            return config;
        } catch (error) {
            console.error('转换失败:', error);
            throw error;
        }
    },
    // 获取所有自建节点
    async getAllNodes(env) {
        const groups = await selfNodeRepository.getAllNodes(env);
        return groups.results.map(group => ({
            id: group.id,
            link: group.link,
            convert: group.convert,
            createdAt: group.created_at
        }));
    },

    // 通过id获取所有自建节点
    async getNodeById(env, id) {
        const data = await selfNodeRepository.getNodeById(env, id);

        if (!data) return null;

        return {
            id: group.id,
            link: group.link,
            convert: group.convert,
            createdAt: group.created_at
        };
    },


    // 添加自建节点
    async addNode(env, link) {
        const convert = await this.converter(link);
        return await selfNodeRepository.addNode(env, link, JSON.stringify(convert));
    },

    // 修改自建节点
    async editNode(env, id, link, convert) {
        return await selfNodeRepository.editNode(env, id, link, convert);
    },

    // 删除自建节点
    async deleteNode(env, id) {
        return await selfNodeRepository.deleteNode(env, id);
    },
}