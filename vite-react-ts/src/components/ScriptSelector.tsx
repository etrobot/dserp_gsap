import React from 'react';

interface ScriptSelectorProps {
  files: string[];
  onSelect: (fileName: string) => void;
  className?: string;
}

const ScriptSelector: React.FC<ScriptSelectorProps> = ({ files, onSelect, className = '' }) => {
  return (
    <div className={`min-h-screen bg-gray-800 p-8 ${className}`}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Select a Script
        </h1>

        <div className="space-y-3">
          {files.map((file) => (
            <button
              key={file}
              onClick={() => onSelect(file)}
              className="w-full bg-gray-900 rounded-lg p-4 text-left hover:bg-gray-700 transition-all border border-gray-700 hover:border-blue-500"
            >
              <h3 className="text-lg font-semibold text-white">
                {file}
              </h3>
            </button>
          ))}
        </div>

        {files.length === 0 && (
          <div className="text-center text-gray-400 mt-12">
            No scripts available
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptSelector;
