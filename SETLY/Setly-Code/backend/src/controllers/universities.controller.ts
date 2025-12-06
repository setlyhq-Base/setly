import { Request, Response } from 'express';
import { UniversitiesService } from '../services/universities.service';

export class UniversitiesController {
  static async list(req: Request, res: Response) {
    try {
      // Extended behavior: optional city + query filtering
      const city = typeof req.query.city === 'string' ? req.query.city.trim() : '';
      const query = typeof req.query.query === 'string' ? (req.query.query as string).trim() : '';
      let list = await UniversitiesService.getAll();
      if (city) {
        const cityLower = city.toLowerCase();
        list = list.filter(u => (u.city || '').toLowerCase() === cityLower);
      }
      if (query) {
        list = UniversitiesService.searchInList(list, query, 25);
      }
      res.json({ count: list.length, list, city: city || undefined, query: query || undefined });
    } catch (e: any) {
      res.status(500).json({ error: 'failed_to_load_universities', message: e?.message });
    }
  }

  static async search(req: Request, res: Response) {
    try {
      const q = (req.query.q as string) || '';
      const limit = parseInt((req.query.limit as string) || '15', 10);
      const city = typeof req.query.city === 'string' ? req.query.city.trim() : '';
      let list = await UniversitiesService.getAll();
      if (city) {
        const cityLower = city.toLowerCase();
        list = list.filter(u => (u.city || '').toLowerCase() === cityLower);
      }
      const scored = UniversitiesService.searchInList(list, q, isFinite(limit) ? limit : 15);
      res.json({ query: q, count: scored.length, list: scored, city: city || undefined });
    } catch (e: any) {
      res.status(500).json({ error: 'failed_to_search_universities', message: e?.message });
    }
  }
}
