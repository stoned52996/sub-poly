import commonRepository from "../db/commonRepository.js";
import airportRepository from "../db/airportRepository.js";
import groupRepository from "../db/groupRepository.js";
import ruleRepository from "../db/ruleRepository.js";
import yaml from 'js-yaml';
import axios from 'axios';


const json = {
  "mixed-port": 7890,
  "allow-lan": false,
  "bind-address": "*",
  "mode": "rule",
  "log-level": "info",
  "external-controller": "127.0.0.1:9090",
  "unified-delay": true,
  "tcp-concurrent": true,
  "dns": {
    "enable": true,
    "ipv6": false,
    "default-nameserver": [
      "223.5.5.5",
      "119.29.29.29"
    ],
    "enhanced-mode": "fake-ip",
    "fake-ip-range": "198.18.0.1/16",
    "use-hosts": true,
    "nameserver": [
      "https://dns.alidns.com/dns-query",
      "https://doh.pub/dns-query"
    ],
    "fallback": [
      "https://dns.alidns.com/dns-query",
      "https://doh.pub/dns-query"
    ],
    "fallback-filter": {
      "geoip": true,
      "ipcidr": [
        "240.0.0.0/4",
        "0.0.0.0/32"
      ]
    }
  }
};

export default {
  // 获取订阅
  async getSub(env) {
    const sub = await commonRepository.getInfoByType(env, 'sub');
    if (!sub) return null;
    const obj = JSON.parse(sub.json);
    return {
      subUrl: obj.subUrl
    };
  },

  async initCheck(env, authHeader) {
    const token = await commonRepository.getInfoByType(env, 'token');
    console.log("token:" + token)
    if (!token) return null;
    const obj = JSON.parse(token.json);
    if (obj.token!== authHeader) {
      return null;
    } else {
      return {
        token: obj.token
      };
    }

  },

  async getConfig(env) {
    const config = await commonRepository.getInfoByType(env, 'config');
    if (!config) return null;
    return JSON.parse(config.json);
  },

  async resetConfig(env) {

    const jsonData = JSON.stringify(json);
    const config = await commonRepository.getInfoByType(env, 'config');
    if (config) {
      console.log('更新');
      await commonRepository.updateCommon(env, 'config', jsonData);

    } else {
      console.log('创建');
      const update = await commonRepository.createCommon(env, 'config', jsonData);
      if (!update) return null;
    }
    return jsonData;
  },

  async setToken(env, tokenInfo, oldToken) {
    const token = await commonRepository.getInfoByType(env, 'token');
    const jsonData = JSON.stringify({token: tokenInfo});
    console.log('11111111');
    if (token) {
      console.log('更新');
      // 判断token是否正确
      const obj = JSON.parse(token.json);
      if (obj.token !== oldToken) return null;
      await commonRepository.updateCommon(env, 'token', jsonData);
    } else {
      return null;
    }
    return {token: tokenInfo};
  },


  async updateConfig(env, jsonData) {
    const config = await commonRepository.getInfoByType(env, 'config');
    if (config) {
      console.log('更新');
      await commonRepository.updateCommon(env, 'config', jsonData);

    } else {
      console.log('创建');
      const update = await commonRepository.createCommon(env, 'config', jsonData);
      if (!update) return null;
    }
    return new Response(jsonData, { status: 200 });
  },


  async subgenerate(env, uuid) {
    const json = {
      subUrl: uuid
    }
    const subQuery = await commonRepository.getInfoByType(env, 'sub');
    let sub;
    if (subQuery) {
      // 如果有 就更新
      console.log('更新');
      await commonRepository.updateCommon(env, 'sub', JSON.stringify(json));
    } else {
      console.log('创建');
      sub = await commonRepository.createCommon(env, 'sub', JSON.stringify(json));
      if (!sub) return null;
    }
    return {
      subUrl: uuid
    };
  },
  async tokenFind(env, token) {
    const sub = await commonRepository.typeFind(env, 'sub');
    if (!sub) return null;
    const obj = JSON.parse(sub.json);
    if (obj.subUrl !== token) return null;
    return {
      subUrl: obj.subUrl
    };
  },

  async getYml(env) {
    const useInfo = [];
    // 获取所有开启状态的机场订阅地址
    const airports = await airportRepository.getAllOpenAirports(env);
    console.log("airports");
    console.log(JSON.stringify(airports));
    if (airports.results .length == 0) {
      console.log('没有机场');
      return null;
    }
    // 生成proxies
    const allProxies = [];
    const allProxiesName = [];
    for (const airport of airports.results) {
      const result = await this.getYmlFromUrl(airport.subscription_url); // 使用await等待Promise解析
      const yml = result.jsonData;
      useInfo.push(result.subscriptionInfo);
      const proxies = yml['proxies'];

      proxies.forEach(proxy => {
        if (airport.remarks) {
          proxy['name'] = airport.remarks + '-' + proxy['name'];
        }
        allProxiesName.push(proxy['name']);
      });
      allProxies.push(...proxies);
    }

    allProxiesName.sort((a, b) => {
      const keywordsA = /(剩余流量|重置剩余|套餐到期)/.test(a);
      const keywordsB = /(剩余流量|重置剩余|套餐到期)/.test(b);
      return keywordsB - keywordsA;
    });
    const nonSelectGroupNames = [];
    // 生成proxy-groups
    const proxyGroups = [];
    const dbGroup = await groupRepository.getAllGroups(env);
    dbGroup.results.forEach(group => {
      const regex = group.group_regex;
      const newProxies = JSON.parse(JSON.stringify(allProxiesName))
      const filteredProxies = regex 
        ? newProxies.filter(name => new RegExp(regex).test(name))
        : newProxies;
      const proxyGroup = {
        'name': group.group_name,
        'type': group.group_type,
        'proxies': filteredProxies
      };
      if (group.group_type != 'select') {
        proxyGroup['url'] = group.url;
        proxyGroup['interval'] = group.interval;
        nonSelectGroupNames.push(group.group_name);
      }
      proxyGroups.push(proxyGroup);
    });

    
    proxyGroups.forEach(group => {
      if (group.type === 'select') {
        group.proxies.unshift(...nonSelectGroupNames);
      }
    });



    // 获取通用配置
    const configFromDb = await commonRepository.getInfoByType(env, 'config');
    let commonConfig = null;
    if (configFromDb) {
      commonConfig = JSON.parse(configFromDb.json)
    } else {
      commonConfig = json;
    }
    commonConfig['proxies'] = allProxies;
    // 对 proxyGroups 进行排序，select 类型排在前面
    proxyGroups.sort((a, b) => {
      if (a.type === 'select' && b.type !== 'select') return -1;
      if (a.type !== 'select' && b.type === 'select') return 1;
      return 0;
    });
    commonConfig['proxy-groups'] = proxyGroups;

    // 获取所有的分组
    const groupsFromDb = await groupRepository.getAllGroups(env);
    const groupMap = {};
    groupsFromDb.results.map(group => {
      groupMap[group.id] = group.group_name;
    });
    groupMap[-1] = 'DIRECT';
    groupMap[-2] = 'REJECT';


    // 获取rules
    const rules = await ruleRepository.getAllRules(env);
    const rulesConfig = rules.results.map(rule => {
      if (rule.rule_type === 'DOMAIN-SUFFIX' || rule.rule_type === 'DOMAIN' || rule.rule_type === 'DOMAIN-KEYWORD') {
        return `${rule.rule_type},${rule.rule_param},${groupMap[rule.rule_config]}`;
      } else if (rule.rule_type === 'GEOIP') {
        return `${rule.rule_type},${rule.rule_param},${groupMap[rule.rule_config]}`;
      } else if (rule.rule_type === 'IP-CIDR' || rule.rule_type === 'IP-CIDR6') {
        if (rule.resolve_dns !== null) {
          if (rule.resolve_dns === "0") {
            return `${rule.rule_type},${rule.rule_param},${groupMap[rule.rule_config]},no-resolve`;
          } else {
            return `${rule.rule_type},${rule.rule_param},${groupMap[rule.rule_config]}`;
          }
        } else {
          return `${rule.rule_type},${rule.rule_param},${groupMap[rule.rule_config]}`;
        }
      } else if (rule.rule_type === 'SRC-IP-CIDR' || rule.rule_type === 'SRC-PORT' || rule.rule_type === 'DST-PORT') {
        return `${rule.rule_type},${rule.rule_param},${groupMap[rule.rule_config]}`;
      } else if (rule.rule_type === 'PROCESS-NAME' || rule.rule_type === 'PROCESS-PATH') {
        return `${rule.rule_type},${rule.rule_param},${groupMap[rule.rule_config]}`;
      } else if (rule.rule_type === 'MATCH') {
        return `${rule.rule_type},${groupMap[rule.rule_config]}`;
      }
    });

    commonConfig['rules'] = rulesConfig;
    const yamlData = yaml.dump(commonConfig);
    return {
      yamlData: yamlData,
      useInfo: useInfo
    };
  },

  async getYmlFromUrl(url) {
    // 如果以 &flag=clash结尾
    if (!url.endsWith('&flag=clashVerge')) {
      url = url + '&flag=clashVerge';
    }
    console.log("url: " + url);
    try {
      const response = await axios.get(url); // 使用await等待响应
      console.log(response.status);
      if (response.status === 200) {
        const jsonData = yaml.load(response.data);
        const subscriptionInfo = response.headers['subscription-userinfo'];
        console.log('Subscription Info:', subscriptionInfo);
        return {
          jsonData: jsonData,
          subscriptionInfo: subscriptionInfo
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching URL:', error);
      return null;
    }
  }
};