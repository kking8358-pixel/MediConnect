import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { UserModel } from './models/User.js';
import { HospitalModel } from './models/Hospital.js';
import { RuleModel } from './models/Rule.js';
import { MedicineReminderModel } from './models/MedicineReminder.js';
import { HealthReportModel } from './models/HealthReport.js';

import {
  INITIAL_DOCTORS,
  INITIAL_HOSPITALS,
  INITIAL_RULES,
  INITIAL_PATIENT,
  INITIAL_REMINDERS,
  INITIAL_REPORTS
} from './seedData.js';

dotenv.config();

async function seedDatabase() {
  console.log('\n[MongoDB Seeder] Starting database seed...');
  const connected = await connectDB();

  if (!connected) {
    console.error('[MongoDB Seeder] [ERROR] Cannot seed database without a working MongoDB Atlas connection.');
    console.error('Please set MONGODB_URI in your .env file and run `npm run seed` again.\n');
    process.exit(1);
  }

  try {
    // 1. Seed Admin & Patient
    console.log('[Seeder] Seeding Users (Admin & Demo Patient)...');
    const adminUser = {
      id: 'admin-1',
      role: 'admin',
      name: 'System Admin (MediConnect HQ)',
      email: 'admin@mediconnect.health',
      phone: '+880 1800-000000',
      isVerified: true,
      language: 'en',
      permissions: ['all'],
      createdAt: '2026-01-01T00:00:00.000Z'
    };

    await UserModel.findOneAndUpdate({ id: adminUser.id }, { $set: adminUser }, { upsert: true });
    await UserModel.findOneAndUpdate({ id: INITIAL_PATIENT.id }, { $set: INITIAL_PATIENT }, { upsert: true });

    // 2. Seed Doctors
    console.log(`[Seeder] Seeding ${INITIAL_DOCTORS.length} Doctors...`);
    for (const doc of INITIAL_DOCTORS) {
      await UserModel.findOneAndUpdate({ id: doc.id }, { $set: doc }, { upsert: true });
    }

    // 3. Seed Hospitals
    console.log(`[Seeder] Seeding ${INITIAL_HOSPITALS.length} Hospitals...`);
    for (const hosp of INITIAL_HOSPITALS) {
      await HospitalModel.findOneAndUpdate({ id: hosp.id }, { $set: hosp }, { upsert: true });
    }

    // 4. Seed Clinical Rules
    console.log(`[Seeder] Seeding ${INITIAL_RULES.length} Clinical Rules...`);
    for (const rule of INITIAL_RULES) {
      await RuleModel.findOneAndUpdate({ id: rule.id }, { $set: rule }, { upsert: true });
    }

    // 5. Seed Medicine Reminders
    console.log(`[Seeder] Seeding ${INITIAL_REMINDERS.length} Medicine Reminders...`);
    for (const rem of INITIAL_REMINDERS) {
      await MedicineReminderModel.findOneAndUpdate({ id: rem.id }, { $set: rem }, { upsert: true });
    }

    // 6. Seed Health Reports
    console.log(`[Seeder] Seeding ${INITIAL_REPORTS.length} Health Reports...`);
    for (const rep of INITIAL_REPORTS) {
      await HealthReportModel.findOneAndUpdate({ id: rep.id }, { $set: rep }, { upsert: true });
    }

    console.log('\n[MongoDB Seeder] Database seeded successfully into MongoDB Atlas!\n');
    process.exit(0);
  } catch (error) {
    console.error('[MongoDB Seeder] [ERROR] Error seeding database:', error.message);
    process.exit(1);
  }
}

seedDatabase();
