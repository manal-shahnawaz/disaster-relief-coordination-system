const express = require('express');
const router = express.Router();
const db = require('../db');
const { logEvent } = require('../logger');

router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT V.VOLUNTEERID, V.PERSONID, P.FULLNAME, V.AVAILABILITY, V.TRAININGLEVEL,
              V.ORGID, O.ORGNAME
       FROM VOLUNTEER V
       JOIN PERSON P ON V.PERSONID = P.PERSONID
       LEFT JOIN ORGANIZATION O ON V.ORGID = O.ORGID
       ORDER BY V.VOLUNTEERID`
    );
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  const { volunteerid, personid, availability, traininglevel, orgid } = req.body;
  try {
    await db.query(
      `INSERT INTO VOLUNTEER(VolunteerID,PersonID,Availability,TrainingLevel,OrgID) VALUES(:1,:2,:3,:4,:5)`,
      [volunteerid, personid, availability, traininglevel, orgid || null]
    );
    await logEvent('INSERT', { table: 'VOLUNTEER', id: volunteerid });
    res.status(201).json({ message: 'Volunteer inserted', id: volunteerid });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
  const { availability, traininglevel } = req.body;
  try {
    await db.query(
      `UPDATE VOLUNTEER SET Availability=:1, TrainingLevel=:2 WHERE VolunteerID=:3`,
      [availability, traininglevel, req.params.id]
    );
    await logEvent('UPDATE', { table: 'VOLUNTEER', id: req.params.id });
    res.json({ message: 'Volunteer updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query(`DELETE FROM VOLUNTEER WHERE VolunteerID = :1`, [req.params.id]);
    await logEvent('DELETE', { table: 'VOLUNTEER', id: req.params.id });
    res.json({ message: 'Volunteer deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
