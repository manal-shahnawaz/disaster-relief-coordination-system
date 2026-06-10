const express = require('express');
const router = express.Router();
const db = require('../db');
const { logEvent } = require('../logger');

router.get('/', async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM PERSON ORDER BY PersonID`);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM PERSON WHERE PersonID = :id`, [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  const { personid, fullname, dob, gender, contactnumber, street, city, district, postalcode } = req.body;
  try {
    await db.query(
      `INSERT INTO PERSON VALUES (:1,:2,TO_DATE(:3,'YYYY-MM-DD'),:4,:5,:6,:7,:8,:9)`,
      [personid, fullname, dob, gender, contactnumber, street, city, district, postalcode]
    );
    await logEvent('INSERT', { table: 'PERSON', id: personid });
    res.status(201).json({ message: 'Person inserted', id: personid });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
  const { fullname, gender, contactnumber, street, city, district, postalcode } = req.body;
  try {
    await db.query(
      `UPDATE PERSON SET FullName=:1, Gender=:2, ContactNumber=:3, Street=:4, City=:5, District=:6, PostalCode=:7 WHERE PersonID=:8`,
      [fullname, gender, contactnumber, street, city, district, postalcode, req.params.id]
    );
    await logEvent('UPDATE', { table: 'PERSON', id: req.params.id });
    res.json({ message: 'Person updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query(`DELETE FROM PERSON WHERE PersonID = :1`, [req.params.id]);
    await logEvent('DELETE', { table: 'PERSON', id: req.params.id });
    res.json({ message: 'Person deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
