import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static files from the Vite build output
app.use(express.static(path.join(__dirname, 'dist', 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Boreal Financial Client Portal' });
});

// Catch-all handler: serve React app for any route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'public', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Boreal Financial Client Portal running on port ${port}`);
  console.log(`📂 Serving built React application from dist/public`);
  console.log(`🌐 Ready for production deployment`);
});