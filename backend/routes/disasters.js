const express = require('express');
const router = express.Router();
const db = require('../db');
const { logEvent } = require('../logger');

// GET all
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM DISASTER ORDER BY StartDate DESC`);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM DISASTER WHERE DisasterID = :id`, [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST (INSERT)
router.post('/', async (req, res) => {
  const { disasterid, disastertype, severity, startdate, status } = req.body;
  try {
    await db.query(
      `INSERT INTO DISASTER VALUES (:1, :2, :3, TO_DATE(:4,'YYYY-MM-DD'), :5)`,
      [disasterid, disastertype, severity, startdate, status]
    );
    await logEvent('INSERT', { table: 'DISASTER', id: disasterid });
    res.status(201).json({ message: 'Disaster inserted', id: disasterid });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT (UPDATE)
router.put('/:id', async (req, res) => {
  const { disastertype, severity, startdate, status } = req.body;
  try {
    await db.query(
      `UPDATE DISASTER SET DisasterType=:1, Severity=:2, StartDate=TO_DATE(:3,'YYYY-MM-DD'), Status=:4 WHERE DisasterID=:5`,
      [disastertype, severity, startdate, status, req.params.id]
    );
    await logEvent('UPDATE', { table: 'DISASTER', id: req.params.id });
    res.json({ message: 'Disaster updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await db.query(`DELETE FROM DISASTER WHERE DisasterID = :1`, [req.params.id]);
    await logEvent('DELETE', { table: 'DISASTER', id: req.params.id });
    res.json({ message: 'Disaster deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
