import { Request, Response, NextFunction } from 'express';
import { ExportUserDataUseCase } from '../../application/use-cases/ExportUserDataUseCase';

export class UserController {
  constructor(private exportUserDataUseCase: ExportUserDataUseCase) {}

  exportData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const csv = await this.exportUserDataUseCase.execute(userId);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="athletia_export.csv"');
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  };
}
