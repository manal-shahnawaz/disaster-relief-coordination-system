<<<<<<< HEAD
# DISASTER RELIEF COORDINATION SYSTEM

Disaster Relief Coordination System is a full-stack database project for managing disaster events, victims, volunteers, shelters, supply logistics, organizations, and donation tracking in real-time relief operations.

# Project Overview
This project includes:

- Oracle XE relational database schema based on EERD design, featuring superclass/subclass hierarchies, disjoint specialization, multivalued attributes, and a derived attribute via Oracle View.
- Node.js + Express backend with Oracle XE connection using the oracledb package and separate REST API routes per entity.
- Vanilla HTML/CSS/JS frontend with full CRUD across 10 tables, live search, modal forms, and toast notifications.

---

## WHAT YOU HAVE

```
disaster-relief/
├── backend/
│   ├── server.js          ← Main Express server (runs on port 5000)
│   ├── db.js              ← Oracle connection pool
│   ├── .env               ← YOUR PASSWORD GOES HERE
│   ├── package.json       ← Node.js dependencies
│   └── routes/
│       ├── disasters.js
│       ├── persons.js
│       ├── victims.js
│       ├── volunteers.js
│       ├── shelters.js
│       ├── supplies.js
│       ├── hubs.js
│       ├── orgs.js
│       ├── donors.js
│       ├── donations.js
│       └── stats.js
├── frontend/
│   └── index.html         ← Complete web (served by backend)
|   └── style.css          ← Styling for the frontend
└── disaster_relief.sql    ← Full Oracle SQL schema + sample data
```

---

## STEP 1 — Run the SQL Script in SQL Developer

This creates all your tables and inserts sample data.

1. Open **Oracle SQL Developer**
2. Connect to your database (your existing connection)
3. Click **File → Open** and select `disaster_relief.sql`
4. Press **F5** (Run Script) — NOT F9 (Run Statement)
   - F5 runs the entire file at once
   - Wait for it to finish — you'll see output in the bottom panel
5. Look for: `Commit complete` at the end
6. Verify tables were created:
   ```sql
   SELECT table_name FROM user_tables ORDER BY table_name;
   ```
   You should see: BENEFICIARY, BENEFICIARY_SUPPLY, DISASTER, DONATION,
   DONATES_TO, DONOR, EQUIPMENT_SUPPLY, FOOD_SUPPLY, LOGISTICS_HUB,
   MAKES, MEDICAL_SUPPLY, ORGANIZATION, PERSON, RECEIVED_BY, SHELTER,
   SUPPLY, VICTIM, VICTIM_NEEDS, VOLUNTEER, VOLUNTEER_SKILLS


---

## STEP 2 — Find Your Oracle Password

You need your Oracle XE password for the `.env` file.

**Option A — You remember it:**
Just use it. Skip to Step 3.

**Option B — Try common defaults:**
Try these in SQL Developer File → New Connection:
- Username: `system`, Password: `oracle`
- Username: `system`, Password: `1234`
- Username: `system`, Password: `system`
- Username: `hr`, Password: `hr`

**Option C — Reset it (last resort):**
1. Open Command Prompt as Administrator
2. Run:
   ```
   sqlplus / as sysdba
   ```
3. Then type:
   ```sql
   ALTER USER system IDENTIFIED BY newpassword123;
   EXIT;
   ```
4. Your new password is now `newpassword123`

**Option D — Check your SQL Developer connection:**
1. In SQL Developer, right-click your existing connection
2. Click **Properties**
3. The password field will be filled (starred) — click **Test** to confirm it works
4. You can't see the actual password, but you can reset it using Option C

---

## STEP 3 — Edit the .env File

1. Open `backend/.env` in Notepad or VS Code
2. It looks like this:
   ```
   DB_USER=system
   DB_PASSWORD=YOUR_ORACLE_PASSWORD_HERE
   DB_CONNECTION=localhost:1521/XE
   PORT=5000
   ```
3. Replace `YOUR_ORACLE_PASSWORD_HERE` with your actual Oracle password
4. Save the file

**If your connection string is different** (e.g. you use a PDB):
- Try `localhost:1521/XEPDB1` instead of `localhost:1521/XE`
- Or check SQL Developer → your connection → Properties → Service name

