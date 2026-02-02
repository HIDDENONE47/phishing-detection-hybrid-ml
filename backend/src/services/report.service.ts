import PDFDocument from 'pdfkit';
import ScanHistory, { IScanHistory } from '../models/ScanHistory';

interface ReportStats {
    totalScans: number;
    phishingDetected: number;
    safeScans: number;
    averageScore: number;
    scansByType: { type: string; count: number }[];
}

export class ReportService {
    async getStats(userId: string, timeRange: string, scanType: string): Promise<ReportStats> {
        const query = this.buildQuery(userId, timeRange, scanType);

        const scans = await ScanHistory.find(query);

        const totalScans = scans.length;
        const phishingDetected = scans.filter(s => s.result.isPhishing).length;
        const safeScans = totalScans - phishingDetected;

        const totalScore = scans.reduce((acc, scan) => {
            let score = scan.result.confidence;
            if (scan.result.isPhishing) {
                return acc + (100 - score); // Phishing = low safety score
            } else {
                return acc + score; // Safe = high safety score
            }
        }, 0);

        const averageScore = totalScans > 0 ? Math.round(totalScore / totalScans) : 0;

        const scansByType = [
            { type: 'url', count: scans.filter(s => s.type === 'url').length },
            { type: 'email', count: scans.filter(s => s.type === 'email').length }
        ];

        return {
            totalScans,
            phishingDetected,
            safeScans,
            averageScore,
            scansByType
        };
    }

    async generatePDF(userId: string, timeRange: string, scanType: string): Promise<Buffer> {
        const query = this.buildQuery(userId, timeRange, scanType);
        const scans = await ScanHistory.find(query).sort({ createdAt: -1 });
        const stats = await this.getStats(userId, timeRange, scanType);

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            // --- Header ---
            doc.fillColor('#444444').fontSize(20).text('PhishLens Security Report', { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
            doc.moveDown(2);

            // --- Summary Section ---
            doc.rect(50, 150, 510, 110).fillAndStroke('#f3f4f6', '#e5e7eb');
            doc.fillColor('#111827').fontSize(16).text('Executive Summary', 70, 165);
            doc.moveDown(0.5);

            doc.fontSize(12).text(`Total Scans: ${stats.totalScans}`, 70, 195);
            doc.text(`Phishing Detected: ${stats.phishingDetected}`, 70, 215);
            doc.text(`Safe Scans: ${stats.safeScans}`, 300, 195);

            // Fix Score Logic: 0% risk is 100% safe
            doc.text(`Average Safety Score: ${stats.averageScore}%`, 300, 215);
            doc.moveDown(4);

            // --- Scan History ---
            doc.fillColor('#111827').fontSize(16).text('Recent Scan History', 50, 300);
            doc.moveDown();

            if (scans.length === 0) {
                doc.fontSize(12).text('No scans found for the selected period.', 50, 330);
            } else {
                let y = 330;

                scans.forEach((scan, index) => {
                    if (y > 700) {
                        doc.addPage();
                        y = 50;
                    }

                    const isPhishing = scan.result.isPhishing;
                    const statusText = isPhishing ? 'PHISHING' : 'SAFE';
                    const statusColor = isPhishing ? '#EF4444' : '#10B981'; // Red or Green
                    const score = isPhishing ?
                        `Risk: ${Math.round(scan.result.confidence)}%` :
                        `Secure (${Math.round(scan.result.confidence)}% Confidence)`;

                    // Validating content length to prevent overflow
                    const content = scan.content.length > 60 ? scan.content.substring(0, 57) + '...' : scan.content;

                    // Row background
                    if (index % 2 === 0) {
                        doc.rect(50, y - 5, 510, 50).fillOpacity(0.5).fill('#f9fafb').fillOpacity(1);
                    }

                    // Icon/Type
                    doc.fillColor('#6B7280').fontSize(10).text(`[${scan.type.toUpperCase()}]`, 60, y);
                    doc.text(new Date(scan.createdAt).toLocaleString(), 400, y, { align: 'right' });

                    // Target
                    doc.fillColor('#111827').fontSize(12).text(content, 60, y + 15);

                    // Risk Badge
                    doc.rect(450, y + 12, 100, 20).fillAndStroke(isPhishing ? '#fee2e2' : '#d1fae5', isPhishing ? '#fecaca' : '#a7f3d0');
                    doc.fillColor(statusColor).fontSize(10).text(statusText, 450, y + 17, { width: 100, align: 'center' });

                    y += 50;
                });
            }

            doc.end();
        });
    }

