import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('MediConnect PDF Generation Test', 20, 25);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('This is a validation test for jsPDF in Node.js ESM environment.', 20, 35);

  const outputPath = path.resolve(__dirname, '../test_output.pdf');
  const buffer = Buffer.from(doc.output('arraybuffer'));
  fs.writeFileSync(outputPath, buffer);
  console.log('[PDF Test] Successfully generated:', outputPath, 'Bytes:', buffer.length);
} catch (err) {
  console.error('[PDF Test] Failed:', err);
}
