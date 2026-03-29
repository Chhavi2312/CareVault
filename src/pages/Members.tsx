import { useState, useEffect } from 'react';
import { Plus, Trash2, User } from 'lucide-react';

export default function Members() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', relation: '', dob: '', gender: 'Male', blood_group: 'O+'
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/members', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setMembers(data);
    } catch (error) {
      console.error('Failed to fetch members', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowAddForm(false);
        setFormData({ name: '', relation: '', dob: '', gender: 'Male', blood_group: 'O+' });
        fetchMembers();
      }
    } catch (error) {
      console.error('Failed to add member', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/members/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        fetchMembers();
      }
    } catch (error) {
      console.error('Failed to delete member', error);
    }
  };

  if (loading) return <div>Loading members...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-slate-900">Family Members</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add Member
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white shadow sm:rounded-lg border border-slate-200 p-6">
          <form onSubmit={handleAddMember} className="space-y-4">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Relation</label>
                <input type="text" required value={formData.relation} onChange={e => setFormData({...formData, relation: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Date of Birth</label>
                <input type="date" required value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Gender</label>
                <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Blood Group</label>
                <select value={formData.blood_group} onChange={e => setFormData({...formData, blood_group: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg}>{bg}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50">Cancel</button>
              <button type="submit" className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">Save</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md border border-slate-200">
        <ul className="divide-y divide-slate-200">
          {members.map((member) => (
            <li key={member.id}>
              <div className="px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:px-6">
                <div className="min-w-0 flex-1 flex items-center">
                  <div className="flex-shrink-0 bg-slate-100 rounded-full p-2">
                    <User className="h-6 w-6 text-slate-500" />
                  </div>
                  <div className="ml-4 min-w-0">
                    <p className="font-medium text-indigo-600 truncate">{member.name}</p>
                    <p className="mt-1 text-sm text-slate-500 truncate">
                      {member.relation} • {member.gender} • {member.blood_group}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 flex justify-end">
                  <button onClick={() => handleDelete(member.id)} className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50 transition-colors">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
          {members.length === 0 && (
            <li className="px-4 py-8 text-center text-slate-500">No family members added yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
