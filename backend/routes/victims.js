const express = require('express');
const router = express.Router();
const db = require('../db');
const { logEvent } = require('../logger');

router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT V.VICTIMID, V.PERSONID, P.FULLNAME, V.INJURYSTATUS,
              TO_CHAR(V.REGDATE,'YYYY-MM-DD') AS REGDATE
       FROM VICTIM V JOIN PERSON P ON V.PERSONID = P.PERSONID
       ORDER BY V.VICTIMID`
    );
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  const { victimid, personid, injurystatus, regdate } = req.body;
  try {
    await db.query(
      `INSERT INTO VICTIM(VictimID, PersonID, InjuryStatus, RegDate) VALUES(:1,:2,:3,TO_DATE(:4,'YYYY-MM-DD'))`,
      [victimid, personid, injurystatus, regdate]
    );
    await logEvent('INSERT', { table: 'VICTIM', id: victimid });
    res.status(201).json({ message: 'Victim registered', id: victimid });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
  const { injurystatus } = req.body;
  try {
    await db.query(
      `UPDATE VICTIM SET InjuryStatus=:1 WHERE VictimID=:2`,
      [injurystatus, req.params.id]
    );
    await logEvent('UPDATE', { table: 'VICTIM', id: req.params.id });
    res.json({ message: 'Victim updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query(`DELETE FROM VICTIM WHERE VictimID = :1`, [req.params.id]);
    await logEvent('DELETE', { table: 'VICTIM', id: req.params.id });
    res.json({ message: 'Victim deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
