import { useState, useEffect, useCallback } from 'react'
import {
  FiUsers,
  FiSearch,
  FiX,
  FiUserPlus,
  FiTrash2,
  FiShield,
  FiUser,
  FiMail,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiMoreVertical,
  FiAlertCircle,
} from 'react-icons/fi'
import { formatDate } from '../../utils/formatters'
import { adminService } from '../../services/adminService'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'

const UserManagement = () => {
  const { user: currentUser } = useAuth()
  const { t } = useLanguage()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all') // 'all', 'admin', 'user'
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'active', 'inactive'
  const [sortBy, setSortBy] = useState('recent') // 'recent', 'name', 'email'
  const [selectedUser, setSelectedUser] = useState(null)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await adminService.getUsers()
      setUsers(data)
    } catch (err) {
      setError(err.message || t('loadError', { ns: 'adminUsers' }))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const filterAndSortUsers = useCallback(() => {
    let filtered = [...users]

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((u) => u.role === roleFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((u) =>
        statusFilter === 'active' ? u.isActive : !u.isActive
      )
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (u) =>
          u.name?.toLowerCase().includes(query) ||
          u.email?.toLowerCase().includes(query)
      )
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '')
        case 'email':
          return (a.email || '').localeCompare(b.email || '')
        case 'recent':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt)
      }
    })

    setFilteredUsers(filtered)
  }, [users, searchQuery, roleFilter, statusFilter, sortBy])

  useEffect(() => {
    filterAndSortUsers()
  }, [filterAndSortUsers])

  const handleToggleStatus = async (userId) => {
    setError('')
    const target = users.find((u) => u.id === userId)
    if (!target) return
    try {
      const updated = await adminService.updateUserStatus(userId, !target.isActive)
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updated } : u)))
      setSelectedUser((prev) => (prev && prev.id === userId ? { ...prev, ...updated } : prev))
    } catch (err) {
      setError(err.message || t('statusUpdateError', { ns: 'adminUsers' }))
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    setError('')
    try {
      const updated = await adminService.updateUserRole(userId, newRole)
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updated } : u)))
      setSelectedUser((prev) => (prev && prev.id === userId ? { ...prev, ...updated } : prev))
    } catch (err) {
      setError(err.message || t('roleUpdateError', { ns: 'adminUsers' }))
    }
  }

  const handleDelete = async (userId) => {
    if (window.confirm(t('deleteConfirm', { ns: 'adminUsers' }))) {
      setError('')
      try {
        await adminService.deleteUser(userId)
        setUsers((prev) => prev.filter((u) => u.id !== userId))
        setSelectedUser((prev) => (prev && prev.id === userId ? null : prev))
      } catch (err) {
        setError(err.message || t('deleteError', { ns: 'adminUsers' }))
      }
    }
  }

  const getUserInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Calculate statistics
  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === 'admin').length,
    active: users.filter((u) => u.isActive).length,
    newThisMonth: users.filter(
      (u) => new Date(u.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length,
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('header.title', { ns: 'adminUsers' })}</h1>
          <p className="text-gray-600">{t('header.subtitle', { ns: 'adminUsers' })}</p>
        </div>
        <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 shadow-sm">
          <FiUserPlus className="w-5 h-5" />
          <span>{t('header.addUser', { ns: 'adminUsers' })}</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('stats.total', { ns: 'adminUsers' })}
          value={stats.total}
          icon={FiUsers}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          label={t('stats.admins', { ns: 'adminUsers' })}
          value={stats.admins}
          icon={FiShield}
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          label={t('stats.active', { ns: 'adminUsers' })}
          value={stats.active}
          icon={FiCheckCircle}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          label={t('stats.newThisMonth', { ns: 'adminUsers' })}
          value={stats.newThisMonth}
          icon={FiUserPlus}
          color="bg-orange-100 text-orange-600"
        />
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <FiAlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('filters.searchPlaceholder', { ns: 'adminUsers' })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Role Filter */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            {['all', 'admin', 'user'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                  roleFilter === role
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {role === 'all'
                  ? t('filters.roleAll', { ns: 'adminUsers' })
                  : role === 'admin'
                  ? t('filters.roleAdmin', { ns: 'adminUsers' })
                  : t('filters.roleUser', { ns: 'adminUsers' })}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            {['all', 'active', 'inactive'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                  statusFilter === status
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {status === 'all'
                  ? t('filters.statusAll', { ns: 'adminUsers' })
                  : status === 'active'
                  ? t('filters.statusActive', { ns: 'adminUsers' })
                  : t('filters.statusInactive', { ns: 'adminUsers' })}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
          >
            <option value="recent">{t('filters.sortRecent', { ns: 'adminUsers' })}</option>
            <option value="name">{t('filters.sortName', { ns: 'adminUsers' })}</option>
            <option value="email">{t('filters.sortEmail', { ns: 'adminUsers' })}</option>
          </select>
        </div>
      </div>

      {/* Users Display */}
      {filteredUsers.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <UserListItem
                key={user.id}
                user={user}
                isSelf={currentUser?.id === user.id}
                getUserInitials={getUserInitials}
                formatDate={formatDate}
                onToggleStatus={handleToggleStatus}
                onRoleChange={handleRoleChange}
                onDelete={handleDelete}
                onView={() => setSelectedUser(user)}
                t={t}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <FiUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('empty.title', { ns: 'adminUsers' })}</h3>
          <p className="text-gray-600">
            {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
              ? t('empty.withFilters', { ns: 'adminUsers' })
              : t('empty.noFilters', { ns: 'adminUsers' })}
          </p>
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          isSelf={currentUser?.id === selectedUser.id}
          getUserInitials={getUserInitials}
          formatDate={formatDate}
          onClose={() => setSelectedUser(null)}
          onToggleStatus={handleToggleStatus}
          onRoleChange={handleRoleChange}
          t={t}
        />
      )}
    </div>
  )
}

