import axios from 'axios';
import config from '../config/config.js';

class FM4ApiClient {
  constructor() {
    this.baseUrl = config.fm4.apiBaseUrl;
    this.client = axios.create({
      timeout: 30000,
      headers: {
        'User-Agent': 'FM4-Key-Server/1.0'
      }
    });
  }

  async getLive() {
    try {
      const url = `${this.baseUrl}/live`;
      console.log(`[API] Fetching live data from: ${url}`);
      const response = await this.client.get(url);
      return response.data;
    } catch (error) {
      console.error(`[API] Error fetching live data:`, error.message);
      throw error;
    }
  }

  async getBroadcasts() {
    try {
      const url = `${this.baseUrl}/broadcasts`;
      console.log(`[API] Fetching broadcasts from: ${url}`);
      const response = await this.client.get(url);
      return response.data;
    } catch (error) {
      console.error(`[API] Error fetching broadcasts:`, error.message);
      throw error;
    }
  }
}

export default new FM4ApiClient();
