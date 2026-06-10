# 🆘 Disaster Relief Coordination System

A **full-stack database project** built for the Database Systems course at FAST-NUCES (4th Semester).

## 📌 About
A complete disaster relief management platform for coordinating disaster events, victims, volunteers, shelters, supply logistics, organizations, and donation tracking in real-time relief operations.

## 🚀 Features
- **Disaster Management** — Track disaster events by type, severity, and status
- **Victim & Volunteer Tracking** — Manage affected persons and relief volunteers
- **Shelter Management** — Monitor shelter capacity and occupancy in real-time
- **Supply & Logistics** — Track food, medical, and equipment supplies across hubs
- **Donation System** — Record donors and donations linked to organizations
- **Live Dashboard** — Aggregate stats pulled directly from Oracle database
- **Full CRUD** — Create, Read, Update, Delete across 10+ entities
- **Live Search** — Real-time filtering without page reload
- **REST API** — Separate Express routes per entity

## 🛠️ Tech Stack
- **Database:** Oracle XE — 20+ normalized tables, EERD design with superclass/subclass hierarchy
- **Backend:** Node.js + Express with oracledb connection pool
- **Frontend:** Vanilla HTML, CSS, JavaScript
- **Concepts:** Normalization (3NF), Foreign Key constraints, Oracle Views, PL/SQL

## 🗂️ Project Structure
```
├── disaster_relief.sql       # Full Oracle SQL schema + sample data
├── backend/
│   ├── server.js             # Main Express server (port 5000)
│   ├── db.js                 # Oracle connection pool
│   └── routes/               # REST API routes per entity
│       ├── disasters.js
│       ├── victims.js
│       ├── volunteers.js
│       ├── shelters.js
│       ├── supplies.js
│       ├── donors.js
│       ├── donations.js
│       └── ...
└── frontend/
    ├── index.html            # Complete web UI
    └── styles.css            # Frontend styling
```

## ▶️ How to Run
```bash
# Step 1 — Run SQL schema in Oracle SQL Developer (F5)
# Step 2 — Add Oracle password to backend/.env
# Step 3 — Install dependencies
cd backend
npm install

# Step 4 — Start server
node server.js

# Step 5 — Open browser
# http://localhost:5000
```

## 👩‍💻 Authors
**Manal Shahnawaz** — BS Software Engineering, FAST-NUCES (CF Campus)  
**Musferah** — BS Software Engineering, FAST-NUCES (CF Campus)  
📧 manalshahnawaz1@gmail.com  
🔗 [LinkedIn](https://linkedin.com/in/manal-shahnawaz-)
