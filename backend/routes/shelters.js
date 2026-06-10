const express = require('express');
const router = express.Router();
const db = require('../db');
const { logEvent } = require('../logger');

router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT SHELTERID, STATUS, CAPACITY, CURROCCUPANCY,
              (CAPACITY - CURROCCUPANCY) AS AVAILABLESPACE,
              LATITUDE, LONGITUDE, CITY, DISTRICT
       FROM SHELTER ORDER BY SHELTERID`
    );
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  const { shelterid, status, capacity, curroccupancy, latitude, longitude, city, district } = req.body;
  try {
    await db.query(
      `INSERT INTO SHELTER VALUES(:1,:2,:3,:4,:5,:6,:7,:8)`,
      [shelterid, status, capacity, curroccupancy, latitude, longitude, city, district]
    );
    await logEvent('INSERT', { table: 'SHELTER', id: shelterid });
    res.status(201).json({ message: 'Shelter inserted', id: shelterid });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
  const { status, capacity, curroccupancy, city, district } = req.body;
  try {
    await db.query(
      `UPDATE SHELTER SET Status=:1, Capacity=:2, CurrOccupancy=:3, City=:4, District=:5 WHERE ShelterID=:6`,
      [status, capacity, curroccupancy, city, district, req.params.id]
    );
    await logEvent('UPDATE', { table: 'SHELTER', id: req.params.id });
    res.json({ message: 'Shelter updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query(`DELETE FROM SHELTER WHERE ShelterID = :1`, [req.params.id]);
    await logEvent('DELETE', { table: 'SHELTER', id: req.params.id });
    res.json({ message: 'Shelter deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
