
import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { updateUserProfile, uploadAvatar } from '../../services/apiService';
import { useToast } from '../../context/ToastContext';

interface ProfileProps {
  user: User;
  onUserUpdate: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUserUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: user.name, email: user.email });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setFormData({ name: user.name, email: user.email });
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const updatedUser = await updateUserProfile(user.id, { name: formData.name, email: formData.email });
    if (updatedUser) {
        onUserUpdate(updatedUser);
        showToast('Profile details updated successfully.', 'success');
    } else {
        showToast('Failed to update profile details.', 'error');
    }
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({ name: user.name, email: user.email });
    setIsEditing(false);
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            showToast("File size too big. Max 2MB allowed.", 'error');
            return;
        }

        setIsUploadingAvatar(true);
        const newAvatarUrl = await uploadAvatar(user.id, file);
        setIsUploadingAvatar(false);

        if (newAvatarUrl) {
             const updatedUser = { ...user, avatar_url: newAvatarUrl };
             onUserUpdate(updatedUser);
             showToast('Profile picture updated successfully!', 'success');
        } else {
             showToast('Failed to update profile picture. Please try again.', 'error');
        }
    }
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 border-b pb-4">My Profile</h2>
      <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8">
        <div className="relative group">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full ring-4 ring-green-200 overflow-hidden">
                <img 
                    className="w-full h-full object-cover" 
                    src={user.avatar_url} 
                    alt={`${user.name}'s avatar`} 
                />
                {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                         <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                    </div>
                )}
            </div>
            <label 
                htmlFor="avatar-upload" 
                className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-green-700 transition-colors duration-200"
                title="Change Profile Picture"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </label>
            <input 
                id="avatar-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleAvatarChange}
                disabled={isUploadingAvatar}
            />
        </div>

        <div className="text-center sm:text-left flex-1">
            {isEditing ? (
                 <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="text-2xl font-bold text-gray-900 border-b-2 border-green-300 focus:outline-none focus:border-green-500 w-full mb-1"
                />
            ) : (
                <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
            )}
          <p className="text-md text-gray-500">{user.role}</p>
        </div>
      </div>
      <div className="mt-8 space-y-4">
        <div className="flex flex-wrap items-center">
            <p className="w-full sm:w-1/3 font-semibold text-gray-600">Taxpayer Type:</p>
            <p className="w-full sm:w-2/3 text-gray-800">{user.taxpayer_type}</p>
        </div>
        <div className="flex flex-wrap items-center">
            <p className="w-full sm:w-1/3 font-semibold text-gray-600">TIN:</p>
            <p className="w-full sm:w-2/3 text-gray-800 font-mono bg-gray-100 px-2 py-1 rounded">{user.tin}</p>
        </div>
        <div className="flex flex-wrap items-center">
            <p className="w-full sm:w-1/3 font-semibold text-gray-600">Email:</p>
             {isEditing ? (
                 <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full sm:w-2/3 text-gray-800 border-b-2 border-green-300 focus:outline-none focus:border-green-500"
                    disabled // Email is used for login, should not be editable here
                />
            ) : (
                <p className="w-full sm:w-2/3 text-gray-800">{user.email}</p>
            )}
        </div>
      </div>
       <div className="mt-8 border-t pt-6 flex justify-end space-x-4">
            {isEditing ? (
                <>
                    <button onClick={handleCancel} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={isSaving} className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400">
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </>
            ) : (
                 <button onClick={() => setIsEditing(true)} className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    Edit Profile
                </button>
            )}
       </div>
    </div>
  );
};

export default Profile;
