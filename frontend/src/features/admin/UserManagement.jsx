import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Ban,
  Calendar,
  Edit3,
  Eye,
  Mail,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  UserCheck,
  Users,
} from 'lucide-react';
import api from '../../services/api';

const USER_ROLE_OPTIONS = ['user', 'organizer', 'admin'];

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editRole, setEditRole] = useState('user');

  const [actionLoadingKey, setActionLoadingKey] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/users');
      const sourceUsers = Array.isArray(data) ? data : data?.users;
      setUsers(Array.isArray(sourceUsers) ? sourceUsers : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const showActionMessage = (message) => {
    setActionMessage(message);
    window.setTimeout(() => setActionMessage(''), 2400);
  };

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const name = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
      const email = String(user.email || '').toLowerCase();

      const matchesSearch =
        !query || name.includes(query) || email.includes(query);
      const matchesRole = filterRole === 'all' || user.role === filterRole;

      const statusLabel = user.isBanned
        ? 'banned'
        : user.isEmailVerified
          ? 'verified'
          : 'pending';
      const matchesStatus = filterStatus === 'all' || statusLabel === filterStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, filterRole, filterStatus]);

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const regularUsers = users.filter((u) => u.role === 'user').length;
    const organizers = users.filter((u) => u.role === 'organizer').length;
    const admins = users.filter((u) => u.role === 'admin').length;

    return { totalUsers, regularUsers, organizers, admins };
  }, [users]);

  const handleStartEdit = (user) => {
    setEditingUserId(user._id);
    setEditRole(user.role || 'user');
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditRole('user');
  };

  const handleSaveRole = async (user) => {
    if (!user?._id) return;

    const loadingKey = `role-${user._id}`;
    setActionLoadingKey(loadingKey);

    try {
      const { data } = await api.patch(`/users/${user._id}/role`, { role: editRole });
      const updatedUser = data?.user;

      if (updatedUser) {
        setUsers((current) =>
          current.map((item) => (item._id === updatedUser._id ? updatedUser : item))
        );
      }

      setEditingUserId(null);
      showActionMessage(data?.message || 'Role updated successfully');
    } catch (err) {
      showActionMessage(err.response?.data?.message || 'Failed to update role');
    } finally {
      setActionLoadingKey('');
    }
  };

  const handleToggleBan = async (user) => {
    if (!user?._id) return;

    const loadingKey = `ban-${user._id}`;
    setActionLoadingKey(loadingKey);

    try {
      const nextBanned = !Boolean(user.isBanned);
      const { data } = await api.patch(`/users/${user._id}/status`, { isBanned: nextBanned });
      const updatedUser = data?.user;

      if (updatedUser) {
        setUsers((current) =>
          current.map((item) => (item._id === updatedUser._id ? updatedUser : item))
        );
      }

      showActionMessage(data?.message || (nextBanned ? 'User banned' : 'User unbanned'));
    } catch (err) {
      showActionMessage(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoadingKey('');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!user?._id) return;

    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
    const ok = window.confirm(`Delete ${fullName}? This action cannot be undone.`);
    if (!ok) return;

    const loadingKey = `delete-${user._id}`;
    setActionLoadingKey(loadingKey);

    try {
      const { data } = await api.delete(`/users/${user._id}`);
      setUsers((current) => current.filter((item) => item._id !== user._id));

      if (selectedUser?._id === user._id) {
        setSelectedUser(null);
      }

      showActionMessage(data?.message || 'User deleted successfully');
    } catch (err) {
      showActionMessage(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setActionLoadingKey('');
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-500"></div>
          <p className="text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="space-y-3 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
          <p className="font-medium text-red-400">Failed to load users</p>
          <p className="text-sm text-gray-500">{error}</p>
          <button
            onClick={loadUsers}
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-indigo-500/20 px-4 py-2 text-sm text-indigo-400 transition hover:bg-indigo-500/30"
          >
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {actionMessage && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300">
          {actionMessage}
        </div>
      )}

      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="mt-1 text-gray-400">Review users, roles, and account status</p>
        </div>
        <button
          onClick={loadUsers}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-700/60 bg-[#141B2D] px-3.5 py-2 text-sm text-gray-300 transition hover:bg-[#1a2236]"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="blue" />
        <StatCard icon={UserCheck} label="Regular Users" value={stats.regularUsers} color="cyan" />
        <StatCard icon={Users} label="Organizers" value={stats.organizers} color="purple" />
        <StatCard icon={Shield} label="Admins" value={stats.admins} color="red" />
      </div>

      <div className="rounded-xl border border-gray-700/50 bg-[#141B2D] p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-700/50 bg-[#0B1120] py-2.5 pl-10 pr-4 text-gray-200 placeholder-gray-500 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="min-w-[160px] rounded-lg border border-gray-700/50 bg-[#0B1120] px-4 py-2.5 text-gray-200 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="all">All Roles</option>
            <option value="user">Regular Users</option>
            <option value="organizer">Organizers</option>
            <option value="admin">Admins</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="min-w-[160px] rounded-lg border border-gray-700/50 bg-[#0B1120] px-4 py-2.5 text-gray-200 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="all">All Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="banned">Banned</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-700/50 bg-[#141B2D]">
        {filteredUsers.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="mx-auto mb-3 h-12 w-12 text-gray-600" />
            <p className="text-lg font-medium text-gray-400">No users found</p>
            <p className="mt-1 text-sm text-gray-600">
              {searchTerm || filterRole !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Users will appear here once they register'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Joined</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/30">
                {filteredUsers.map((user) => {
                  const isRoleSaving = actionLoadingKey === `role-${user._id}`;
                  const isStatusSaving = actionLoadingKey === `ban-${user._id}`;
                  const isDeleting = actionLoadingKey === `delete-${user._id}`;
                  const isProtectedAdmin =
                    String(user.email || '').toLowerCase() === 'admin@eventro.com';

                  return (
                    <tr key={user._id} className="transition-colors hover:bg-[#1a2236]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
                            {user.firstName?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <span className="whitespace-nowrap font-medium text-white">
                            {user.firstName || 'Unknown'} {user.lastName || ''}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          <span className="max-w-[240px] truncate">{user.email}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {editingUserId === user._id ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={editRole}
                              onChange={(e) => setEditRole(e.target.value)}
                              className="rounded-lg border border-gray-700/50 bg-[#0B1120] px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            >
                              {USER_ROLE_OPTIONS.map((role) => (
                                <option key={role} value={role}>
                                  {role}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleSaveRole(user)}
                              disabled={isRoleSaving}
                              className="rounded-lg bg-emerald-500/20 px-2.5 py-1.5 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/30 disabled:opacity-60"
                            >
                              {isRoleSaving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="rounded-lg bg-gray-700/50 px-2.5 py-1.5 text-xs font-medium text-gray-300 transition hover:bg-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <RoleBadge role={user.role} />
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge user={user} />
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-700/50 hover:text-white"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleStartEdit(user)}
                            disabled={isProtectedAdmin}
                            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-700/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                            title={
                              isProtectedAdmin
                                ? 'Protected admin role cannot be changed'
                                : 'Edit role'
                            }
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleBan(user)}
                            disabled={isStatusSaving}
                            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-60"
                            title={user.isBanned ? 'Unban user' : 'Ban user'}
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            disabled={isDeleting}
                            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-60"
                            title="Delete user"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filteredUsers.length > 0 && (
        <div className="text-sm text-gray-500">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-gray-700/50 bg-[#141B2D] p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">User Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-sm text-gray-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <p className="text-gray-300">
                <span className="text-gray-500">Name:</span> {selectedUser.firstName} {selectedUser.lastName}
              </p>
              <p className="text-gray-300">
                <span className="text-gray-500">Email:</span> {selectedUser.email}
              </p>
              <p className="text-gray-300">
                <span className="text-gray-500">Role:</span> {selectedUser.role || 'user'}
              </p>
              <p className="text-gray-300">
                <span className="text-gray-500">Joined:</span> {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'N/A'}
              </p>
              <p className="text-gray-300">
                <span className="text-gray-500">Status:</span>{' '}
                {selectedUser.isBanned ? 'Banned' : selectedUser.isEmailVerified ? 'Verified' : 'Pending'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: 'text-blue-400' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', icon: 'text-cyan-400' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: 'text-purple-400' },
    red: { bg: 'bg-red-500/10', border: 'border-red-500/20', icon: 'text-red-400' },
  };
  const c = colors[color] || colors.blue;

  return (
    <div className={`${c.bg} ${c.border} rounded-xl border p-5`}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-400">{label}</p>
        <Icon className={`h-5 w-5 ${c.icon}`} />
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
};

const RoleBadge = ({ role }) => {
  const roles = {
    user: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', label: 'User' },
    organizer: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', label: 'Organizer' },
    admin: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', label: 'Admin' },
  };
  const r = roles[role] || roles.user;

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${r.bg} ${r.text} ${r.border}`}>
      {r.label}
    </span>
  );
};

const StatusBadge = ({ user }) => {
  if (user.isBanned) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400">
        <span className="h-1.5 w-1.5 rounded-full bg-red-400"></span>
        Banned
      </span>
    );
  }

  if (user.isEmailVerified) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
        Verified
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
      Pending
    </span>
  );
};

export default UserManagement;
