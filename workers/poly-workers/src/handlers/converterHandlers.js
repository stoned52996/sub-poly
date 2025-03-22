import converterService from '../services/converterService.js';
import ResponseUtil from '../utils/ResponseUtil.js';

export default {
    // 获取订阅地址
    async converter(env, sub) {
        const subConverter = await converterService.converter(env, sub);
        return ResponseUtil.success(subConverter, "success", 200);
    }
}