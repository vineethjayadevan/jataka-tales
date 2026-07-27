import mongoose, { Schema, Document } from 'mongoose';

export interface IRule extends Document {
  name: string;
  category: 'nakshatra' | 'graha' | 'dosha' | 'marriage';
  weight: number;
  description: string;
  enabled: boolean;
  
  // A stringified JSON or formula identifier that the engine maps to actual logic
  logicId: string; 
}

const RuleSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  category: { type: String, enum: ['nakshatra', 'graha', 'dosha', 'marriage'], required: true },
  weight: { type: Number, required: true, default: 10 },
  description: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  logicId: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<IRule>('Rule', RuleSchema);
