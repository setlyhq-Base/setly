import { Request, Response } from 'express';
import { UniversitiesService } from '../services/universities.service';

export class UniversitiesController {
  static async list(req: Request, res: Response) {
    try {
      const list = await UniversitiesService.getAll();
      res.json({ count: list.length, list });
    } catch (e: any) {
      res.status(500).json({ error: 'failed_to_load_universities', message: e?.message });
    }
  }

  static async search(req: Request, res: Response) {
    try {
      const q = (req.query.q as string) || '';
      const limit = parseInt((req.query.limit as string) || '15', 10);
      const list = await UniversitiesService.search(q, isFinite(limit) ? limit : 15);
      res.json({ query: q, count: list.length, list });
    } catch (e: any) {
      res.status(500).json({ error: 'failed_to_search_universities', message: e?.message });
    }
  }
}
