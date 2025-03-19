import commonService from "../services/commonService.js";
import ResponseUtil from '../utils/ResponseUtil.js';
export default {
    // 获取订阅地址
    async getSub(env) {
        const rules = await commonService.getSub(env);
        return ResponseUtil.success(rules, "success", 200);
    },

    async initCheck(env, authHeader) {
        const data =  await commonService.initCheck(env, authHeader);
        if (data) {
            return ResponseUtil.success(data, "success", 200);
        } else {
            return ResponseUtil.error(null, "token error", 401);
        }
    },

    // 生成订阅地址
    async subgenerate(env) {
        const uuid = this.generateUUID();
        console.log('uuid:' + uuid);
        const sub = await commonService.subgenerate(env, uuid);
        return ResponseUtil.success(sub, "success", 200);
    },


    // 获取订阅信息
    async tokenSubscribe(env, token) {
        const sub = await commonService.tokenFind(env, token);
        if (sub) {
            const result = await commonService.getYml(env);
            if (result == null) {
                return ResponseUtil.error(null, "不存在开启的订阅", 602);
            }

            const response = new Response(result.yamlData, {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
            let use = '';
            console.log("result.useInfo.length");
            console.log(result.useInfo.length);
            if (result.useInfo.length > 1) {
                let totalUpload = 0;
                let totalDownload = 0;
                let totalTotal = 0;
                let minExpire = 99999999999;
                for (const info of result.useInfo) {
                    const parts = info.split(';');
                    parts.forEach(part => {
                        const [key, value] = part.trim().split('=');  // 添加 trim() 去除空格
                        const trimmedKey = key.trim();  // 确保 key 没有空格
                        const numValue = parseInt(value, 10);
                        
                        switch (trimmedKey) {
                            case 'upload':
                                // console.log("upload key:" + trimmedKey + " numValue:" + numValue);
                                totalUpload += numValue;
                                break;
                            case 'download':
                                // console.log("download key:" + trimmedKey + " numValue:" + numValue);
                                totalDownload += numValue;
                                break;
                            case 'total':
                                // console.log("total key:" + trimmedKey + " numValue:" + numValue);
                                totalTotal += numValue;
                                break;
                            case 'expire':
                                // console.log("expire key:" + trimmedKey + " numValue:" + numValue);
                                minExpire = Math.min(minExpire, numValue);
                                break;
                        }
                    });
                }
                use = `upload=${totalUpload}; download=${totalDownload}; total=${totalTotal}; expire=${minExpire}`;
                console.log("use");
                console.log(use);
                response.headers.set('subscription-userinfo', use);
            } else {
                response.headers.set('subscription-userinfo', result.useInfo.join(';'));
            }
            response.headers.set('content-disposition', 'attachment;filename*=UTF-8\'\'%E5%A4%9A%E8%AE%A2%E9%98%85%E8%81%9A%E5%90%88');
            return response;
        } else {
            return ResponseUtil.error(null, "订阅不存在", 603);
        }
    },

    // 获取config
    async getConfig(env) {
        const config = await commonService.getConfig(env);
        return ResponseUtil.success(config, "success", 200);
    },

    async resetConfig(env) {
        const config = await commonService.resetConfig(env);
        return ResponseUtil.success(config, "success", 200);
    },

    async setToken(env, tokenInfo, oldToken) {
        const token = await commonService.setToken(env, tokenInfo, oldToken);
        if (token == null) {
            return ResponseUtil.error(null, "token error", 500);
        }
        return ResponseUtil.success(token, "success", 200);
    },

    async updateConfig(env, request) {
        const jsonData = JSON.stringify(await request.json())
        const config = await commonService.updateConfig(env, jsonData);
        return ResponseUtil.success(config, "success", 200);
    },

    generateUUID: function () {
        return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

};