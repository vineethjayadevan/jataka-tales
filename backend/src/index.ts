import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { RuleEngine } from './engine/RuleEngine';
import { generateHoroscope } from './services/ephemerisService';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/jathakam';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.post('/api/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, gender, dob, time, lat, lng, manualNakshatra } = req.body;
    
    if (!dob || !time || lat === undefined || lng === undefined) {
      res.status(400).json({ error: 'Missing required date/time/location parameters.' });
      return;
    }

    // Combine DOB (YYYY-MM-DD) and Time (HH:MM:SS) into UTC Date object
    // For Kerala/Indian astrology, local time is critical. Since the UI doesn't provide a timezone offset,
    // we explicitly append the IST offset (+05:30) to ensure JavaScript correctly converts the local birth time to accurate UTC.
    const dateTimeString = `${dob}T${time}+05:30`;
    const dateObj = new Date(dateTimeString);

    const horoscope = generateHoroscope(gender || 'M', dateObj, lat, lng, manualNakshatra);
    
    res.json(horoscope);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Generation failed', details: error.message });
  }
});

app.post('/api/match', async (req: Request, res: Response): Promise<void> => {
  try {
    const { boy, girl } = req.body;
    
    if (!boy || !girl) {
      res.status(400).json({ error: 'Missing boy or girl jathakam data in request.' });
      return;
    }

    // Pass the raw data directly to the new Text-Based Rule Engine
    const engine = new RuleEngine(boy, girl);
    const result = engine.executeMatching();
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'Matching failed', details: error.message });
  }
});

import { SimulationEngine } from './engine/SimulationEngine';

app.post('/api/simulate-match', async (req: Request, res: Response): Promise<void> => {
  try {
    const { dob, lat, lng, girl } = req.body;
    
    if (!dob || lat === undefined || lng === undefined || !girl) {
      res.status(400).json({ error: 'Missing dob, lat, lng, or girl data in request.' });
      return;
    }

    const results = SimulationEngine.simulateAuspiciousTimes(dob, lat, lng, girl);
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: 'Simulation failed', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
