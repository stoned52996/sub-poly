export default {
    // 获取所有自建节点
    async getAllNodes(env) {
      return await env.DB.prepare("SELECT * FROM self_node").all();
    },
    // 通过id获取所有自建节点
    async getNodeById(env, id) {
      return await env.DB.prepare("SELECT * FROM self_node where id = ?").bind(id).all();
    },
  
    // 添加自建节点
    async addNode(env, link, convert) {
      const lasteResult = await env.DB.prepare("SELECT * FROM self_node order by id desc").first();
      let newId;
      if(lasteResult == null) {
        newId = 1
      } else {
        newId = lasteResult.id + 1
      }
      const result = await env.DB.prepare(
        "INSERT INTO self_node (id, link, convert) VALUES (?, ?, ?)"
      ).bind(newId, link, convert).run();
      console.log("newId:" + newId);
      return { id: newId, link, convert };
    },
  
    // 修改自建节点
    async editNode(env, id, link, convert) {
      await env.DB.prepare(
        "UPDATE self_node SET link = ?, convert = ? WHERE id = ?"
      ).bind(link, convert, id).run();
    },
  
    // 删除自建节点
    async deleteNode(env, id) {
      
      await env.DB.prepare("DELETE FROM self_node WHERE id = ?").bind(id).run();
    },
  };