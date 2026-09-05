import { HealthReport } from '../types';

// Async with a dynamic import so the ~360kB jsPDF bundle is only
// downloaded when the user actually exports a PDF.
export async function generateHealthReportPDF(report: HealthReport): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const primaryColor = [13, 110, 110]; // Deep Surgical Teal #0D6E6E
  const darkSlate = [15, 23, 42]; // Primary Text #0F172A
  const textMuted = [71, 85, 105]; // Secondary #475569

  // Top Header Banner
  doc.setFillColor(13, 110, 110);
  doc.rect(0, 0, pageWidth, 28, 'F');

  // App Logo & Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('MediConnect — Clinical Health Report', 15, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('AI-Assisted Symptom Triage & Specialist Recommendation System', 15, 21);

  doc.setFontSize(8);
  doc.text(`Report ID: #${report.id.toUpperCase()}`, pageWidth - 15, 14, { align: 'right' });
  doc.text(`Date: ${new Date(report.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, pageWidth - 15, 21, { align: 'right' });

  // Patient Info Box
  let y = 38;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, y, pageWidth - 30, 26, 3, 3, 'FD');

  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Patient Identification', 20, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`Patient Name:`, 20, y + 16);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(`${report.patientName}`, 45, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`Age / Gender:`, 110, y + 16);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(`${report.patientAge || 26} yrs / ${report.patientGender || 'Unspecified'}`, 135, y + 16);

  // Symptoms Section
  y += 34;
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('1. Reported Symptoms', 15, y);

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  
  report.symptoms.forEach((sym, idx) => {
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(15, y + (idx * 7), pageWidth - 30, 6, 1.5, 1.5, 'F');
    doc.text(`• ${sym}`, 20, y + (idx * 7) + 4.2);
  });

  y += (report.symptoms.length * 7) + 6;

  // Rule Engine Diagnostic Findings
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('2. Rule-Based Triage Findings', 15, y);

  y += 6;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(15, y, pageWidth - 30, 32, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Probable Condition:', 20, y + 8);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`${report.condition}`, 60, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Recommended Specialist:', 20, y + 16);
  doc.setTextColor(13, 110, 110);
  doc.setFont('helvetica', 'bold');
  doc.text(`${report.specialist}`, 68, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Severity / Urgency Level:', 20, y + 24);
  
  const severityColor = report.severity === 'urgent' ? [239, 68, 68] : report.severity === 'moderate' ? [217, 119, 6] : [16, 185, 129];
  doc.setTextColor(severityColor[0], severityColor[1], severityColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(`${report.severity.toUpperCase()} (Confidence: ${report.confidence}%)`, 68, y + 24);

  // NOTE: jsPDF's built-in Helvetica font has no Bengali glyphs, so the PDF
  // intentionally renders canonical English clinical strings (which is what
  // reports store since the SymptomWizard language fix).
  const pageHeight = doc.internal.pageSize.getHeight();
  const footerReserve = 26;
  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - footerReserve) {
      doc.addPage();
      y = 20;
    }
  };

  // Doctor Clinical Notes & Prescriptions (if available)
  y += 40;
  if (report.doctorNotes && report.doctorNotes.length > 0) {
    ensureSpace(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('3. Verified Physician Notes & E-Prescription', 15, y);

    y += 6;
    report.doctorNotes.forEach(note => {
      // Pre-wrap all variable text so the box height fits the content.
      const diagnosisLines = doc.splitTextToSize(
        `Clinical Diagnosis: ${note.diagnosis}`, pageWidth - 45
      );
      const prescriptionLines = doc.splitTextToSize(note.prescription, pageWidth - 45);
      const adviceLines = note.advice
        ? doc.splitTextToSize(`Doctor Advice: ${note.advice}`, pageWidth - 45)
        : [];
      const boxH = 12 + diagnosisLines.length * 4.2 + 6 + prescriptionLines.length * 4.2 + 4 +
        (adviceLines.length > 0 ? adviceLines.length * 4.2 + 4 : 0);

      ensureSpace(boxH + 6);
      const boxY = y;
      doc.setFillColor(230, 244, 241); // Teal Tint #E6F4F1
      doc.setDrawColor(204, 236, 230); // Focus Border #CCECE6
      doc.roundedRect(15, boxY, pageWidth - 30, boxH, 2, 2, 'FD');

      let ly = boxY + 7;
      doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(`Consultant: ${note.doctorName} (${note.doctorSpecialty})`, 20, ly);
      ly += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text(diagnosisLines, 20, ly);
      ly += diagnosisLines.length * 4.2 + 2;

      doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(`Rx / Prescription:`, 20, ly);
      ly += 5;

      doc.setFont('helvetica', 'normal');
      doc.text(prescriptionLines, 20, ly);
      ly += prescriptionLines.length * 4.2 + 2;

      if (adviceLines.length > 0) {
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
        doc.text(adviceLines, 20, ly);
        ly += adviceLines.length * 4.2;
      }
      y = boxY + boxH + 6;
    });
  }

  // Footer & Disclaimer — stamped on every page.
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setDrawColor(226, 232, 240);
    doc.line(15, footerY - 4, pageWidth - 15, footerY - 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(
      'IMPORTANT DISCLAIMER: This document is generated as an informational decision-support aid. It does not replace a professional clinical diagnosis.',
      pageWidth / 2,
      footerY,
      { align: 'center' }
    );
    doc.text(
      `MediConnect Healthcare Network • Dhaka, Bangladesh • Helpline: 999 / 10678 • Page ${i}/${totalPages}`,
      pageWidth / 2,
      footerY + 5,
      { align: 'center' }
    );
  }

  // Save / Trigger Download
  doc.save(`MediConnect_Report_${report.id.toUpperCase()}.pdf`);
}
