# MediConnect

MediConnect is a web-based healthcare coordination platform built with React, TypeScript, and Vite. It gives patients, doctors, and administrators separate workflows for discovering care, reviewing health information, managing appointments, and following medication reminders.

## Features

- Guest landing experience with access to symptom checking and emergency guidance
- Patient, doctor, and administrator dashboards with role-based access
- Symptom checker that matches selected symptoms to configurable clinical rules
- Doctor directory with specialty, hospital, availability, ratings, and booking flows
- Appointment booking, rescheduling, cancellation, and status tracking
- Health reports that can be reviewed and shared with doctors
- Doctor notes, prescriptions, and recommended tests
- Medicine reminders with dose status, snooze support, and live dose alerts
- Hospital discovery with location and emergency contact information
- Emergency assistance modal for urgent situations
- English and Bengali language support
- PDF health-report generation
- Responsive interface styled with Tailwind CSS and custom clinical status colors

## Technology

- React 18
- TypeScript 5
- Vite 6
- Tailwind CSS
- Recharts for dashboard visualizations
- jsPDF for report generation
- Lucide React for icons

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm

### Installation

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

### Create a production build

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Starts the Vite development server |
| `npm run build` | Type-checks the project and creates a production build |
| `npm run preview` | Serves the production build locally |

## Project Structure

```text
src/
├── components/       Reusable UI and feature components
├── context/           Authentication and application data state
├── data/              Seed users, hospitals, symptoms, and clinical rules
├── i18n/              English and Bengali translations
├── services/          Rule evaluation and PDF report generation
└── types/             Shared TypeScript domain models
```

## Data and Authentication

This repository is a front-end demonstration. Seed data is loaded from `src/data/mockData.ts`, and account/session data is stored in the browser's `localStorage`. Newly registered demo accounts can validate their password on the same device, but this is not a production authentication system.

There is no backend, database, real OTP delivery, or external medical-service integration in this version. A production deployment should move authentication, authorization, personal health information, clinical rules, appointments, and file generation to secure server-side services.

## Medical Disclaimer

MediConnect is an educational/demo application. Its symptom checker provides informational triage suggestions and must not be used as a diagnosis or as a replacement for a qualified healthcare professional. In an emergency, contact local emergency services or go to the nearest emergency department.

## License

No license has been specified for this project yet.