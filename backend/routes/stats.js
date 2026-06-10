const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const [disasters, victims, volunteers, donations, shelters, supplies] = await Promise.all([
      db.query(`SELECT COUNT(*) AS CNT FROM DISASTER WHERE STATUS='Active'`),
      db.query(`SELECT COUNT(*) AS CNT FROM VICTIM`),
      db.query(`SELECT COUNT(*) AS CNT FROM VOLUNTEER`),
      db.query(`SELECT NVL(SUM(AMOUNT),0) AS TOTAL FROM DONATION WHERE STATUS='Received'`),
      db.query(`SELECT COUNT(*) AS CNT FROM SHELTER WHERE STATUS='Open'`),
      db.query(`SELECT NVL(SUM(QUANTITY),0) AS TOTAL FROM SUPPLY`)
    ]);
    res.json({
      activeDisasters: disasters.rows[0].CNT,
      totalVictims:    victims.rows[0].CNT,
      totalVolunteers: volunteers.rows[0].CNT,
      totalDonations:  donations.rows[0].TOTAL,
      openShelters:    shelters.rows[0].CNT,
      totalSupplies:   supplies.rows[0].TOTAL
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
