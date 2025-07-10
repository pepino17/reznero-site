import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the root directory
app.use(express.static(__dirname));

// Handle direct blog post URLs
app.get('/Top-5-Best-Evaporative-Air-Coolers-2025', (req, res) => {
    // Redirect to the correct path
    res.redirect(301, '/AMZ-Top_products/Top-5-Best-Evaporative-Air-Coolers-2025');
});

// Handle the actual blog post path
app.get('/AMZ-Top_products/Top-5-Best-Evaporative-Air-Coolers-2025', (req, res) => {
    const blogPath = path.join(__dirname, 'blog-posts', 'Top-5-Best-Evaporative-Air-Coolers-2025', 'index.html');
    if (fs.existsSync(blogPath)) {
        res.sendFile(blogPath);
    } else {
        // Fallback to the main index if the blog post isn't found
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

// Handle client-side routing for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Blog posts should now be accessible at both URL formats`);
});
