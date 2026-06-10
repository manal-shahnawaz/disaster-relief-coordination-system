const express = require('express');
const router = express.Router();
const db = require('../db');
const { logEvent } = require('../logger');

router.get('/', async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM ORGANIZATION ORDER BY ORGID`);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  const { orgid, orgname, orgtype, phone, email } = req.body;
  try {
    await db.query(`INSERT INTO ORGANIZATION VALUES(:1,:2,:3,:4,:5)`,
      [orgid, orgname, orgtype, phone, email]);
    await logEvent('INSERT', { table: 'ORGANIZATION', id: orgid });
    res.status(201).json({ message: 'Org inserted', id: orgid });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
  const { orgname, orgtype, phone, email } = req.body;
  try {
    await db.query(`UPDATE ORGANIZATION SET OrgName=:1, OrgType=:2, Phone=:3, Email=:4 WHERE OrgID=:5`,
      [orgname, orgtype, phone, email, req.params.id]);
    await logEvent('UPDATE', { table: 'ORGANIZATION', id: req.params.id });
    res.json({ message: 'Org updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query(`DELETE FROM ORGANIZATION WHERE OrgID = :1`, [req.params.id]);
    await logEvent('DELETE', { table: 'ORGANIZATION', id: req.params.id });
    res.json({ message: 'Org deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
