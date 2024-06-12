const express = require("express");
const router = express.Router();
const insuranceController = require("../controllers/insuranceController");

router.post("/insurance", insuranceController.getInsuranceRecommendation);

module.exports = router;
