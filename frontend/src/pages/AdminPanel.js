import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Users, MessageSquare, Plus, Edit, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('notifications');
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // Notification form state
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    content: '',
    type: 'notification',
    priority: 'medium',
    category: 'general'
  });
  const [editingNotification, setEditingNotification] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      if (activeTab === 'users') {
        const response = await axios.get('/api/admin/users');
        setUsers(response.data.users);
      } else if (activeTab === 'notifications') {
        const response = await axios.get('/api/notifications');
        setNotifications(response.data.notifications);
      } else if (activeTab === 'stats') {
        const response = await axios.get('/api/admin/stats');
        setStats(response.data);
      }
    } catch (error) {
      console.error('Admin data fetch failed:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingNotification) {
        await axios.put(`/api/notifications/${editingNotification._id}`, notificationForm);
        toast.success('Notification updated successfully');
        setEditingNotification(null);
      } else {
        await axios.post('/api/notifications', notificationForm);
        toast.success('Notification created successfully');
      }

      setNotificationForm({
        title: '',
        content: '',
        type: 'notification',
        priority: 'medium',
        category: 'general'
      });
      fetchAdminData();
    } catch (error) {
      console.error('Notification save error:', error);
      toast.error('Failed to save notification');
    }
  };

  const handleEditNotification = (notification) => {
    setEditingNotification(notification);
    setNotificationForm({
      title: notification.title,
      content: notification.content,
      type: notification.type,
      priority: notification.priority,
      category: notification.category
    });
  };

  const handleDeleteNotification = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await axios.delete(`/api/notifications/${id}`);
        toast.success('Notification deleted');
        fetchAdminData();
      } catch (error) {
        console.error('Delete notification error:', error);
        toast.error('Failed to delete notification');
      }
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await axios.put(`/api/admin/users/${userId}/role`, { role: newRole });
      toast.success('User role updated');
      fetchAdminData();
    } catch (error) {
      console.error('Update user role error:', error);
      toast.error('Failed to update user role');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Settings className="h-16 w-16 text-primary-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600 mt-2">
          Manage users, notifications, and system settings
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'notifications', label: 'Notifications', icon: MessageSquare },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'stats', label: 'Statistics', icon: Settings }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">
              {editingNotification ? 'Edit Notification' : 'Create Notification'}
            </h2>
            <form onSubmit={handleNotificationSubmit} className="space-y-4">
              <div>
                <label className="label">Title</label>
                <input
                  type="text"
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="label">Content</label>
                <textarea
                  value={notificationForm.content}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, content: e.target.value }))}
                  className="input-field h-32"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Type</label>
                  <select
                    value={notificationForm.type}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, type: e.target.value }))}
                    className="input-field"
                  >
                    <option value="notification">Notification</option>
                    <option value="advisory">Advisory</option>
                    <option value="alert">Alert</option>
                    <option value="update">Update</option>
                  </select>
                </div>

                <div>
                  <label className="label">Priority</label>
                  <select
                    value={notificationForm.priority}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, priority: e.target.value }))}
                    className="input-field"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="label">Category</label>
                  <select
                    value={notificationForm.category}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, category: e.target.value }))}
                    className="input-field"
                  >
                    <option value="general">General</option>
                    <option value="weather">Weather</option>
                    <option value="crop">Crop</option>
                    <option value="pest">Pest</option>
                    <option value="market">Market</option>
                    <option value="policy">Policy</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-2">
                <button type="submit" className="btn-primary">
                  {editingNotification ? 'Update' : 'Create'} Notification
                </button>
                {editingNotification && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingNotification(null);
                      setNotificationForm({
                        title: '',
                        content: '',
                        type: 'notification',
                        priority: 'medium',
                        category: 'general'
                      });
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Recent Notifications</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <div key={notification._id} className="border rounded p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.content}
                      </p>
                      <div className="flex space-x-2 mt-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                          notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {notification.priority}
                        </span>
                        <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">
                          {notification.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-1 ml-2">
                      <button
                        onClick={() => handleEditNotification(notification)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteNotification(notification._id)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.avatar && (
                          <img className="h-8 w-8 rounded-full mr-3" src={user.avatar} alt="" />
                        )}
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user._id, e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="farmer">Farmer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card text-center">
            <Users className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold">Total Users</h3>
            <p className="text-3xl font-bold text-primary-600">{stats.users?.total || 0}</p>
          </div>

          <div className="card text-center">
            <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold">Farmers</h3>
            <p className="text-3xl font-bold text-green-600">{stats.users?.farmers || 0}</p>
          </div>

          <div className="card text-center">
            <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold">Total Notifications</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.notifications?.total || 0}</p>
          </div>

          <div className="card text-center">
            <MessageSquare className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold">Active Notifications</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.notifications?.active || 0}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;