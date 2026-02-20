// @ts-check
/**
 * Quote Routes
 */

const express = require("express");
const QuoteController = require("../controllers/quote.controller.cjs");

const router = express.Router();

router.get("/next-number", QuoteController.getNextQuoteNumber.bind(QuoteController));
router.get("/:id", QuoteController.getQuoteById.bind(QuoteController));
router.get("/", QuoteController.getAllQuotes.bind(QuoteController));
router.post("/", QuoteController.createQuote.bind(QuoteController));
router.put("/:id", QuoteController.updateQuote.bind(QuoteController));
router.delete("/:id", QuoteController.deleteQuote.bind(QuoteController));

module.exports = router;
