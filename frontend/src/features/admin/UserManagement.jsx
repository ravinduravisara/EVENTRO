import { useState } from 'react';
import { Search, Users, Shield, UserCheck, Mail, Calendar, Ban, Edit3, Eye, AlertTriangle, RefreshCw } from 'lucide-react';
import useFetch from '../../hooks/useFetch';

const UserManagement = () => {
  const { data, loading, error, refetch } = useFetch('/users');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
          <p className="text-red-400 font-medium">Failed to load users</p>
          <p className="text-gray-500 text-sm">{error}</p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30 transition text-sm"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  const users = data?.users || [];
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const totalUsers = users.length;
  const organizers = users.filter((u) => u.role === 'organizer').length;
  const admins = users.filter((u) => u.role === 'admin').length;
  const regularUsers = users.filter((u) => u.role === 'user').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">User Management</h1>
        <p className="text-gray-400 mt-1">View and manage platform users</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={totalUsers} color="blue" />
        <StatCard icon={UserCheck} label="Regular Users" value={regularUsers} color="cyan" />
        <StatCard icon={Users} label="Organizers" value={organizers} color="purple" />
        <StatCard icon={Shield} label="Admins" value={admins} color="red" />
      </div>

      {/* Filters */}
      <div className="bg-[#141B2D] rounded-xl border border-gray-700/50 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#0B1120] border border-gray-700/50 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2.5 bg-[#0B1120] border border-gray-700/50 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 min-w-[160px]"
          >
            <option value="all">All Roles</option>
            <option value="user">Regular Users</option>
            <option value="organizer">Organizers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#141B2D] rounded-xl border border-gray-700/50 overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-lg font-medium">No users found</p>
            <p className="text-gray-600 text-sm mt-1">
              {searchTerm || filterRole !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Users will appear here once they register'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/30">
                {filteredUsers.map((user, index) => (
                  <tr key={user._id || index} className="hover:bg-[#1a2236] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {user.firstName?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="font-medium text-white whitespace-nowrap">
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate max-w-[200px]">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.isEmailVerified ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors" title="Edit">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors" title="Ban">
                          <Ban className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer info */}
      {filteredUsers.length > 0 && (
        <div className="text-sm text-gray-500">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: 'text-blue-400', text: 'text-blue-400' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', icon: 'text-cyan-400', text: 'text-cyan-400' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: 'text-purple-400', text: 'text-purple-400' },
    red: { bg: 'bg-red-500/10', border: 'border-red-500/20', icon: 'text-red-400', text: 'text-red-400' },
  };
  const c = colors[color] || colors.blue;

  return (
    <div className={`${c.bg} ${c.border} border rounded-xl p-5`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-400">{label}</p>
        <Icon className={`w-5 h-5 ${c.icon}`} />
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
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${r.bg} ${r.text} border ${r.border}`}>
      {r.label}
    </span>
  );
};

export default UserManagement;
