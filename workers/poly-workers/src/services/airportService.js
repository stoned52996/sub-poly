import airportRepository from "../db/airportRepository.js";

export default {
  async createAirport(env, name, subscriptionUrl, remarks, isEnabled) {
    return await airportRepository.createAirport(env, name, subscriptionUrl, remarks, isEnabled);
  },

  async getAllAirports(env) {
    const airports = await airportRepository.getAllAirports(env);
    return airports.results.map(airport => ({
      id: airport.id,
      name: airport.name,
      subscriptionUrl: airport.subscription_url,  // 字段名映射
      remarks: airport.remarks,
      createdAt: airport.created_at,
      isEnabled: airport.is_enabled
    }));
  },

  async getAirportById(env, id) {
    return await airportRepository.getAirportById(env, id);
  },

  async updateAirport(env, id, name, subscriptionUrl, remarks, isEnabled) {
    return await airportRepository.updateAirport(env, id, name, subscriptionUrl, remarks, isEnabled);
  },

  async deleteAirport(env, id) {
    return await airportRepository.deleteAirport(env, id);
  }
};
