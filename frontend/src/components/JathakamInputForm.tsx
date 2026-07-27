import React, { useState } from 'react';
import { User, Calendar, Clock, MapPin, Search } from 'lucide-react';

interface JathakamInputFormProps {
  title: string;
  defaultGender: 'M'|'F';
  onGenerate: (data: any, rawInputs?: { dob: string, lat: number, lng: number }) => void;
  colorVar: string;
}

const JathakamInputForm: React.FC<JathakamInputFormProps> = ({ title, defaultGender, onGenerate, colorVar }) => {
  const [formData, setFormData] = useState({
    name: '',
    gender: defaultGender,
    dob: '',
    time: '',
    city: '',
    manualNakshatra: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Geocode City using OpenStreetMap Nominatim
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(formData.city)}&format=json&limit=1`);
      const geoData = await geoRes.json();
      
      if (!geoData || geoData.length === 0) {
        throw new Error(`Could not find coordinates for city: ${formData.city}. Try adding country or state.`);
      }
      
      const lat = parseFloat(geoData[0].lat);
      const lng = parseFloat(geoData[0].lon);

      // 2. Send to backend Ephemeris engine
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          lat,
          lng
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to generate astrological data');
      }

      const horoscopeData = await response.json();
      onGenerate(horoscopeData, { dob: formData.dob, lat, lng });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Generation Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '24px', borderTop: `4px solid ${colorVar}` }}>
      <h2 style={{ color: colorVar, marginBottom: '24px' }}>{title}</h2>
      
      {error && <div style={{ color: 'var(--error)', marginBottom: '16px' }}>{error}</div>}

      <form onSubmit={handleGenerate} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2"><User size={16} /> Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-field" placeholder="Full Name" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2"><User size={16} /> Sex</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className="input-field">
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2"><Calendar size={16} /> Date of Birth</label>
            <input type="date" name="dob" value={formData.dob} onChange={handleChange} required className="input-field" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2"><Clock size={16} /> Time of Birth</label>
            <input type="time" name="time" step="1" value={formData.time} onChange={handleChange} required className="input-field" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2"><MapPin size={16} /> City of Birth</label>
          <input type="text" name="city" value={formData.city} onChange={handleChange} required className="input-field" placeholder="e.g. Kerala, India" />
        </div>
        
        <div className="flex flex-col gap-2 mt-2">
          <label className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>Nakshatra Override (Optional)</label>
          <input type="text" name="manualNakshatra" value={formData.manualNakshatra} onChange={handleChange} className="input-field" placeholder="Leave blank to auto-calculate" />
        </div>

        <button type="submit" disabled={loading} className="btn-outline mt-4" style={{ borderColor: colorVar, color: colorVar }}>
          {loading ? 'Calculating Ephemeris...' : <><Search size={18} /> Generate Astrological Details</>}
        </button>
      </form>
    </div>
  );
};

export default JathakamInputForm;
