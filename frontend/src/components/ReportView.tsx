import React, { useRef, useState } from 'react';
import { Download, CheckCircle, XCircle, AlertTriangle, Scale, Clock, RefreshCw, Sun } from 'lucide-react';
import { exportToPDF } from '../utils/pdfExport';

interface ReportProps {
  report: any;
  boyRawInputs?: {dob: string, lat: number, lng: number} | null;
  girlData?: any;
}

const ReportView: React.FC<ReportProps> = ({ report, boyRawInputs, girlData }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<any[] | null>(null);
  const [simError, setSimError] = useState<string>('');

  const handleExport = () => {
    if (reportRef.current) {
      exportToPDF(reportRef.current, `Jathakam_Match_Report.pdf`);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'EXCELLENT') return 'var(--success)';
    if (status === 'ACCEPTABLE') return 'var(--secondary)';
    return 'var(--error)';
  };

  const renderBadge = (score: string | boolean) => {
    if (score === 'Uthama') return <span className="badge uthama">Uthama (1)</span>;
    if (score === 'Madhyama') return <span className="badge madhyama">Madhyama (0.5)</span>;
    if (score === 'Adhama') return <span className="badge adhama">Adhama (0)</span>;
    
    if (score === true) return <span className="badge uthama">Pass</span>;
    return <span className="badge adhama">Fail</span>;
  };

  const handleSimulate = async () => {
    if (!boyRawInputs || !girlData) {
      setSimError("Missing raw inputs or bride's chart to run simulation.");
      return;
    }

    setIsSimulating(true);
    setSimError('');
    setSimulationResults(null);

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/api/simulate-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dob: boyRawInputs.dob,
          lat: boyRawInputs.lat,
          lng: boyRawInputs.lng,
          girl: girlData
        })
      });

      if (!response.ok) {
        throw new Error('Simulation failed.');
      }

      const results = await response.json();
      setSimulationResults(results);
    } catch (err: any) {
      setSimError(err.message || "Failed to execute simulation");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '100px' }}>
      
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <h2>4-Tier Compatibility Analysis</h2>
        <div className="flex gap-4">
          <button className="btn-primary flex items-center gap-2" onClick={handleExport}>
            <Download size={18} /> Export PDF
          </button>
        </div>
      </div>

      <div ref={reportRef} className="glass-card" style={{ background: '#1a1b26' }}>
        
        {/* Header */}
        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '24px', marginBottom: '32px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Final Status: <span style={{ color: getStatusColor(report.overall_status) }}>{report.overall_status}</span></h1>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.05)', padding: '10px 24px', borderRadius: '30px', border: '1px solid var(--border-color)', fontSize: '1.2rem' }}>
            Dasa Porutham Score: <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{report.porutham_score}/10</span>
          </div>
        </div>

        {/* Tiers Summary */}
        <div className="grid grid-cols-2" style={{ gap: '20px', marginBottom: '40px' }}>
          
          {/* Papa Samyam Card */}
          <div className="glass-card flex-col" style={{ padding: '20px' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <span className="flex items-center gap-2" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}><Scale size={20} color="var(--primary)" /> Papa Samyam (Dosha)</span>
              {report.dosha_balanced ? <CheckCircle color="var(--success)" /> : <XCircle color="var(--error)" />}
            </div>
            {report.boy_malefic_score !== undefined && (
              <div className="flex justify-between" style={{ fontSize: '1.2rem', padding: '0 10px' }}>
                <div className="text-center" style={{ width: '50%' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Groom Score</div>
                  <strong style={{ color: 'var(--success)' }}>{report.boy_malefic_score}</strong>
                </div>
                <div className="text-center" style={{ borderLeft: '1px solid var(--border-color)', width: '50%' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Bride Score</div>
                  <strong style={{ color: 'var(--secondary)' }}>{report.girl_malefic_score}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Dasha Balance Card */}
          <div className="glass-card flex-col" style={{ padding: '20px' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <span className="flex items-center gap-2" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}><Clock size={20} color="var(--primary)" /> Dasha Balance</span>
            </div>
            {report.boy_dasha && (
              <div className="flex justify-between" style={{ fontSize: '1rem', padding: '0 10px' }}>
                <div className="text-center" style={{ width: '50%' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Groom</div>
                  <strong>{report.boy_dasha.years} Yrs</strong> <br/>
                  <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>({report.boy_dasha.lord})</span>
                </div>
                <div className="text-center" style={{ borderLeft: '1px solid var(--border-color)', width: '50%' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Bride</div>
                  <strong>{report.girl_dasha.years} Yrs</strong> <br/>
                  <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>({report.girl_dasha.lord})</span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Warnings */}
        {report.warnings && report.warnings.length > 0 && (
          <div style={{ marginBottom: '40px', background: 'rgba(239, 68, 68, 0.1)', padding: '24px', borderRadius: '12px', border: '1px solid var(--error)' }}>
            <h3 style={{ color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <AlertTriangle /> Engine Warnings & Doshas
            </h3>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {report.warnings.map((w: string, i: number) => (
                <li key={i} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ffb3b3' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--error)', flexShrink: 0 }} />
                  {w}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Detailed Breakdown */}
        {report.detailed_breakdown && (
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ marginBottom: '24px', fontSize: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Dasa Porutham Breakdown</span>
              <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>Tier 2 Evaluation</span>
            </h3>
            
            <div className="grid grid-cols-2" style={{ gap: '16px' }}>
              {Object.entries(report.detailed_breakdown).map(([key, score]: [string, any], idx: number) => (
                <div key={idx} className="glass-card flex justify-between items-center" style={{ background: 'rgba(0,0,0,0.3)', padding: '16px 24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>{key} Porutham</span>
                  {renderBadge(score)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Simulation Section */}
        {boyRawInputs && girlData && (
          <div style={{ marginTop: '40px', paddingTop: '40px', borderTop: '1px dashed var(--border-color)' }}>
            <div className="flex flex-col items-center text-center">
              <h3 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '12px' }}>Auspicious Time Finder</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '24px' }}>
                Run a 24-hour simulation sweep. The engine will iterate through the Groom's birth date in 15-minute increments to find exact times where Lagna and Moon shifts result in a passing Match (Dealbreakers passed, Dosha balanced, Score ≥ 6.0).
              </p>
              
              <button 
                className="btn-outline flex items-center gap-2" 
                onClick={handleSimulate}
                disabled={isSimulating}
                style={{ borderColor: 'var(--primary)', color: 'var(--primary)', padding: '12px 30px', fontSize: '1.1rem' }}
              >
                {isSimulating ? <><RefreshCw className="animate-spin" /> Simulating 24 Hours...</> : <><Sun size={20} /> Find Auspicious Times</>}
              </button>
            </div>

            {simError && <div style={{ color: 'var(--error)', marginTop: '20px', textAlign: 'center' }}>{simError}</div>}

            {simulationResults !== null && (
              <div className="animate-fade-in" style={{ marginTop: '30px', padding: '24px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ marginBottom: '16px', fontSize: '1.2rem' }}>
                  Found {simulationResults.length} Auspicious Window{simulationResults.length !== 1 && 's'}
                </h4>
                
                {simulationResults.length === 0 ? (
                  <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
                    No valid times found on this date. The Dosha/Dealbreakers are too severe.
                  </div>
                ) : (
                  <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '10px' }}>
                    <div className="grid gap-3">
                      {simulationResults.map((res: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center" style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 20px', borderRadius: '8px', borderLeft: `4px solid ${getStatusColor(res.overall_status)}` }}>
                          <div>
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', marginRight: '16px', display: 'inline-block', width: '90px' }}>
                              {res.time.substring(0, 5)}
                            </span>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                              Lagna: {res.boy_lagna} | Nak: {res.boy_nakshatra}
                            </span>
                          </div>
                          <div className="flex gap-3 items-center">
                            <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>Score: {res.score}</span>
                            {renderBadge('Uthama')} {/* Placeholder for visual flair indicating a valid pass */}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', opacity: 0.6 }}>
          Powered by Jathakam Astro Engine • Chitra Paksha (Lahiri) Ayanamsa
        </div>
      </div>
    </div>
  );
};

export default ReportView;
