const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// In-memory storage for classroom submissions (resets if server restarts)
let submissions = [];

// Endpoint to handle student submissions
app.post('/api/submit', (req, res) => {
    const { name, words } = req.body;
    
    if (!name || !words || !Array.isArray(words) || words.length !== 3) {
        return res.status(400).json({ error: 'Please provide your name and exactly 3 words.' });
    }

    // Clean data: trim whitespace and lowercase to group identical words together
    const cleanedWords = words.map(w => w.trim().toLowerCase()).filter(w => w.length > 0);
    
    if (cleanedWords.length !== 3) {
        return res.status(400).json({ error: 'Make sure all 3 word fields are filled out.' });
    }

    submissions.push({ name, words: cleanedWords, timestamp: new Date() });
    res.status(200).json({ message: 'Submission successful!' });
});

// Endpoint to get aggregated word frequencies for the word cloud
app.get('/api/wordcloud', (req, res) => {
    const counts = {};
    
    submissions.forEach(sub => {
        sub.words.forEach(word => {
            counts[word] = (counts[word] || 0) + 1;
        });
    });

    // Format data specifically for the AnyChart Tag Cloud library
    const data = Object.keys(counts).map(word => ({
        x: word,
        value: counts[word]
    }));

    res.json(data);
});

app.listen(PORT, () => {
    console.log(`🚀 App running at http://localhost:${PORT}`);
});
