import mongoose, { Schema, Document } from 'mongoose';

export interface IPlanetPosition {
  planet: string; // Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu
  degree: number; // 0-360 degrees
}

export interface IHoroscope extends Document {
  gender: 'M' | 'F';
  nakshatra: string;
  pada: number; // 1-4
  rasi: string;
  lagna: string;
  dasha_balance_planet: string;
  dasha_balance_years: number; // Exact decimal representation
  malefic_score?: number; // Optional fallback
  kuja_dosha_status: boolean | number;
  planets?: IPlanetPosition[]; // Optional fallback array
  createdAt: Date;
  updatedAt: Date;
}

const PlanetPositionSchema = new Schema({
  planet: { type: String, required: true },
  degree: { type: Number, required: true }
});

const HoroscopeSchema: Schema = new Schema({
  gender: { type: String, enum: ['M', 'F'], required: true },
  nakshatra: { type: String, required: true },
  pada: { type: Number, required: true, min: 1, max: 4 },
  rasi: { type: String, required: true },
  lagna: { type: String, required: true },
  dasha_balance_planet: { type: String, required: true },
  dasha_balance_years: { type: Number, required: true },
  malefic_score: { type: Number, required: false },
  kuja_dosha_status: { type: Schema.Types.Mixed, required: true }, // Boolean or Integer severity
  planets: { type: [PlanetPositionSchema], required: false }
}, {
  timestamps: true
});

export default mongoose.model<IHoroscope>('Horoscope', HoroscopeSchema);
