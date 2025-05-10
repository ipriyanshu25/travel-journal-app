const express = require('express');
const router = express.Router();
const Journal = require('../models/journal');
const { isAuthenticated } = require('../middleware/auth');

// Show all journals
router.get('/journals', async (req, res) => {
  try {
    const journals = await Journal.find().populate('author', 'username');
    res.render('journals/index', { journals });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// New journal form
router.get('/journal/new', isAuthenticated, (req, res) => {
  res.render('journals/new');
});

// Create journal
router.post('/journal', isAuthenticated, async (req, res) => {
  try {
    const { destination, arrivalDate, departureDate, experience, rating } = req.body;
    const errors = [];
    if (!destination) errors.push('Destination is required');
    if (!arrivalDate) errors.push('Arrival date is required');
    if (!departureDate) errors.push('Departure date is required');
    if (new Date(departureDate) <= new Date(arrivalDate)) errors.push('Departure date must be after arrival date');
    if (!experience || experience.length < 10) errors.push('Experience must be at least 10 characters');
    if (!rating || rating < 1 || rating > 5) errors.push('Rating must be between 1 and 5');
    if (errors.length) return res.render('journals/new', { errors, formData: req.body });

    const newJournal = new Journal({ destination, arrivalDate, departureDate, experience, rating, author: req.user._id });
    await newJournal.save();
    res.redirect('/journals');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// View journal
router.get('/journals/:id', async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id).populate('author', 'username nationality travelStyle');
    if (!journal) return res.status(404).send('Journal not found');
    res.render('journals/show', { journal });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Edit form
router.get('/journals/:id/edit', isAuthenticated, async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);
    if (!journal) return res.status(404).send('Journal not found');
    if (journal.author.toString() !== req.user._id.toString()) return res.status(403).send('Not authorized');
    res.render('journals/edit', { journal });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Update journal
router.put('/journals/:id', isAuthenticated, async (req, res) => {
  try {
    const { arrivalDate, departureDate, experience, rating } = req.body;
    const journal = await Journal.findById(req.params.id);
    if (!journal) return res.status(404).send('Journal not found');
    if (journal.author.toString() !== req.user._id.toString()) return res.status(403).send('Not authorized');

    const errors = [];
    if (!arrivalDate) errors.push('Arrival date is required');
    if (!departureDate) errors.push('Departure date is required');
    if (new Date(departureDate) <= new Date(arrivalDate)) errors.push('Departure date must be after arrival date');
    if (!experience || experience.length < 10) errors.push('Experience must be at least 10 characters');
    if (!rating || rating < 1 || rating > 5) errors.push('Rating must be between 1 and 5');
    if (errors.length) {
      journal._id = req.params.id;
      return res.render('journals/edit', { errors, journal: { ...journal.toObject(), ...req.body } });
    }

    journal.arrivalDate = arrivalDate;
    journal.departureDate = departureDate;
    journal.experience = experience;
    journal.rating = rating;
    await journal.save();
    res.redirect(`/journals/${journal._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Delete journal
router.delete('/journals/:id', isAuthenticated, async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);
    if (!journal) return res.status(404).send('Journal not found');
    if (journal.author.toString() !== req.user._id.toString()) return res.status(403).send('Not authorized');
    await Journal.findByIdAndDelete(req.params.id);
    res.redirect('/journals');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
