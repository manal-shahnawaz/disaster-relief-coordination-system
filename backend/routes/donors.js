const express = require('express');
const router = express.Router();
const db = require('../db');
const { logEvent } = require('../logger');

router.get('/', async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM DONOR ORDER BY DONORID`);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  const { donorid, donorname, donorcontact } = req.body;
  try {
    await db.query(`INSERT INTO DONOR VALUES(:1,:2,:3)`, [donorid, donorname, donorcontact]);
    await logEvent('INSERT', { table: 'DONOR', id: donorid });
    res.status(201).json({ message: 'Donor inserted', id: donorid });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
  const { donorname, donorcontact } = req.body;
  try {
    await db.query(`UPDATE DONOR SET DonorName=:1, DonorContact=:2 WHERE DonorID=:3`,
      [donorname, donorcontact, req.params.id]);
    await logEvent('UPDATE', { table: 'DONOR', id: req.params.id });
    res.json({ message: 'Donor updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query(`DELETE FROM DONOR WHERE DonorID = :1`, [req.params.id]);
    await logEvent('DELETE', { table: 'DONOR', id: req.params.id });
    res.json({ message: 'Donor deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
