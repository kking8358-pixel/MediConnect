import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
dotenv.config();

function getTransporter() {
  // Always read latest values from .env without requiring a server reboot
  dotenv.config({ override: true });

  const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : '';
  const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '').trim() : '';

  if (!user || !pass) {
    return null;
  }

  const isGmail = host.includes('gmail.com');

  return nodemailer.createTransport({
    ...(isGmail ? { service: 'gmail' } : { host, port }),
    secure: port === 465,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false
    }
  });
}

/**
 * Send an email with HTML and text content.
 * Gracefully falls back to formatted terminal simulation if SMTP is not configured.
 */
async function sendMail({ to, subject, html, text }) {
  const user = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : '';
  let from = (process.env.SMTP_FROM || '').trim();

  // Gmail SMTP strictly prohibits arbitrary From headers; must match authenticated user
  if (user && user.includes('@gmail.com')) {
    if (!from || !from.includes(user)) {
      from = `"MediConnect Health" <${user}>`;
    }
  } else if (!from) {
    from = '"MediConnect Health" <noreply@mediconnect.health>';
  }

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
 * Test SMTP connection and dispatch a diagnostic email
 */
export async function testEmailConnection(toEmail) {
  dotenv.config({ override: true });
  const user = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : '';
  const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '').trim() : '';

  if (!user || !pass) {
    return {
      success: false,
      error: 'SMTP_USER or SMTP_PASS is empty in .env. The system is operating in Terminal Simulation mode.',
      mode: 'simulated'
    };
  }

  const transporter = getTransporter();
  if (!transporter) {
    return { success: false, error: 'Failed to initialize Nodemailer transporter. Please verify SMTP_USER and SMTP_PASS in .env.' };
  }

  try {
    await transporter.verify();
  } catch (verifyErr) {
    return {
      success: false,
      stage: 'smtp_auth_verification',
      error: verifyErr.message,
      suggestion: 'Ensure Gmail 2-Step Verification is active and use a 16-character Google App Password (not your primary password).'
    };
  }

  const target = toEmail || user;
  const result = await sendMail({
    to: target,
    subject: 'MediConnect SMTP Test Notification',
    text: `Hello! This is a test email from your MediConnect platform. Your SMTP notification system is active and functioning properly!\nDispatched at: ${new Date().toISOString()}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #0D6E6E; border-radius: 8px;">
        <h2 style="color: #0D6E6E;">MediConnect Notification Test</h2>
        <p>Your SMTP mail notification service is <strong>successfully configured and running</strong>!</p>
        <p><strong>Dispatched to:</strong> ${target}</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      </div>
    `
  });

  return { success: true, target, result };
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
      <p style="font-size: 11px; color: #888; margin-top: 24px; border-top: 1px dashed #ccc; padding-top: 12px;">
        MediConnect Healthcare Platform &bull; Automated notification. Please do not reply directly to this email.
      </p>
    </div>
  `;

  const adminUser = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : '';
  const isDemoEmail = !patientEmail || patientEmail.endsWith('@mediconnect.health') || patientEmail.endsWith('@example.com');
  const targetEmail = (isDemoEmail && adminUser) ? adminUser : patientEmail;

  if (isDemoEmail && adminUser) {
    console.log(`[Mail Service] Note: Patient "${patientName}" has demo address (${patientEmail}). Delivering notification to configured SMTP inbox: ${adminUser}`);
  }

  return sendMail({ to: targetEmail, subject, text, html });
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

  const adminUser = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : '';
  const isDemoEmail = !doctorEmail ||
    doctorEmail.endsWith('@mediconnect.health') ||
    doctorEmail.endsWith('@squarehospital.com') ||
    doctorEmail.endsWith('@evercarebd.com') ||
    doctorEmail.endsWith('@unitedhospital.com') ||
    doctorEmail.endsWith('@labaid.com') ||
    doctorEmail.endsWith('@dmch.gov.bd') ||
    doctorEmail.endsWith('.gov.bd') ||
    doctorEmail.endsWith('@example.com');
  const targetEmail = (isDemoEmail && adminUser) ? adminUser : doctorEmail;

  if (isDemoEmail && adminUser) {
    console.log(`[Mail Service] Note: Doctor "${doctorName}" has mock hospital address (${doctorEmail}). Delivering notification to configured SMTP inbox: ${adminUser}`);
  }

  return sendMail({ to: targetEmail, subject, text, html });
}

/**
 * Send password reset verification code email
 */
export async function sendPasswordResetEmail({ to, name, code }) {
  const subject = `MediConnect Security: Your Password Reset Verification Code [${code}]`;
  const text = `
Dear ${name || 'User'},

We received a request to reset your MediConnect account password.

Your 6-digit verification code is: ${code}

This code will expire in 15 minutes. If you did not initiate this request, you can safely ignore this email; your account remains secure.

MediConnect Healthcare Security Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 2px solid #000; background: #faf8f5; color: #111;">
      <div style="border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 18px;">
        <h2 style="margin: 0; text-transform: uppercase; letter-spacing: 1px; color: #111;">MediConnect Security</h2>
        <p style="margin: 4px 0 0 0; font-size: 11px; font-family: monospace; color: #666; text-transform: uppercase;">PASSWORD RECOVERY VERIFICATION</p>
      </div>
      <p style="font-size: 14px; margin-bottom: 16px;">Hello <strong>${name || 'Member'}</strong>,</p>
      <p style="font-size: 13px; line-height: 1.5; color: #444;">
        We received a request to reset your MediConnect account credentials. Enter the verification code below to set a new password:
      </p>
      <div style="text-align: center; margin: 24px 0; padding: 18px; background: #fff; border: 2px solid #000;">
        <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #000;">${code}</span>
      </div>
      <p style="font-size: 12px; color: #666; line-height: 1.5;">
        This security code will expire in <strong>15 minutes</strong>. If you did not request a password reset, please ignore this email; your password remains unchanged.
      </p>
      <p style="font-size: 11px; color: #888; margin-top: 24px; border-top: 1px dashed #ccc; padding-top: 12px; font-family: monospace; text-transform: uppercase;">
        MediConnect Healthcare Platform &bull; Automated Security Dispatch
      </p>
    </div>
  `;

  const adminUser = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : '';
  const isDemoEmail = !to || to.endsWith('@mediconnect.health') || to.endsWith('@example.com') || to.endsWith('@squarehospital.com') || to.endsWith('@evercarebd.com');
  const targetEmail = (isDemoEmail && adminUser) ? adminUser : to;

  if (isDemoEmail && adminUser) {
    console.log(`[Mail Service] Note: Account "${name}" has demo address (${to}). Delivering password reset code to configured SMTP inbox: ${adminUser}`);
  }

  return sendMail({ to: targetEmail, subject, text, html });
}

