import React from 'react';
import { UploadCloud, Loader } from 'lucide-react';

const FileUpload = ({ file, onFileChange, onDrop, loading, error, onUpload }) => {
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <>
      <div 
        className="drop-zone"
        onDragOver={handleDragOver}
        onDrop={onDrop}
      >
        <input 
          type="file" 
          accept=".pdf" 
          onChange={onFileChange} 
          id="file-upload" 
          style={{ display: 'none' }}
        />
        <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          <UploadCloud size={48} color="var(--primary-color)" />
          {file ? (
            <span style={{ fontWeight: 'bold' }}>{file.name}</span>
          ) : (
            <span>Drag & Drop your PDF here or <strong>browse</strong></span>
          )}
        </label>
      </div>

      {file && (
        <button 
          onClick={onUpload} 
          disabled={loading}
          style={{ width: '100%', marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', padding: '15px', fontSize: '1.1rem' }}
        >
          {loading ? <><Loader className="spin" /> Analyzing with Llama 3...</> : 'Extract Data'}
        </button>
      )}

      {error && <div style={{ color: '#ef476f', marginTop: '20px', padding: '10px', backgroundColor: 'rgba(239, 71, 111, 0.1)', borderRadius: '5px' }}>{error}</div>}
    </>
  );
};

export default FileUpload;