---

## STEP 4 — Install Node.js Dependencies

1. Open **Command Prompt** or **Windows Terminal**
2. Navigate to the backend folder:
   ```
   cd path\to\disaster-relief\backend
   ```
   Example:
   ```
   cd C:\Users\Musferah\Desktop\disaster-relief\backend
   ```
3. Run:
   ```
   npm install
   ```
4. Wait for it to finish. You'll see packages being downloaded.
   - This installs: express, oracledb, cors, dotenv

**If npm is not recognized:**
- Node.js is installed but not in PATH
- Restart your terminal, or reinstall Node.js from nodejs.org

---

## STEP 5 — Start the Backend Server

Still in the `backend` folder, run:
```
node server.js
OR 
npm start
```

You should see:
```
✅ Oracle connection pool created
🚀 Server running at http://localhost:5000
```

**If you see an error:**

| Error Message | Fix |
|---|---|
| `ORA-01017: invalid username/password` | Wrong password in .env |
| `ORA-12541: No listener` | Oracle XE is not running — start it |
| `ORA-12514: listener does not know of service` | Change XE to XEPDB1 in .env |
| `Cannot find module 'oracledb'` | Run `npm install` again |
| `EADDRINUSE port 5000` | Change PORT=5001 in .env |

**How to start Oracle XE if it's not running:**
1. Press Win + R, type `services.msc`, press Enter
2. Find `OracleServiceXE` → Right-click → Start
3. Find `OracleXETNSListener` → Right-click → Start
4. Try `node server.js` again

---

## STEP 6 — Open the Web App

1. Keep the terminal running (DO NOT close it)
2. Open your browser
3. Go to: **http://localhost:5000**
4. You should see the Disaster Relief Coordination System dashboard

---

## STEP 7 — Test All 4 CRUD Operations


### ✅ CREATE (INSERT)
1. Click **Disasters** in the sidebar
2. Click **+ Add Disaster**
3. Fill in: ID=DIS099, Type=Tsunami, Severity=Critical, Status=Active, Date=2025-01-01
4. Click **INSERT Record**
5. ✓ New row appears in the table

### ✅ READ (SELECT)
1. Data loads automatically when you click any sidebar item
2. Use the search box to filter — type "Flood" in Disasters search
3. The table filters live without a page reload
4. Dashboard stats pull live aggregate data from Oracle

### ✅ UPDATE (UPDATE ... SET)
1. On any table, click the **Edit** button on any row
2. Modify the field(s) shown
3. Click **UPDATE Record**
4. ✓ The table refreshes with updated data from Oracle

### ✅ DELETE (DELETE FROM)
1. On any table, click the **Delete** button on any row
2. Confirm the dialog
3. ✓ Row is removed from Oracle and table refreshes
4. FK constraints are enforced — e.g. deleting a Person who is a Victim will show an Oracle error

---


## TROUBLESHOOTING

**Web app shows "Loading…" forever:**
- Backend is not running → go to terminal, run `node server.js`
- Oracle is not running → start OracleServiceXE in services.msc

**API returns errors:**
- Open browser DevTools (F12) → Console tab → see exact error
- Or check the terminal where `node server.js` is running

**Tables are empty after running SQL:**
- Make sure you ran F5 (Run Script), not F9 (Run Statement)
- Check SQL Developer output panel for errors
- Make sure COMMIT ran at the end

**oracledb install fails:**
- This is common. Run:
  ```
  npm install oracledb --save
  ```
- If still failing, you may need Oracle Instant Client
- Download from: oracle.com/database/technologies/instant-client/downloads.html
- Extract and add to PATH, then retry npm install

---

## QUICK COMMAND REFERENCE

```bash
# Navigate to backend
cd path\to\disaster-relief\backend

# Install dependencies (first time only)
npm install

# Start the server
node server.js

# Open the app
# Browser → http://localhost:5000
```

---

## Git Ignore

**The project excludes:**
- node_modules/
- .env
- .log
=======
# disaster-relief-coordination-system
Full-Stack Disaster Relief Management System | Oracle SQL | Node.js | REST API | HTML/CSS
>>>>>>> 854ff2baeae73c59a2fe738fed46e1ea14d3c87b
