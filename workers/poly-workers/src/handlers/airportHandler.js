import airportService from "../services/airportService.js";
import ResponseUtil from '../utils/ResponseUtil.js';

export default {
  async createAirport(env, request) {
    const { name, subscriptionUrl, remarks, isEnabled } = await request.json();
    if (!name || !subscriptionUrl) {
      return ResponseUtil.error("Missing required fields", 400);
    }

    await airportService.createAirport(env, name, subscriptionUrl, remarks, isEnabled);
    return ResponseUtil.success(null, "success", 200);
  },

  async getAllAirports(env) {
    const results  = await airportService.getAllAirports(env);
    return ResponseUtil.success(results, "success", 200);
  },
  
  async getAirportById(env, id) {
    const airport = await airportService.getAirportById(env, id);

    if (!airport) {
      return ResponseUtil.error("Airport not found", 404);
    }
    return ResponseUtil.success(airport, "success", 200);
  },

  async updateAirport(env, request) {
    const { id, name, subscriptionUrl, remarks, isEnabled } = await request.json();

    const existing = await airportService.getAirportById(env, id);
    if (!existing) {
      return ResponseUtil.error("Airport not found", 404);
    }

    await airportService.updateAirport(env, id, name, subscriptionUrl, remarks, isEnabled);
    return ResponseUtil.success(null, "Airport updated", 200);
  },

  async deleteAirport(env, id) {
    await airportService.deleteAirport(env, id);
    return ResponseUtil.success(null, "Airport deleted", 200);
  }
};
