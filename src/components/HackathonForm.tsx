import React, { useState, useEffect } from 'react';
import { Link2, Loader2, Copy, CheckCircle } from 'lucide-react';
import { HackathonDetails } from '../types';
import { extractHackathonDetails, listAvailableModels } from '../lib/gemini';
import toast from 'react-hot-toast';

export default function HackathonForm() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<HackathonDetails | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Just call it, but don't worry about errors
    listAvailableModels().catch(err => {
      console.log("Could not connect to Gemini API", err);
    });
  }, []);

  const handleExtractDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await extractHackathonDetails(url);
      
      if (result.success && result.data) {
        setDetails(result.data);
        toast.success('Details extracted successfully!');
      } else {
        toast.error(result.error || 'Failed to extract details');
      }
    } catch (error) {
      toast.error('An error occurred while extracting details');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!details) return;

    const message = `🚀 ${details.name}
📍 Mode: ${details.mode}${details.venue ? ` (Venue: ${details.venue})` : ''}
📅 Dates: ${details.startDate} - ${details.endDate}
📝 Registration Deadline: ${details.registrationDeadline}
👥 Team Size: ${details.teamSize} members
🏆 Prize: ${details.prizePool}
📑 PPT Submission Required: ${details.pptRequired ? 'Yes' : 'No'}
🔗 Register Here: ${details.url}`;

    navigator.clipboard.writeText(message);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-black">Quick Hack Insights</h1>
        <p className="text-gray-500 mt-2">
          Paste a hackathon URL from Devfolio, Devpost, or Unstop and get a formatted message ready to share.
        </p>
      </div>

      <form
        onSubmit={handleExtractDetails}
        className="w-full max-w-md bg-white shadow-md rounded-lg p-6 space-y-6"
      >
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
            Paste hackathon URL here...
          </label>
          <input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/hackathon"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Extracting...' : 'Extract Hackathon Details'}
        </button>
      </form>

      {details && (
        <div className="mt-8 w-full max-w-md bg-gray-50 shadow-md rounded-lg p-6">
          <h3 className="text-lg font-semibold text-black mb-4">Extracted Details</h3>
          <div className="text-sm text-gray-800 space-y-2">
            <p><strong>🚀 Name:</strong> {details.name}</p>
            <p><strong>📍 Mode:</strong> {details.mode}{details.venue ? ` (Venue: ${details.venue})` : ''}</p>
            <p><strong>📅 Dates:</strong> {details.startDate} - {details.endDate}</p>
            <p><strong>📝 Registration Deadline:</strong> {details.registrationDeadline}</p>
            <p><strong>👥 Team Size:</strong> {details.teamSize} members</p>
            <p><strong>🏆 Prize:</strong> {details.prizePool}</p>
            <p><strong>📑 PPT Submission Required:</strong> {details.pptRequired ? 'Yes' : 'No'}</p>
            <p><strong>🔗 Register Here:</strong> <a href={details.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">{details.url}</a></p>
          </div>
          <button
            onClick={copyToClipboard}
            className="mt-4 w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
}