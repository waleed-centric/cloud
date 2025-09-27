
interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}
import { useAwsBuilder } from '../../context/AwsBuilderContext';
import { useState } from 'react';
export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { exportToDrawIo } = useAwsBuilder();
  const [exportData, setExportData] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleExport = () => {
    const data = exportToDrawIo();
    setExportData(data);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aws-architecture.drawio';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Export to Draw.io</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <button
            onClick={handleExport}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
          >
            Generate Export Data
          </button>
          
          {exportData && (
            <>
              <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded mr-2 ${
                  copied 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-500 text-white hover:bg-gray-600'
                }`}
              >
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
              
              <button
                onClick={handleDownload}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              >
                Download as .drawio
              </button>
            </>
          )}
        </div>

        {exportData && (
          <div className="border rounded p-4 bg-gray-50 overflow-auto max-h-96">
            <h3 className="font-semibold mb-2">Export Data:</h3>
            <pre className="text-sm whitespace-pre-wrap break-all">
              {exportData}
            </pre>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Instructions:</strong></p>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Click &quot;Generate Export Data&quot; to create the Draw.io format</li>
            <li>Copy the data or download as .drawio file</li>
            <li>Open Draw.io (app.diagrams.net)</li>
            <li>
              In Draw.io, go to <strong>File &rarr; Import from &rarr; Device</strong>
            </li>
            <li>
              Select the downloaded <code>.drawio</code> file or paste the copied data
            </li>
            <li>
              Your AWS architecture will be imported with all icons and connections
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};