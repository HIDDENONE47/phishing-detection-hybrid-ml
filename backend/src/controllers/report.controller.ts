import { Request, Response } from 'express';
import reportService from '../services/report.service';

export class ReportController {
    async getStats(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            const { timeRange = '7d', scanType = 'all' } = req.query;

            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const stats = await reportService.getStats(userId, timeRange as string, scanType as string);
            res.json(stats);
        } catch (error) {
            console.error('Get stats error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    async downloadReport(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            const { timeRange = '7d', scanType = 'all' } = req.query;

            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const pdfBuffer = await reportService.generatePDF(userId, timeRange as string, scanType as string);

            // Send as generic binary data to prevent IDM using Content-Type/Disposition to intercept
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Length', pdfBuffer.length);
            // res.setHeader('Content-Disposition', `attachment; filename=...`); // Removed to bypass IDM
            res.send(pdfBuffer);
        } catch (error) {
            console.error('Download report error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    async downloadSingleReport(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            const { scanId } = req.params;

            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const pdfBuffer = await reportService.generateSingleScanPDF(userId, scanId);

            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Length', pdfBuffer.length);
            res.send(pdfBuffer);
        } catch (error) {
            console.error('Download single report error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    async getHistory(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            const limit = parseInt(req.query.limit as string) || 10;

            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const history = await reportService.getScanHistory(userId, limit);
            res.json(history);
        } catch (error) {
            console.error('Get history error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
}

export default new ReportController();