// Stat Card Component
const StatCard = ({ label, value, icon: Icon, color }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

// User List Item Component
const UserListItem = ({
  user,
  isSelf,
  getUserInitials,
  formatDate,
  onToggleStatus,
  onRoleChange,
  onDelete,
  onView,
  t,
}) => {
  return (
    <div className="p-6 hover:bg-gray-50 transition-colors group">
      <div className="flex items-center space-x-4">
        {/* User Avatar */}
        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-semibold text-primary-700">
            {getUserInitials(user.name)}
          </span>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div>
                <p className="font-semibold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500 flex items-center space-x-1 mt-1">
                  <FiMail className="w-3 h-3" />
                  <span>{user.email}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Role Badge */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${
                  user.role === 'admin'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {user.role === 'admin' ? (
                  <FiShield className="w-3 h-3" />
                ) : (
                  <FiUser className="w-3 h-3" />
                )}
                <span className="capitalize">
                  {t(`roleLabels.${user.role}`, { ns: 'adminUsers' })}
                </span>
              </span>
              {/* Status Badge */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${
                  user.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {user.isActive ? (
                  <FiCheckCircle className="w-3 h-3" />
                ) : (
                  <FiXCircle className="w-3 h-3" />
                )}
                <span>{user.isActive ? t('statusLabels.active', { ns: 'adminUsers' }) : t('statusLabels.inactive', { ns: 'adminUsers' })}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">{t('listItem.orders', { ns: 'adminUsers' })}</p>
              <p className="font-medium text-gray-900">
                {t('listItem.ordersCount', { ns: 'adminUsers', count: user.ordersCount || 0 })}
              </p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">{t('listItem.memberSince', { ns: 'adminUsers' })}</p>
              <p className="font-medium text-gray-900 flex items-center space-x-1">
                <FiCalendar className="w-4 h-4" />
                <span>{formatDate(user.createdAt)}</span>
              </p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">{t('listItem.userId', { ns: 'adminUsers' })}</p>
              <p className="font-medium text-gray-900">#{user.id}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onRoleChange(user.id, user.role === 'admin' ? 'user' : 'admin')}
            disabled={isSelf}
            className="p-2 rounded-lg transition-colors text-purple-600 hover:bg-purple-50 disabled:opacity-30 disabled:cursor-not-allowed"
            title={
              isSelf
                ? t('actions.cannotChangeOwnRole', { ns: 'adminUsers' })
                : user.role === 'admin'
                ? t('actions.demote', { ns: 'adminUsers' })
                : t('actions.promote', { ns: 'adminUsers' })
            }
          >
            <FiShield className="w-5 h-5" />
          </button>
          <button
            onClick={() => onToggleStatus(user.id)}
            disabled={isSelf}
            className={`p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
              user.isActive
                ? 'text-orange-600 hover:bg-orange-50'
                : 'text-green-600 hover:bg-green-50'
            }`}
            title={
              isSelf
                ? t('actions.cannotChangeOwnStatus', { ns: 'adminUsers' })
                : user.isActive
                ? t('actions.deactivate', { ns: 'adminUsers' })
                : t('actions.activate', { ns: 'adminUsers' })
            }
          >
            {user.isActive ? <FiXCircle className="w-5 h-5" /> : <FiCheckCircle className="w-5 h-5" />}
          </button>
          <button
            onClick={onView}
            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title={t('actions.viewDetails', { ns: 'adminUsers' })}
          >
            <FiMoreVertical className="w-5 h-5" />
          </button>
          {!isSelf && (
            <button
              onClick={() => onDelete(user.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title={t('actions.delete', { ns: 'adminUsers' })}
            >
              <FiTrash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// User Detail Modal
const UserDetailModal = ({ user, isSelf, getUserInitials, formatDate, onClose, onToggleStatus, onRoleChange, t }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">{t('modal.title', { ns: 'adminUsers' })}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* User Header */}
          <div className="flex items-center space-x-4 pb-6 border-b">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-lg font-semibold text-primary-700">
                {getUserInitials(user.name)}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>

          {/* User Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">{t('modal.role', { ns: 'adminUsers' })}</p>
              <span
                className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
                  user.role === 'admin'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {user.role === 'admin' ? (
                  <FiShield className="w-4 h-4" />
                ) : (
                  <FiUser className="w-4 h-4" />
                )}
                <span className="capitalize">
                  {t(`roleLabels.${user.role}`, { ns: 'adminUsers' })}
                </span>
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">{t('modal.status', { ns: 'adminUsers' })}</p>
              <span
                className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
                  user.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {user.isActive ? (
                  <FiCheckCircle className="w-4 h-4" />
                ) : (
                  <FiXCircle className="w-4 h-4" />
                )}
                <span>{user.isActive ? t('statusLabels.active', { ns: 'adminUsers' }) : t('statusLabels.inactive', { ns: 'adminUsers' })}</span>
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">{t('modal.userId', { ns: 'adminUsers' })}</p>
              <p className="font-medium text-gray-900">#{user.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">{t('modal.memberSince', { ns: 'adminUsers' })}</p>
              <p className="font-medium text-gray-900 flex items-center space-x-2">
                <FiCalendar className="w-4 h-4" />
                <span>{formatDate(user.createdAt)}</span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">{t('modal.totalOrders', { ns: 'adminUsers' })}</p>
              <p className="font-medium text-gray-900">
                {t('modal.ordersCount', { ns: 'adminUsers', count: user.ordersCount || 0 })}
              </p>
            </div>
          </div>

          {isSelf && (
            <p className="text-xs text-gray-400 italic">
              {t('modal.selfDisclaimer', { ns: 'adminUsers' })}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-wrap justify-end gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t('modal.close', { ns: 'adminUsers' })}
            </button>
            <button
              onClick={() => onRoleChange(user.id, user.role === 'admin' ? 'user' : 'admin')}
              disabled={isSelf}
              className="px-4 py-2 rounded-lg font-medium transition-colors bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {user.role === 'admin' ? t('modal.demote', { ns: 'adminUsers' }) : t('modal.promote', { ns: 'adminUsers' })}
            </button>
            <button
              onClick={() => onToggleStatus(user.id)}
              disabled={isSelf}
              className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                user.isActive
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {user.isActive ? t('modal.deactivateUser', { ns: 'adminUsers' }) : t('modal.activateUser', { ns: 'adminUsers' })}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserManagement
