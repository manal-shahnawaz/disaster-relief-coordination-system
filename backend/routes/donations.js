const express = require('express');
const router = express.Router();
const db = require('../db');
const { logEvent } = require('../logger');

router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT D.DONATIONID, D.AMOUNT, D.DONATIONTYPE, TO_CHAR(D.DONATIONDATE,'YYYY-MM-DD') AS DONATIONDATE,
              D.STATUS
       FROM DONATION D ORDER BY D.DONATIONDATE DESC`
    );
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  const { donationid, amount, donationdate, donationtype, status } = req.body;
  try {
    await db.query(
      `INSERT INTO DONATION VALUES(:1,:2,TO_DATE(:3,'YYYY-MM-DD'),:4,:5)`,
      [donationid, amount, donationdate, donationtype, status]
    );
    await logEvent('INSERT', { table: 'DONATION', id: donationid });
    res.status(201).json({ message: 'Donation inserted', id: donationid });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
  const { status, amount } = req.body;
  try {
    await db.query(`UPDATE DONATION SET Status=:1, Amount=:2 WHERE DonationID=:3`,
      [status, amount, req.params.id]);
    await logEvent('UPDATE', { table: 'DONATION', id: req.params.id });
    res.json({ message: 'Donation updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query(`DELETE FROM DONATION WHERE DonationID = :1`, [req.params.id]);
    await logEvent('DELETE', { table: 'DONATION', id: req.params.id });
    res.json({ message: 'Donation deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
