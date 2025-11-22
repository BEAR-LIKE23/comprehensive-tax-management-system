
import React, { useState, useEffect } from 'react';
import { User, Role } from '../../types';
import { getAllUsers, updateUserProfile, adminCreateUser } from '../../services/apiService';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';

interface ManageUsersProps {
  user: User;
}

const ManageUsers: React.FC<ManageUsersProps> = ({ user }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role>(Role.TAXPAYER);
  
  // Registration Modal State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: Role.OFFICER, tin: '' });
  const [isCreating, setIsCreating] = useState(false);

  const { showToast } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    const data = await getAllUsers();
    setUsers(data.filter(u => u.id !== user.id)); // Don't show self
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [user.id]);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value as Role);
  };
  
  const handleEditClick = (userToEdit: User) => {
      setEditingUserId(userToEdit.id);
      setSelectedRole(userToEdit.role);
  }

  const handleSaveRole = async (userId: string) => {
    const updatedUser = await updateUserProfile(userId, { role: selectedRole });
    if (updatedUser) {
        setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
        showToast(`User role updated to ${selectedRole}`, 'success');
    }
    setEditingUserId(null);
  }

  // New User Registration Handlers
  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setNewUser(prev => ({ ...prev, [name]: value }));
  }

  const handleCreateUser = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newUser.name || !newUser.email || !newUser.password) {
          showToast('Please fill in all required fields', 'error');
          return;
      }
      if (newUser.password.length < 6) {
          showToast('Password must be at least 6 characters', 'error');
          return;
      }

      setIsCreating(true);
      const result = await adminCreateUser(newUser.name, newUser.email, newUser.password, newUser.role, newUser.tin);
      setIsCreating(false);

      if (result.success) {
          showToast(`User account created! A confirmation email has been sent to ${newUser.email}.`, 'success');
          setIsRegisterModalOpen(false);
          setNewUser({ name: '', email: '', password: '', role: Role.OFFICER, tin: '' });
          fetchUsers(); // Refresh list
      } else {
          showToast(result.error || 'Failed to create user', 'error');
      }
  }

  return (
    <>
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-0">Manage Users</h2>
            <button 
                onClick={() => setIsRegisterModalOpen(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Register New User
            </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">TIN</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={4} className="text-center py-10">Loading users...</td></tr>
              ) : users.map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{u.tin}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingUserId === u.id ? (
                          <select value={selectedRole} onChange={handleRoleChange} className="p-1 border rounded-md">
                              {Object.values(Role).map(role => <option key={role} value={role}>{role}</option>)}
                          </select>
                      ) : (
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === Role.ADMIN ? 'bg-purple-100 text-purple-800' : u.role === Role.OFFICER ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                            {u.role}
                          </span>
                      )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingUserId === u.id ? (
                          <>
                              <button onClick={() => handleSaveRole(u.id)} className="text-green-600 hover:text-green-900 mr-4">Save</button>
                              <button onClick={() => setEditingUserId(null)} className="text-gray-600 hover:text-gray-900">Cancel</button>
                          </>
                      ) : (
                          <button onClick={() => handleEditClick(u)} className="text-green-600 hover:text-green-900">Change Role</button>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} title="Register New Staff Account">
          <form onSubmit={handleCreateUser} className="space-y-4">
              <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded mb-4">
                  Create an account for a new Revenue Officer or Administrator. A confirmation email will be sent to them. They must verify their email before logging in.
              </p>
              <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input type="text" name="name" value={newUser.name} onChange={handleNewUserChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-green-500 focus:border-green-500" placeholder="e.g. John Officer" />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input type="email" name="email" value={newUser.email} onChange={handleNewUserChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-green-500 focus:border-green-500" placeholder="john@revenue.gov" />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input type="password" name="password" value={newUser.password} onChange={handleNewUserChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-green-500 focus:border-green-500" placeholder="Min 6 characters" />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select name="role" value={newUser.role} onChange={handleNewUserChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md">
                      <option value={Role.OFFICER}>Revenue Officer</option>
                      <option value={Role.ADMIN}>Administrator</option>
                      <option value={Role.TAXPAYER}>Taxpayer</option>
                  </select>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700">TIN (Optional)</label>
                  <input type="text" name="tin" value={newUser.tin} onChange={handleNewUserChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-green-500 focus:border-green-500" placeholder="Leave blank to auto-generate" />
              </div>
              
              <div className="pt-4 flex justify-end space-x-3">
                  <button type="button" onClick={() => setIsRegisterModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">Cancel</button>
                  <button type="submit" disabled={isCreating} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400">
                      {isCreating ? 'Creating...' : 'Create Account'}
                  </button>
              </div>
          </form>
      </Modal>
    </>
  );
};

export default ManageUsers;
