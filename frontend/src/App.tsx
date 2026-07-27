import { useState } from 'react';
import { Heart, Sparkles, Code } from 'lucide-react';
import ReportView from './components/ReportView';
import JathakamInputForm from './components/JathakamInputForm';

function App() {
  const [boyJson, setBoyJson] = useState<string>('');
  const [girlJson, setGirlJson] = useState<string>('');
  
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [boyRawInputs, setBoyRawInputs] = useState<{dob: string, lat: number, lng: number} | null>(null);

  const handleBoyGenerated = (data: any, rawInputs?: {dob: string, lat: number, lng: number}) => {
    setBoyJson(JSON.stringify(data, null, 2));
    if (rawInputs) setBoyRawInputs(rawInputs);
  };

  const handleGirlGenerated = (data: any) => {
    setGirlJson(JSON.stringify(data, null, 2));
  };

  const handleMatch = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!boyJson || !girlJson) {
        throw new Error("Please generate astrological details for both Groom and Bride first.");
      }

      const boyData = JSON.parse(boyJson);
      const girlData = JSON.parse(girlJson);

      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/api/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boy: boyData, girl: girlData })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to match');
      }

      const result = await response.json();
      setReport(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Invalid JSON or Server Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in">
      
      <header className="flex flex-col items-center justify-center text-center" style={{ marginBottom: '60px' }}>
        <h1 className="flex items-center gap-4">
          <Sparkles color="var(--secondary)" size={40} />
          Jathakam Match (Ephemeris Engine)
          <Sparkles color="var(--secondary)" size={40} />
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '800px' }}>
          Enter precise birth details below. The backend astronomy engine will calculate exact planetary longitudes, Lagna, Rasi, Nakshatra, and Dasha Balance. Once generated, run the 4-Tier Match Engine.
        </p>
      </header>

      <div style={{ display: !report ? 'block' : 'none', maxWidth: '1400px', margin: '0 auto' }}>
        {error && <div className="glass-card" style={{ color: 'var(--error)', marginBottom: '20px', textAlign: 'center', borderColor: 'var(--error)' }}>{error}</div>}
        
        <div className="grid grid-cols-2" style={{ gap: '40px' }}>
          
          {/* BOY COLUMN */}
          <div className="flex flex-col gap-6">
            <JathakamInputForm 
              title="Groom (Boy) Details" 
              defaultGender="M" 
              colorVar="var(--primary)"
              onGenerate={handleBoyGenerated} 
            />
            
            {boyJson && (
              <div className="glass-card animate-fade-in" style={{ padding: '24px' }}>
                <h3 className="flex items-center gap-2 mb-4"><Code size={18} /> Generated Astrological Schema</h3>
                <textarea 
                  rows={15}
                  value={boyJson}
                  onChange={(e) => setBoyJson(e.target.value)}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', color: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', fontFamily: 'monospace' }}
                />
              </div>
            )}
          </div>

          {/* GIRL COLUMN */}
          <div className="flex flex-col gap-6">
            <JathakamInputForm 
              title="Bride (Girl) Details" 
              defaultGender="F" 
              colorVar="var(--secondary)"
              onGenerate={handleGirlGenerated} 
            />
            
            {girlJson && (
              <div className="glass-card animate-fade-in" style={{ padding: '24px' }}>
                <h3 className="flex items-center gap-2 mb-4"><Code size={18} /> Generated Astrological Schema</h3>
                <textarea 
                  rows={15}
                  value={girlJson}
                  onChange={(e) => setGirlJson(e.target.value)}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', color: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', fontFamily: 'monospace' }}
                />
              </div>
            )}
          </div>

        </div>

        <div className="flex justify-center" style={{ marginTop: '60px', marginBottom: '40px' }}>
          <button 
            className="btn-primary flex items-center gap-2" 
            onClick={handleMatch}
            disabled={loading || !boyJson || !girlJson}
            style={{ padding: '20px 60px', fontSize: '1.4rem', opacity: (!boyJson || !girlJson) ? 0.5 : 1 }}
          >
            {loading ? 'Executing Engine...' : <><Heart fill="white" size={24} /> Execute Compatibility Match</>}
          </button>
        </div>
      </div>

      <div style={{ display: report ? 'block' : 'none' }}>
        <button className="btn-outline mb-4" onClick={() => setReport(null)}>
          ← Back to Generator
        </button>
        {report && <ReportView report={report} boyRawInputs={boyRawInputs} girlData={girlJson ? JSON.parse(girlJson) : null} />}
      </div>

    </div>
  );
}

export default App;
