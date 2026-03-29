import { useState, useEffect } from 'react';
import { UploadCloud, File, CheckCircle, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

export default function Upload() {
  const [members, setMembers] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    member_id: '', title: '', type: 'Blood Test'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [membersRes, docsRes] = await Promise.all([
        fetch('/api/members', { headers }),
        fetch('/api/documents', { headers })
      ]);
      setMembers(await membersRes.json());
      setDocuments(await docsRes.json());
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const analyzeDocument = async (documentId: number, file: File) => {
    try {
      const base64Data = await fileToBase64(file);
      const mimeType = file.type;

      const isImage = mimeType.startsWith('image/');
      const isPdf = mimeType === 'application/pdf';

      if (!isImage && !isPdf) {
        await updateDocumentAnalysis(documentId, {
          status: 'failed',
          summary: 'Unsupported file format for analysis.',
          precautions: [],
          risks: []
        });
        return;
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Analyze this medical report. Provide a JSON response with the following keys:
      - summary: A brief 2-3 sentence summary of the report.
      - precautions: An array of strings containing recommended precautions or next steps.
      - risks: An array of strings containing possible health risks or abnormal findings.
      If the document is not a medical report, return empty arrays and a summary stating it's not a medical report.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          prompt
        ],
        config: {
          responseMimeType: 'application/json'
        }
      });

      const resultText = response.text;
      if (resultText) {
        const result = JSON.parse(resultText);
        await updateDocumentAnalysis(documentId, {
          status: 'completed',
          summary: result.summary || 'No summary available.',
          precautions: result.precautions || [],
          risks: result.risks || []
        });
      }
    } catch (error) {
      console.error('AI Analysis Error:', error);
      await updateDocumentAnalysis(documentId, {
        status: 'failed',
        summary: 'Failed to analyze document.',
        precautions: [],
        risks: []
      });
    }
  };

  const updateDocumentAnalysis = async (documentId: number, data: any) => {
    try {
      await fetch(`/api/documents/${documentId}/analysis`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      fetchData();
    } catch (error) {
      console.error('Failed to update document analysis', error);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      console.error('Please select a file');
      return;
    }
    if (!formData.member_id) {
      console.error('Please select a family member');
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append('file', file);
    data.append('member_id', formData.member_id);
    data.append('title', formData.title);
    data.append('type', formData.type);

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: data
      });
      if (res.ok) {
        const docData = await res.json();
        
        // Optimistically update UI to show analyzing status
        setDocuments(prev => [{...docData, status: 'analyzing'}, ...prev]);
        
        setFile(null);
        setFormData({ ...formData, title: '' });
        
        // Trigger AI analysis on the frontend
        analyzeDocument(docData.id, file);
      }
    } catch (error) {
      console.error('Upload failed', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (id: number) => {
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setDocuments(documents.filter(doc => doc.id !== id));
      } else {
        console.error('Failed to delete document');
      }
    } catch (error) {
      console.error('Failed to delete document', error);
    }
  };

  const refreshDocs = () => fetchData();

  return (
    <div className="space-y-8">
      {/* Upload Form */}
      <div className="bg-white shadow sm:rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg leading-6 font-medium text-slate-900 mb-4">Upload Medical Report</h3>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Family Member</label>
              <select required value={formData.member_id} onChange={e => setFormData({...formData, member_id: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <option value="">Select a member</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Document Title</label>
              <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="e.g. Annual Blood Test" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Report Type</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <option>Blood Test</option>
                <option>Prescription</option>
                <option>Lab Report</option>
                <option>Scan Report</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">File (PDF, JPG, PNG)</label>
              <input type="file" required accept=".pdf,.jpg,.jpeg,.png" onChange={e => setFile(e.target.files?.[0] || null)} className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
              {loading ? <RefreshCw className="animate-spin -ml-1 mr-2 h-5 w-5" /> : <UploadCloud className="-ml-1 mr-2 h-5 w-5" />}
              Upload & Analyze
            </button>
          </div>
        </form>
      </div>

      {/* Documents List */}
      <div className="bg-white shadow sm:rounded-lg border border-slate-200">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-slate-200">
          <h3 className="text-lg leading-6 font-medium text-slate-900">Uploaded Documents & AI Analysis</h3>
          <button onClick={refreshDocs} className="text-slate-400 hover:text-slate-600">
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
        <div className="px-4 py-5 sm:p-0">
          <ul className="divide-y divide-slate-200">
            {documents.map((doc) => (
              <li key={doc.id} className="p-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center">
                    <File className="h-6 w-6 text-slate-400 mr-3 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        <a href={doc.file_url} target="_blank" rel="noreferrer" className="hover:underline">{doc.title}</a>
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {doc.type} • For: {members.find(m => m.id === doc.member_id)?.name || 'Unknown'} • {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${doc.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        doc.status === 'analyzing' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {doc.status}
                    </span>
                    <button 
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                      title="Delete Document"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* AI Analysis Results */}
                {doc.status === 'completed' && (
                  <div className="mt-4 bg-slate-50 rounded-md p-4 border border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-900 flex items-center mb-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> AI Summary
                    </h4>
                    <p className="text-sm text-slate-700 mb-4">{doc.analysis_summary}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {doc.analysis_precautions && JSON.parse(doc.analysis_precautions).length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900 mb-2">Precautions</h4>
                          <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                            {JSON.parse(doc.analysis_precautions).map((p: string, i: number) => <li key={i}>{p}</li>)}
                          </ul>
                        </div>
                      )}
                      {doc.analysis_risks && JSON.parse(doc.analysis_risks).length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900 flex items-center mb-2">
                            <AlertCircle className="h-4 w-4 text-red-500 mr-2" /> Possible Risks
                          </h4>
                          <ul className="list-disc pl-5 text-sm text-red-700 space-y-1">
                            {JSON.parse(doc.analysis_risks).map((r: string, i: number) => <li key={i}>{r}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {doc.status === 'analyzing' && (
                  <div className="mt-2 text-sm text-slate-500 flex items-center">
                    <RefreshCw className="animate-spin h-4 w-4 mr-2" /> AI is analyzing this document...
                  </div>
                )}
              </li>
            ))}
            {documents.length === 0 && (
              <li className="px-4 py-8 text-center text-slate-500">No documents uploaded yet.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
