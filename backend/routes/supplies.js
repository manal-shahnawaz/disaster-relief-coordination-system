const express = require('express');
const router = express.Router();
const db = require('../db');
const { logEvent } = require('../logger');

router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT S.SUPPLYID, S.SUPPLYNAME, S.QUANTITY,
              TO_CHAR(S.EXPIRYDATE,'YYYY-MM-DD') AS EXPIRYDATE,
              S.HUBID,
              CASE WHEN F.SUPPLYID IS NOT NULL THEN 'Food'
                   WHEN M.SUPPLYID IS NOT NULL THEN 'Medical'
                   WHEN E.SUPPLYID IS NOT NULL THEN 'Equipment' END AS SUPPLYTYPE,
              COALESCE(F.FOODTYPE, M.MEDTYPE, E.EQUIPTYPE) AS SUBTYPE
       FROM SUPPLY S
       LEFT JOIN FOOD_SUPPLY F ON S.SUPPLYID = F.SUPPLYID
       LEFT JOIN MEDICAL_SUPPLY M ON S.SUPPLYID = M.SUPPLYID
       LEFT JOIN EQUIPMENT_SUPPLY E ON S.SUPPLYID = E.SUPPLYID
       ORDER BY S.SUPPLYID`
    );
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  const { supplyid, supplyname, quantity, expirydate, hubid, supplytype, subtype } = req.body;
  try {
    await db.query(
      `INSERT INTO SUPPLY VALUES(:1,:2,:3,TO_DATE(:4,'YYYY-MM-DD'),:5)`,
      [supplyid, supplyname, quantity, expirydate || null, hubid]
    );
    const subMap = { Food: 'FOOD_SUPPLY', Medical: 'MEDICAL_SUPPLY', Equipment: 'EQUIPMENT_SUPPLY' };
    const colMap = { Food: 'FoodType', Medical: 'MedType', Equipment: 'EquipType' };
    if (!subMap[supplytype] || !colMap[supplytype]) {
      return res.status(400).json({ error: `Invalid supplytype. Use one of: ${Object.keys(subMap).join(', ')}` });
    }
    await db.query(
      `INSERT INTO ${subMap[supplytype]}(SupplyID,${colMap[supplytype]}) VALUES(:1,:2)`,
      [supplyid, subtype]
    );
    await logEvent('INSERT', { table: 'SUPPLY', id: supplyid, supplyType: supplytype });
    res.status(201).json({ message: 'Supply inserted', id: supplyid });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
  const { quantity } = req.body;
  try {
    await db.query(`UPDATE SUPPLY SET Quantity=:1 WHERE SupplyID=:2`, [quantity, req.params.id]);
    await logEvent('UPDATE', { table: 'SUPPLY', id: req.params.id });
    res.json({ message: 'Supply updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query(`DELETE FROM SUPPLY WHERE SupplyID = :1`, [req.params.id]);
    await logEvent('DELETE', { table: 'SUPPLY', id: req.params.id });
    res.json({ message: 'Supply deleted (cascade removes subtype row)' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
