import React, { useState, useEffect } from 'react';
import { CheckCircle, FileText } from 'lucide-react';
import FileUpload from '../components/resume/FileUpload';
import ResumeChat from '../components/resume/ResumeChat';
import { resumeService } from '../services/resumeService';
import '../index.css';

const ResumeParserPage = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState(() => {
    const saved = localStorage.getItem('resumeParser_parsedData');
    return saved ? JSON.parse(saved) : null;
  });
  const [error, setError] = useState(() => localStorage.getItem('resumeParser_error') || '');

  useEffect(() => {
    if (parsedData) {
      localStorage.setItem('resumeParser_parsedData', JSON.stringify(parsedData));
    } else {
      localStorage.removeItem('resumeParser_parsedData');
    }
  }, [parsedData]);

  useEffect(() => {
    localStorage.setItem('resumeParser_error', error);
  }, [error]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError('');
    }
  };

  const uploadResume = async () => {
    if (!file) return;
    setLoading(true);
    setError('');

    try {
      const data = await resumeService.uploadResume(file);
      
      let parsed;
      try {
          parsed = JSON.parse(data.extractedText);
      } catch(e) {
          parsed = { error: "Could not parse JSON", raw: data.extractedText };
      }
      setParsedData(parsed);

      // Clear chat messages when new resume is parsed
      localStorage.removeItem('resumeChat_messages');

    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during upload or parsing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Upload & Parsing Card */}
      <div className="card" style={{ padding: '40px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText /> Upload Your Resume for guided interview prep
        </h2>
        <p style={{ opacity: 0.8 }}>Upload your resume and get personalized interview prep guidance and questions.</p>

        {!parsedData && (
          <FileUpload 
            file={file}
            onFileChange={handleFileChange}
            onDrop={handleDrop}
            loading={loading}
            error={error}
            onUpload={uploadResume}
          />
        )}

        {parsedData && !parsedData.error && (
          <div className="parsed-results fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#4CAF50', marginBottom: '20px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="11" fill="#4CAF50" />
                <path d="M10 15.586L6.707 12.293L5.293 13.707L10 18.414L19.707 8.707L18.293 7.293L10 15.586Z" fill="white" />
              </svg>
              <h3 style={{ margin: 0, color: '#4CAF50' }}>Analysis Completed</h3>
            </div>
            
            <div className="result-section">
              <h4>Extracted Skills</h4>
              <div className="tags">
                {parsedData.skills && parsedData.skills.map((skill, i) => (
                  <span key={i} className="tag">{skill}</span>
                ))}
              </div>
            </div>

            <div className="result-section" style={{ marginTop: '30px' }}>
              <h4>Detected Projects/Experience</h4>
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {parsedData.projects && parsedData.projects.map((proj, i) => (
                  <li key={i} className="project-card">
                    {proj}
                  </li>
                ))}
              </ul>
            </div>
            
            <button onClick={() => { setParsedData(null); setFile(null); localStorage.removeItem('resumeChat_messages'); }} style={{ marginTop: '20px', backgroundColor: 'transparent', border: '1px solid var(--primary-color)', color: 'var(--text-color)' }}>
              Analyze Another Resume
            </button>
          </div>
        )}
        
        {parsedData && parsedData.error && (
            <div className="parsed-results fade-in">
                <h4>Raw Extraction (Failed to parse JSON)</h4>
                <pre style={{ whiteSpace: 'pre-wrap', background: 'rgba(0,0,0,0.1)', padding: '15px', borderRadius: '5px' }}>{parsedData.raw}</pre>
                <button onClick={() => { setParsedData(null); setFile(null); }} style={{ marginTop: '20px' }}>Try Again</button>
            </div>
        )}
      </div>

      {/* Resume Chat Card — only visible after a resume has been parsed */}
      {parsedData && (
        <ResumeChat />
      )}
    </div>
  );
};

export default ResumeParserPage;
