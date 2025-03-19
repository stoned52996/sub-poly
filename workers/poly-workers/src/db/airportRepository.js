export default {
    async createAirport(env, name, subscriptionUrl, remarks, isEnabled = true) {
      return await env.DB.prepare(
        `INSERT INTO airports (name, subscription_url, remarks, created_at, is_enabled) 
         VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?)`
      ).bind(name, subscriptionUrl, remarks, isEnabled).run();
    },
  
    async getAllAirports(env) {
      return await env.DB.prepare("SELECT * FROM airports").all();
    },

    async getAllOpenAirports(env) {
      return await env.DB.prepare("SELECT * FROM airports where is_enabled = 1").all();
    },
  
    async getAirportById(env, id) {
      return await env.DB.prepare("SELECT * FROM airports WHERE id = ?").bind(id).first();
    },
  
    async updateAirport(env, id, name, subscriptionUrl, remarks, isEnabled) {
      return await env.DB.prepare(
        `UPDATE airports 
         SET name = ?, subscription_url = ?, remarks = ?, is_enabled = ? 
         WHERE id = ?`
      ).bind(name, subscriptionUrl, remarks, isEnabled, id).run();
    },
  
    async deleteAirport(env, id) {
      return await env.DB.prepare("DELETE FROM airports WHERE id = ?").bind(id).run();
    }
  };
  