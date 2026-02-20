// @ts-check
/**
 * Quote Controller
 * Handles quote HTTP requests
 */

const QuoteService = require("../services/quote.service.cjs");

class QuoteController {
  async getNextQuoteNumber(req, res, next) {
    try {
      const data = await QuoteService.getNextQuoteNumber(req.query.clientId);
      res.json(data);
    } catch (e) {
      next(e);
    }
  }

  async getAllQuotes(req, res, next) {
    try {
      const quotes = await QuoteService.getAllQuotes();
      res.json(quotes);
    } catch (e) {
      next(e);
    }
  }

  async getQuoteById(req, res, next) {
    try {
      const quote = await QuoteService.getQuoteById(req.params.id);
      res.json(quote);
    } catch (e) {
      next(e);
    }
  }

  async createQuote(req, res, next) {
    try {
      const quote = await QuoteService.createQuote(req.body);
      res.status(201).json(quote);
    } catch (e) {
      next(e);
    }
  }

  async updateQuote(req, res, next) {
    try {
      const quote = await QuoteService.updateQuote(req.params.id, req.body);
      res.json(quote);
    } catch (e) {
      next(e);
    }
  }

  async deleteQuote(req, res, next) {
    try {
      await QuoteService.deleteQuote(req.params.id);
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new QuoteController();
