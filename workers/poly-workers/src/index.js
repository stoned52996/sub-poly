import airportHandler from "./handlers/airportHandler.js";
import ruleHandler from "./handlers/ruleHandler.js";
import groupHandler from "./handlers/groupHandlers.js"
import commonHandler from "./handlers/commonHandler.js"
import ResponseUtil from './utils/ResponseUtil.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;

    // 设置 CORS 头部
    const headers = {
      'Access-Control-Allow-Origin': '*', // 允许所有域名访问，你可以根据需要修改为特定域
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // 允许的请求方法
      'Access-Control-Allow-Headers': 'Content-Type, Authorization', // 允许的请求头
      'Access-Control-Allow-Credentials': 'true', // 是否允许发送 Cookie
    };

    // 如果是预检请求（OPTIONS 请求），直接返回成功响应
    if (method === 'OPTIONS') {
      console.log("OPTIONS请求");
      return new Response(null, {
        status: 204,
        headers,
      });
    }

    if (url.pathname !== "/subscribe") {
      const authHeader = request.headers.get('Authorization');
      // 检测token是否正确
      const authHeaderFind = await commonHandler.initCheck(env, authHeader);
      const responseBody = JSON.parse(await authHeaderFind.text());
      console.log("responseBody:" + responseBody)
      if(responseBody.data == null) {
        return ResponseUtil.error('未授权', 401);
      }
    }

    // 处理机场
    if (url.pathname.startsWith("/airports")) {
      if (url.pathname === "/airports/add" && method === "POST") {
        return await airportHandler.createAirport(env, request);
      }
      else if (url.pathname === "/airports/all" && method === "GET") {
        return await  airportHandler.getAllAirports(env);
      }
      else if (url.pathname === "/airports/single" && method === "GET") {
        const id = url.searchParams.get('id');
        return await   airportHandler.getAirportById(env, id);
      }
      else if (url.pathname === "/airports/update" && method === "POST") {
        return await   airportHandler.updateAirport(env, request);
      }
      else if (url.pathname === "/airports/del" && method === "GET") {
        const id = url.searchParams.get('id');
        return await   airportHandler.deleteAirport(env, id);
      }
    }

    else if (url.pathname.startsWith("/rules")) {
      //处理规则
      if (url.pathname === "/rules/add" && method === "POST") {
        return await ruleHandler.createRule(request, env);
      }
      else if (url.pathname === "/rules/page" && method === "GET") {
        const type = url.searchParams.get('type');
        const pageNum = url.searchParams.get('pageNum');
        const pageSize = url.searchParams.get('pageSize');
        const keyWord = url.searchParams.get('keyWord');
        return await ruleHandler.getRulesPage(env, type, pageNum, pageSize, keyWord);
      }
      else if (url.pathname === "/rules/type" && method === "GET") {
        const type = url.searchParams.get('type');
        return await ruleHandler.getAllRulesByType(env, type);
      }
      else if (url.pathname === "/rules/all" && method === "GET") {
        return await ruleHandler.getAllRules(env);
      }
      else if (url.pathname === "/rules/single" && method === "GET") {
        const id = url.searchParams.get('id');
        return await ruleHandler.getRuleById(env, id);
      }
      else if (url.pathname === "/rules/update" && method === "POST") {
        return await ruleHandler.updateRule(request, env);
      }
      else if (url.pathname === "/rules/import" && method === "POST") {
        return await ruleHandler.importRule(request, env);
      }
      else if (url.pathname === "/rules/del" && method === "GET") {
        const id = url.searchParams.get('id');
        return await ruleHandler.deleteRule(env, id);
      }
      else if (url.pathname === "/rules/deleteAll" && method === "GET") {
        return await ruleHandler.deleteAll(env);
      }
    }

    else if (url.pathname.startsWith("/group")) {
      //group
      if (url.pathname === "/group/add" && method === "POST") {
        return await groupHandler.addGroup(request, env);
      }
      else if (url.pathname === "/group/type" && method === "GET") {
        const type = url.searchParams.get('type');
        return await groupHandler.getGroupsByType(env, type);;
      }
      else if (url.pathname === "/group/all" && method === "GET") {
        return await groupHandler.getAllGroups(env);
      }
      else if (url.pathname === "/group/single" && method === "GET") {
        const id = url.searchParams.get('id');
        return await groupHandler.getGroupById(env, id);
      }
      else if (url.pathname === "/group/update" && method === "POST") {
        return await groupHandler.editGroup(request, env);
      }
      else if (url.pathname === "/group/del" && method === "GET") {
        const id = url.searchParams.get('id');
        return await groupHandler.deleteGroup(env, id);
      }
    }

    else if (url.pathname.startsWith("/sub")) {
      // 处理订阅
      if (url.pathname === "/sub" && method === "GET") {
        return await commonHandler.getSub(env);
      }
      else if (url.pathname === "/sub/generate" && method === "GET") {
        return await commonHandler.subgenerate(env);
      }
      else if (url.pathname === "/subscribe" && method === "GET") {
        const token = url.searchParams.get('token');
        return await commonHandler.tokenSubscribe(env, token);
      }
    }

    else if (url.pathname.startsWith("/config")) {
      // 处理订阅
      if (url.pathname === "/config" && method === "GET") {
        return await commonHandler.getConfig(env);
      }
      else if (url.pathname === "/config/reset" && method === "GET") {
        return await commonHandler.resetConfig(env);
      }
      else if (url.pathname === "/config/update" && method === "POST") {
        return await commonHandler.updateConfig(env, request);
      }
    }

    else if (url.pathname.startsWith("/user")) {
      if (url.pathname === "/user/reset" && method === "GET") {
        const token = url.searchParams.get('token');
        const oldToken = url.searchParams.get('oldToken');
        return await commonHandler.setToken(env, token, oldToken);
      }
    }

    else {
      return new Response("Not Found", { status: 404, headers });
    }
  }
};