    async generateSingleScanPDF(userId: string, scanId: string): Promise<Buffer> {
        const scan = await ScanHistory.findOne({ _id: scanId, userId });
        if (!scan) throw new Error('Scan not found');

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            // --- Styled like 'SECURITY INCIDENT REPORT' template ---

            // --- Helper Functions for Styling ---
            const drawSectionHeader = (y: number, number: string, title: string) => {
                doc.rect(50, y, 495, 25)
                    .fill('#e6f0ff'); // Light blue background

                doc.fillColor('#000000')
                    .font('Helvetica-Bold')
                    .fontSize(12)
                    .text(`${number}. ${title}`, 60, y + 7);
            };

            const drawField = (y: number, label: string, value: string, valueColor: string = '#000000', isBold: boolean = false) => {
                doc.font('Helvetica-Bold').fontSize(10).fillColor('#444444')
                    .text(label, 50, y);

                doc.font(isBold ? 'Helvetica-Bold' : 'Helvetica').fontSize(10).fillColor(valueColor)
                    .text(value, 200, y);
            };

            // --- Title Section ---
            doc.font('Helvetica-Bold').fontSize(18).fillColor('#222222')
                .text('SECURITY INCIDENT REPORT', { align: 'center' });

            doc.font('Helvetica-Oblique').fontSize(10).fillColor('#666666')
                .text('Generated by PhishLensee', { align: 'center' });

            doc.moveDown(2);

            let currentY = doc.y;

            // --- 1. Report Information ---
            drawSectionHeader(currentY, '1', 'Report Information');
            currentY += 35;

            drawField(currentY, 'Report ID:', scan._id.toString());
            currentY += 15;
            drawField(currentY, 'Generated:', new Date().toLocaleString());
            currentY += 15;
            drawField(currentY, 'Report Type:', 'Phishing Analysis Report');
            currentY += 15;
            drawField(currentY, 'Scan Type:', scan.type.toUpperCase());

            currentY += 25;

            // --- 2. Executive Summary ---
            drawSectionHeader(currentY, '2', 'Executive Summary');
            currentY += 35;

            const isPhishing = scan.result.isPhishing;
            const statusText = isPhishing ? 'THREAT DETECTED' : 'NO THREAT DETECTED';
            const statusColor = isPhishing ? '#D32F2F' : '#388E3C'; // Red or Green

            doc.font('Helvetica-Bold').fontSize(12).fillColor(statusColor)
                .text(statusText, { align: 'center' });

            currentY = doc.y + 10;

            doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000').text('Risk Assessment:');
            doc.font('Helvetica').fontSize(10).fillColor('#333333')
                .text(
                    isPhishing
                        ? `High risk detected. The ${scan.type} contains patterns consistent with phishing attacks. Immediate action recommended.`
                        : `Analysis indicates this ${scan.type} is safe. No malicious patterns were detected based on current threat intelligence.`
                    , { align: 'justify', width: 495 });

            doc.moveDown();

            doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000').text('Recommendations:');
            const recommendations = isPhishing
                ? [
                    'Do not click any links or download attachments.',
                    'Block the sender/domain immediately.',
                    'Report this incident to your IT security team.',
                    'Delete the email/message permanently.'
                ]
                : [
                    'Proceed with caution as per standard safety protocols.',
                    'Verify the sender identity if unexpected.',
                    'No immediate blocking required.'
                ];

            recommendations.forEach((rec, i) => {
                doc.font('Helvetica').fontSize(10).text(`${i + 1}. ${rec}`, { indent: 10 });
            });

            currentY = doc.y + 20;

            // --- 3. Threat Identification ---
            drawSectionHeader(currentY, '3', 'Threat Identification');
            currentY += 35;

            drawField(currentY, 'Content Scanned:', scan.content.length > 50 ? scan.content.substring(0, 50) + '...' : scan.content);
            currentY += 15;
            drawField(currentY, 'Threat Type:', isPhishing ? 'Phishing / Malicious' : 'Benign / Safe', isPhishing ? '#D32F2F' : '#388E3C', true);
            currentY += 15;
            drawField(currentY, 'Confidence Score:', `${Math.round(scan.result.confidence)}%`);
            currentY += 15;
            drawField(currentY, 'Detection Time:', new Date(scan.createdAt).toLocaleString());
            currentY += 25;

            // --- 4. Technical Analysis (Feature-based) ---
            drawSectionHeader(currentY, '4', 'Technical Analysis');
            currentY += 35;

            const features = scan.result.features || {};
            if (Object.keys(features).length > 0) {
                Object.entries(features).forEach(([key, value]) => {
                    // Format key from snake_case or camelCase to Title Case
                    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);

                    if (currentY > 700) {
                        doc.addPage();
                        currentY = 50;
                    }

                    drawField(currentY, formattedKey + ':', displayValue);
                    currentY += 15;
                });
            } else {
                doc.font('Helvetica-Oblique').fontSize(10).text('No specific technical features extracted.', 50, currentY);
            }

            // Footer
            const bottom = doc.page.height - 50;
            doc.fontSize(8).fillColor('#aaaaaa').text('PhishLensee Security Automata', 50, bottom, { align: 'center' });

            doc.end();
        });
    }

    private buildQuery(userId: string, timeRange: string, scanType: string): any {
        const query: any = { userId };

        // Time Range
        const now = new Date();
        let startDate = new Date();
        switch (timeRange) {
            case '24h': startDate.setHours(now.getHours() - 24); break;
            case '7d': startDate.setDate(now.getDate() - 7); break;
            case '30d': startDate.setDate(now.getDate() - 30); break;
            case '90d': startDate.setDate(now.getDate() - 90); break;
            default: startDate.setDate(now.getDate() - 7); // Default 7d
        }
        query.createdAt = { $gte: startDate };

        // Scan Type
        if (scanType && scanType !== 'all') {
            query.type = scanType;
        }

        return query;
    }
    async getScanHistory(userId: string, limit: number = 10): Promise<IScanHistory[]> {
        console.log(`[getScanHistory] Querying for userId: ${userId} (${typeof userId})`);
        const history = await ScanHistory.find({ userId }).sort({ createdAt: -1 }).limit(limit);
        console.log(`[getScanHistory] Found ${history.length} records`);
        return history;
    }
}

export default new ReportService();
