import React, { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  Check,
  Users,
  Loader
} from "lucide-react";
import { getPotentialChatUsers, createGroupChat } from '../services/messageService';

const CreateGroupChat = ({ open, handleClose, onSuccess }) => {
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      loadPotentialUsers();
    } else {
      // Reset form when dialog closes
      setGroupName('');
      setSelectedUsers([]);
      setSearchQuery('');
      setError('');
    }
  }, [open]);

  const loadPotentialUsers = async () => {
    try {
      setLoading(true);
      const response = await getPotentialChatUsers();
      setAvailableUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading potential users:', error);
      setError('Failed to load users. Please try again.');
      setLoading(false);
    }
  };

  const handleSelectUser = (user) => {
    const isSelected = selectedUsers.some(u => u._id === user._id);
    
    if (isSelected) {
      setSelectedUsers(selectedUsers.filter(u => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setError('Please enter a group name');
      return;
    }

    if (selectedUsers.length < 2) {
      setError('Please select at least 2 users');
      return;
    }

    try {
      setLoading(true);
      const userIds = selectedUsers.map(user => user._id);
      await createGroupChat(groupName, userIds);
      setLoading(false);
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error creating group chat:', error);
      setError('Failed to create group chat. Please try again.');
      setLoading(false);
    }
  };

  const filteredUsers = availableUsers.filter(user => 
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={handleClose}></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Create Group Chat
                </h3>

                <div className="mt-6">
                  <label htmlFor="group-name" className="block text-sm font-medium text-gray-700">
                    Group Name
                  </label>
                  <input
                    type="text"
                    id="group-name"
                    className={`mt-1 block w-full border ${error && error.includes('group name') ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    autoFocus
                  />
                  {error && error.includes('group name') && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                  )}
                </div>

                {selectedUsers.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedUsers.map(user => (
                      <div 
                        key={user._id} 
                        className="flex items-center gap-1 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full"
                      >
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                          {getInitials(`${user.firstName} ${user.lastName}`)}
                        </div>
                        <span>
                          {`${user.firstName} ${user.lastName}`}
                        </span>
                        <button 
                          type="button" 
                          className="text-blue-800 hover:text-blue-900 focus:outline-none"
                          onClick={() => handleSelectUser(user)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="mt-4 flex justify-center py-8">
                    <Loader size={24} className="animate-spin text-blue-500" />
                  </div>
                ) : availableUsers.length === 0 ? (
                  <div className="mt-4 text-center text-gray-500 py-8">
                    No users available
                  </div>
                ) : (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700">
                      Select Users ({selectedUsers.length} selected)
                    </h4>
                    <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                      {filteredUsers.map(user => (
                        <div 
                          key={user._id} 
                          className="flex items-center justify-between py-2 px-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleSelectUser(user)}
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                              {getInitials(`${user.firstName} ${user.lastName}`)}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{`${user.firstName} ${user.lastName}`}</p>
                              <p className="text-sm text-gray-500">
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                              </p>
                            </div>
                          </div>
                          <div className={`w-5 h-5 border rounded-sm flex items-center justify-center ${selectedUsers.some(u => u._id === user._id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                            {selectedUsers.some(u => u._id === user._id) && (
                              <Check size={14} className="text-white" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {error && !error.includes('group name') && (
                  <div className="mt-4 text-sm text-red-600">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${loading || selectedUsers.length < 2 || !groupName.trim() ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-base font-medium text-white focus:outline-none sm:ml-3 sm:w-auto sm:text-sm`}
              onClick={handleCreateGroup}
              disabled={loading || selectedUsers.length < 2 || !groupName.trim()}
            >
              {loading ? (
                <Loader size={18} className="animate-spin mr-2" />
              ) : (
                <Users size={18} className="mr-2" />
              )}
              Create Group
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={handleClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupChat; 