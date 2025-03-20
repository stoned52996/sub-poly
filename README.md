# SubPoly 

[![Node.js v18](https://img.shields.io/badge/Node.js-v18-green.svg)](https://nodejs.org/) [![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange.svg)](https://workers.cloudflare.com/) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

------

## 📖 项目介绍

**SubPoly** 是一个在线 Web 应用，允许用户管理和修改 **Clash** 规则。它支持同时管理多个订阅地址，并将所有节点和规则聚合到一个统一的订阅地址中，大大简化了配置管理流程。

📌 **核心功能**

- 🛠️ 多订阅管理
- 🚀 规则自动合并
- 🔧 自定义规则编辑
- ☁️ 云端存储支持

![预览](https://raw.githubusercontent.com/icutool/img/refs/heads/main/IMG_202503191008_844x479.png)

------

## 🚀 部署指南

### 🛠 环境准备

✅ **所需工具**

- **Node.js v18** 或更高版本
- **Cloudflare 账户**
- **Wrangler CLI 工具**

### 📥 1. 获取源代码

```bash
# 克隆仓库
git clone https://github.com/yourusername/subpoly.git

# 进入项目目录
cd subpoly
```

### 🗄️ 2. 数据库配置

#### 📌 进入 Workers 目录

```bash
cd workers/poly-workers
```

#### 📦 安装依赖

```bash
npm install
```

#### 🗃️ 创建 D1 数据库

```bash
wrangler d1 create subPoly
```

> 📝 首次执行时会跳转到 Cloudflare 网站进行登录授权

![创建数据库](https://raw.githubusercontent.com/icutool/img/refs/heads/main/img_v3_02kh_c952a4a0-ade5-4be1-919e-979e7d64c69g.jpg)

✅ **请记录生成的 database_name 和 database_id，后续配置将会用到**

#### 🏗️ 初始化数据库

```bash
# 返回项目根目录
cd db

# 执行基础数据库脚本导入
wrangler d1 execute subPoly --file=./base.sql --remote

# 执行新增数据库脚本导入 注意:除了base.sql 其他的都是新增数据库脚本 将其他的所有的脚本都执行一下下面的命令
wrangler d1 execute subPoly --file=./新增脚本.sql --remote
```

![脚本执行](https://raw.githubusercontent.com/icutool/img/refs/heads/main/img_v3_02kh_969edd77-6090-4a0e-867a-37ec341fb60g.jpg)

------

### 🖥️ 3. 后端部署

#### 📝 配置数据库连接

编辑 `workers/poly-workers/wrangler.jsonc` 文件，更新以下字段：

- 将 `database_name` 和 `database_id` 修改为之前创建的数据库信息

![修改配置文件](https://raw.githubusercontent.com/icutool/img/refs/heads/main/Snipaste_2025-03-19_14-51-36.png)

#### 🚀 部署后端服务

```bash
cd workers/poly-workers
npm run deploy
```

> 如提示输入分支名，直接输入 `master` 即可

![部署](https://raw.githubusercontent.com/icutool/img/refs/heads/main/img_v3_02kh_69489758-6ee4-4a11-af17-5e7d6cf0815g.jpg)

✅ **请记录生成的 https://\**\*.dev 地址，这将是后端 API 地址**

⚠️ **注意：建议绑定自定义域名，而不是直接使用 Cloudflare 提供的 Workers 地址。国内大多数地区由于网络原因访问workers.dev地址存在不稳定性**

🔗 **自定义后端域名绑定步骤**

1. 登录 **Cloudflare 控制台**
2. 进入 `Workers 和 Pages` -> `Workers`
3. 找到刚创建的 Worker 并点击进入
4. 进入 `设置` -> `域和路由` -> `添加`
5. 按页面提示完成域名配置

![自定义后端域](https://raw.githubusercontent.com/icutool/img/refs/heads/main/Snipaste_2025-03-19_14-45-12.png)

------

### 🌐 4. 前端部署

#### 📂 进入前端目录

```bash
cd ../poly-page
```

#### 📦 安装依赖

```bash
npm install
```

#### ⚙️ 配置 API 地址

编辑 `.env.production` 文件：

- **修改 VITE_API_BASE= 后面的值为上一步获得的后端 API 地址或自定义域**

![修改配置文件](https://raw.githubusercontent.com/icutool/img/refs/heads/main/Snipaste_2025-03-19_14-49-52.png)

#### 🏗️ 构建前端项目

```bash
npm run build --emptyOutDir
```

![打包](https://raw.githubusercontent.com/icutool/img/refs/heads/main/20250319-111736.jpg)

#### 🚀 部署到 Cloudflare Pages

```bash
npm run deploy
```

📌 **部署步骤：**

- 选择 `Create a new` 创建新项目
- 输入项目名称
- 生产分支保持默认 `master`

![部署](https://raw.githubusercontent.com/icutool/img/refs/heads/main/20250319-111801.jpg)

------

### 🌍 5. 配置页面自定义域名 (可选)

1. 登录 **Cloudflare 控制台**
2. 进入 `Workers 和 Pages` -> `Pages`
3. 找到前端项目并点击进入
4. 点击 `自定义域` -> `设置自定义域`
5. 按页面提示完成域名绑定

### 🎉 6.使用

- **默认密钥 icu996 访问地址后输入**
- **添加订阅和修改规则**
- **⚠️记得重置访问密钥⚠️**
- **开始享受吧！**

------

## 🛠️ 技术栈

| 🔧 技术       | 🚀 说明             |
| ------------ | ------------------ |
| 🎨 **前端**   | Vue.js + Vite      |
| 🏗 **后端**   | Node |
| ☁️ **部署**   | Cloudflare Workers |
| 🗄 **数据库** | Cloudflare D1      |

------

## 📝 TODO

| 🔖 清单       | ⏳ 进度             |
| ------------ | ------------------ |
| 分组支持 正则表达式   | 🚧 开发中      |
| 添加kv缓存   | 📈计划中 |

------

## 📜 许可证

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

------

## 🤝 贡献指南

💡 **欢迎提交 Issue 或 Pull Request 来完善本项目！**

📢 **社区交流**

- 💬 提交 Bug 或建议：GitHub Issue
- ✨ 贡献代码：Pull Request

🚀 **一起让 SubPoly 更加强大！** 🎉

## ⚠️ 项目缺陷

1. **目前鉴权很简单**，只使用了访问秘钥，由于时间原因未开发用户名密码校验。
