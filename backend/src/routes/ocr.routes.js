// Top of your file
import express from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { createWorker } from 'tesseract.js';
import { createRequire } from 'module';

// Use createRequire to import CommonJS modules
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const router = express.Router();

// Rest of your code remains the same

// OCR route
router.post('/extract', async (req, res) => {
  try {
    const { documentUrl } = req.body;
    
    if (!documentUrl) {
      return res.status(400).json({ error: 'Document URL is required' });
    }
    
    // Download the file
    const response = await axios.get(documentUrl, { responseType: 'arraybuffer' });
    const fileBuffer = Buffer.from(response.data);
    
    // Determine file type and extract text accordingly
    let text = '';
    const fileExtension = path.extname(documentUrl).toLowerCase();
    
    if (fileExtension === '.pdf') {
      // Extract text from PDF
      const pdfData = await pdfParse(fileBuffer);
      text = pdfData.text;
      
      // If PDF text extraction didn't work well, try OCR
      if (!text || text.trim().length < 50) {
        text = await extractTextWithOCR(fileBuffer);
      }
    } else if (['.jpg', '.jpeg', '.png'].includes(fileExtension)) {
      // For images, use OCR
      text = await extractTextWithOCR(fileBuffer);
    } else {
      return res.status(400).json({ error: 'Unsupported file format' });
    }
    
    res.json({ success: true, text });
  } catch (error) {
    console.error('OCR Error:', error);
    res.status(500).json({ error: 'Failed to extract text from document' });
  }
});

// Helper function for OCR
async function extractTextWithOCR(fileBuffer) {
  const worker = await createWorker('eng');
  
  try {
    const { data } = await worker.recognize(fileBuffer);
    return data.text;
  } finally {
    await worker.terminate();
  }
}

export default router;
