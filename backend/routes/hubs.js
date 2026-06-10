const express = require('express');
const router = express.Router();
const db = require('../db');
const { logEvent } = require('../logger');

router.get('/', async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM LOGISTICS_HUB ORDER BY HUBID`);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  const { hubid, operationalstatus, storagecapacity, latitude, longitude } = req.body;
  try {
    await db.query(`INSERT INTO LOGISTICS_HUB VALUES(:1,:2,:3,:4,:5)`,
      [hubid, operationalstatus, storagecapacity, latitude, longitude]);
    await logEvent('INSERT', { table: 'LOGISTICS_HUB', id: hubid });
    res.status(201).json({ message: 'Hub inserted', id: hubid });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
  const { operationalstatus, storagecapacity } = req.body;
  try {
    await db.query(`UPDATE LOGISTICS_HUB SET OperationalStatus=:1, StorageCapacity=:2 WHERE HubID=:3`,
      [operationalstatus, storagecapacity, req.params.id]);
    await logEvent('UPDATE', { table: 'LOGISTICS_HUB', id: req.params.id });
    res.json({ message: 'Hub updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query(`DELETE FROM LOGISTICS_HUB WHERE HubID = :1`, [req.params.id]);
    await logEvent('DELETE', { table: 'LOGISTICS_HUB', id: req.params.id });
    res.json({ message: 'Hub deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
