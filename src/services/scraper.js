import fm4Api from './fm4-api.js';
import db from '../database/database.js';

class ProgramKeyScraper {
  constructor() {
    this.liveInterval = null;
    this.broadcastsInterval = null;
  }

  // Extract program keys from live endpoint
  async scrapeLive() {
    try {
      console.log('[Scraper] Scraping live endpoint...');
      const liveData = await fm4Api.getLive();
      
      if (!liveData || !Array.isArray(liveData)) {
        console.warn('[Scraper] No live data or invalid format');
        return;
      }

      let keysFound = 0;
      for (const broadcast of liveData) {
        if (broadcast.programKey) {
          const description = broadcast.program || null;
          const title = broadcast.title || null;
          const subtitle = broadcast.subtitle || null;
          
          db.upsertProgramKey(broadcast.programKey, description, title, subtitle);
          keysFound++;
        }
      }

      console.log(`[Scraper] Live scrape complete. Found ${keysFound} program keys.`);
    } catch (error) {
      console.error('[Scraper] Error scraping live endpoint:', error.message);
    }
  }

  // Extract program keys from broadcasts endpoint
  async scrapeBroadcasts() {
    try {
      console.log('[Scraper] Scraping broadcasts endpoint...');
      const broadcastsData = await fm4Api.getBroadcasts();
      
      if (!broadcastsData || !Array.isArray(broadcastsData)) {
        console.warn('[Scraper] No broadcasts data or invalid format');
        return;
      }

      let keysFound = 0;
      for (const day of broadcastsData) {
        if (day.broadcasts && Array.isArray(day.broadcasts)) {
          for (const broadcast of day.broadcasts) {
            if (broadcast.programKey) {
              const description = broadcast.program || null;
              const title = broadcast.title || null;
              const subtitle = broadcast.subtitle || null;
              
              db.upsertProgramKey(broadcast.programKey, description, title, subtitle);
              keysFound++;
            }
          }
        }
      }

      console.log(`[Scraper] Broadcasts scrape complete. Found ${keysFound} program keys.`);
    } catch (error) {
      console.error('[Scraper] Error scraping broadcasts endpoint:', error.message);
    }
  }

  // Start scraping intervals
  start() {
    console.log('[Scraper] Starting program key scraper...');
    console.log('[Scraper] - Live endpoint: every 1 minute');
    console.log('[Scraper] - Broadcasts endpoint: every 5 minutes');

    // Initial scrapes
    this.scrapeLive();
    this.scrapeBroadcasts();

    // Live endpoint every minute (60000ms)
    this.liveInterval = setInterval(() => {
      this.scrapeLive();
    }, 60000);

    // Broadcasts endpoint every 5 minutes (300000ms)
    this.broadcastsInterval = setInterval(() => {
      this.scrapeBroadcasts();
    }, 300000);

    console.log('[Scraper] Scraper started successfully');
  }

  // Stop scraping intervals
  stop() {
    console.log('[Scraper] Stopping program key scraper...');
    
    if (this.liveInterval) {
      clearInterval(this.liveInterval);
      this.liveInterval = null;
    }
    
    if (this.broadcastsInterval) {
      clearInterval(this.broadcastsInterval);
      this.broadcastsInterval = null;
    }

    console.log('[Scraper] Scraper stopped');
  }
}

export default new ProgramKeyScraper();
