import { useState, useEffect } from 'react';
import { Users, FileText, Activity, Clock, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({ members: 0, documents: 0 });
  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const [membersList, setMembersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDocs, setExpandedDocs] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [membersRes, docsRes] = await Promise.all([
          fetch('/api/members', { headers }),
          fetch('/api/documents', { headers })
        ]);

        const members = await membersRes.json();
        const docs = await docsRes.json();

        setMembersList(members);
        setStats({
          members: members.length || 0,
          documents: docs.length || 0
        });
        setRecentDocs(docs.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteDocument = async (id: number) => {
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setRecentDocs(recentDocs.filter(doc => doc.id !== id));
        setStats(prev => ({ ...prev, documents: prev.documents - 1 }));
      } else {
        console.error('Failed to delete document');
      }
    } catch (error) {
      console.error('Failed to delete document', error);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg border border-slate-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-slate-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Total Family Members</dt>
                  <dd className="text-lg font-medium text-slate-900">{stats.members}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border border-slate-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-slate-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Total Documents</dt>
                  <dd className="text-lg font-medium text-slate-900">{stats.documents}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border border-slate-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-6 w-6 text-slate-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Health Alerts</dt>
                  <dd className="text-lg font-medium text-slate-900">
                    {recentDocs.filter(d => d.analysis_risks && JSON.parse(d.analysis_risks).length > 0).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Documents */}
      <div className="bg-white shadow rounded-lg border border-slate-200">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-slate-200">
          <h3 className="text-lg leading-6 font-medium text-slate-900">Uploaded Reports</h3>
          <Link to="/dashboard/upload" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Upload new
          </Link>
        </div>
        <div className="px-4 py-5 sm:p-0">
          {recentDocs.length === 0 ? (
            <div className="text-center py-6 text-slate-500">No documents uploaded yet.</div>
          ) : (
            <ul className="divide-y divide-slate-200">
              {recentDocs.map((doc) => {
                const memberName = membersList.find(m => m.id === doc.member_id)?.name || 'Unknown';
                return (
                  <li key={doc.id} className="py-4 px-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-slate-400 mr-3 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            <a href={doc.file_url} target="_blank" rel="noreferrer" className="hover:underline text-indigo-600">{doc.title}</a>
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {doc.type} • For: {memberName} • {new Date(doc.created_at).toLocaleDateString()}
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
                          onClick={() => setExpandedDocs(prev => ({ ...prev, [doc.id]: !prev[doc.id] }))}
                          className="text-indigo-500 hover:text-indigo-700 p-1 rounded-md hover:bg-indigo-50 transition-colors"
                          title="View Analysis"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                          title="Delete Document"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  
                  {expandedDocs[doc.id] && doc.status === 'completed' && (
                    <div className="mt-4 bg-slate-50 rounded-md p-4 border border-slate-200">
                      <h4 className="text-sm font-semibold text-slate-900 flex items-center mb-2">
                        AI Summary
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
                            <h4 className="text-sm font-semibold text-slate-900 mb-2">Possible Risks</h4>
                            <ul className="list-disc pl-5 text-sm text-red-700 space-y-1">
                              {JSON.parse(doc.analysis_risks).map((r: string, i: number) => <li key={i}>{r}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
