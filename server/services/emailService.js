import dotenv from 'dotenv';
dotenv.config();

let nodemailerModule = null;
try {
  // Dynamically import nodemailer if installed
  nodemailerModule = await import('nodemailer');
} catch {
  // nodemailer not installed yet, will use simulated logger fallback
  nodemailerModule = null;
}

function getTransporter() {
  if (!nodemailerModule) return null;

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailerModule.default.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

/**
 * Send an email with HTML and text content.
 * Gracefully falls back to formatted terminal simulation if SMTP is not configured.
 */
async function sendMail({ to, subject, html, text }) {
  const from = process.env.SMTP_FROM || '"MediConnect Health" <noreply@mediconnect.health>';
  const transporter = getTransporter();

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html
      });
      console.log(`[Mail Service] Real email sent to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId, mode: 'smtp' };
    } catch (err) {
      console.error(`[Mail Service] [WARN] SMTP send failed to ${to}: ${err.message}. Falling back to simulation.`);
    }
  }

  // Simulated email delivery (ideal for university demo / CSE470 evaluations)
  console.log('\n================== [EMAIL NOTIFICATION DISPATCHED] ==================');
  console.log(`To:      ${to}`);
  console.log(`From:    ${from}`);
  console.log(`Subject: ${subject}`);
  console.log('------------------------------------------------------------------------');
  console.log(text.trim());
  console.log('========================================================================\n');

  return { success: true, mode: 'simulated' };
}

/**
 * Send confirmation email to the Patient
 */
export async function sendPatientAppointmentConfirmation({
  patientEmail,
  patientName,
  doctorName,
  doctorSpecialty,
  hospitalName,
  date,
  timeSlot,
  consultationFee,
  appointmentId
}) {
  const subject = `Appointment Confirmed with ${doctorName} (Ref: ${appointmentId.toUpperCase()})`;
  const text = `
Dear ${patientName},

Your appointment has been successfully confirmed on MediConnect!

Doctor: ${doctorName} (${doctorSpecialty})
Hospital / Clinic: ${hospitalName}
Date: ${date}
Time Slot: ${timeSlot}
Consultation Fee: BDT ${consultationFee} (Payable at Hospital)
Reference ID: ${appointmentId.toUpperCase()}

Instructions:
- Please arrive at least 15 minutes before your scheduled slot.
- Bring any previous prescriptions, diagnostic reports, and medical notes.
- If you need to reschedule or cancel, you can manage it from your MediConnect dashboard.

Stay healthy,
MediConnect Clinical Coordination Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #000; background: #faf8f5; color: #111;">
      <div style="border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 16px;">
        <h2 style="margin: 0; text-transform: uppercase; letter-spacing: 1px; color: #0D6E6E;">MediConnect Clinical</h2>
        <p style="margin: 4px 0 0 0; font-size: 12px; font-family: monospace; color: #666;">APPOINTMENT CONFIRMATION RECEIPT</p>
      </div>
      
      <p>Dear <strong>${patientName}</strong>,</p>
      <p>Your medical appointment has been successfully booked with <strong>${doctorName}</strong>.</p>
      
      <div style="background: #fff; border: 1px solid #ddd; padding: 16px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #666; width: 40%;">Doctor:</td>
            <td style="padding: 6px 0; font-weight: bold;">${doctorName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666;">Specialty:</td>
            <td style="padding: 6px 0; font-weight: bold;">${doctorSpecialty}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666;">Hospital / Clinic:</td>
            <td style="padding: 6px 0; font-weight: bold;">${hospitalName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666;">Scheduled Date:</td>
            <td style="padding: 6px 0; font-weight: bold;">${date}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666;">Time Slot:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #0D6E6E;">${timeSlot}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666;">Consultation Fee:</td>
            <td style="padding: 6px 0; font-weight: bold;">BDT ${consultationFee}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666;">Booking Reference:</td>
            <td style="padding: 6px 0; font-family: monospace; font-weight: bold;">${appointmentId.toUpperCase()}</td>
          </tr>
        </table>
      </div>

      <div style="font-size: 12px; color: #555; border-top: 1px solid #eee; padding-top: 12px;">
        <p style="margin: 0 0 6px 0;"><strong>Reminders:</strong></p>
        <ul style="margin: 0; padding-left: 18px;">
          <li>Please arrive at the clinic 15 minutes ahead of your slot.</li>
          <li>Carry your photo ID and previous diagnostic investigations.</li>
        </ul>
      </div>

      <p style="font-size: 11px; color: #888; margin-top: 24px; border-top: 1px dashed #ccc; padding-top: 12px;">
        MediConnect Healthcare Platform &bull; Automated notification. Please do not reply directly to this email.
      </p>
    </div>
  `;

  return sendMail({ to: patientEmail, subject, text, html });
}

/**
 * Send notification email to the Doctor
 */
export async function sendDoctorAppointmentAlert({
  doctorEmail,
  doctorName,
  patientName,
  patientPhone,
  patientAge,
  patientGender,
  date,
  timeSlot,
  notes,
  appointmentId
}) {
  const subject = `New Appointment: ${patientName} on ${date} at ${timeSlot}`;
  const text = `
Dear ${doctorName},

A new patient appointment has been scheduled with you on MediConnect.

Patient: ${patientName}
Phone: ${patientPhone}
${patientAge ? `Age/Gender: ${patientAge} yrs / ${patientGender || 'N/A'}` : ''}
Date: ${date}
Time Slot: ${timeSlot}
Reason / Clinical Notes: ${notes || 'Regular follow up'}
Reference ID: ${appointmentId.toUpperCase()}

Please review your schedule in the MediConnect Doctor Portal.

MediConnect Clinical Coordination Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #000; background: #faf8f5; color: #111;">
      <div style="border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 16px;">
        <h2 style="margin: 0; text-transform: uppercase; letter-spacing: 1px; color: #0D6E6E;">MediConnect Doctor Portal</h2>
        <p style="margin: 4px 0 0 0; font-size: 12px; font-family: monospace; color: #666;">NEW APPOINTMENT ALERT</p>
      </div>

      <p>Dear <strong>${doctorName}</strong>,</p>
      <p>A new consultation has been booked for your schedule.</p>

      <div style="background: #fff; border: 1px solid #ddd; padding: 16px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #666; width: 40%;">Patient Name:</td>
            <td style="padding: 6px 0; font-weight: bold;">${patientName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666;">Contact Phone:</td>
            <td style="padding: 6px 0; font-weight: bold;">${patientPhone}</td>
          </tr>
          ${patientAge ? `<tr><td style="padding: 6px 0; color: #666;">Demographics:</td><td style="padding: 6px 0;">${patientAge} yrs, ${patientGender || 'Unspecified'}</td></tr>` : ''}
          <tr>
            <td style="padding: 6px 0; color: #666;">Date:</td>
            <td style="padding: 6px 0; font-weight: bold;">${date}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666;">Booked Time Slot:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #0D6E6E;">${timeSlot}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666;">Patient Notes:</td>
            <td style="padding: 6px 0; font-style: italic;">${notes || 'Consultation follow up'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666;">Reference ID:</td>
            <td style="padding: 6px 0; font-family: monospace; font-weight: bold;">${appointmentId.toUpperCase()}</td>
          </tr>
        </table>
      </div>

      <p style="font-size: 11px; color: #888; margin-top: 24px; border-top: 1px dashed #ccc; padding-top: 12px;">
        You can review and prescribe notes for this appointment in your Doctor Portal.
      </p>
    </div>
  `;

  return sendMail({ to: doctorEmail, subject, text, html });
}
