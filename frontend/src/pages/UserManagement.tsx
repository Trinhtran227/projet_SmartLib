import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Search,
    Filter,
    Plus,
    Edit,
    Trash2,
    Eye,
    Save,
    X,
    RefreshCw,
    Shield,
    UserCheck,
    UserX,
    Calendar,
    BookOpen,
    AlertTriangle,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { resolveMediaUrl } from '../lib/mediaUrl';

const UserManagement: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // State management
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [confirmAction, setConfirmAction] = useState<{
        type: 'deleteUser' | 'activateUser';
        id: string;
        name: string;
    } | null>(null);

    // Form state
    const [userForm, setUserForm] = useState({
        fullName: '',
        email: '',
        role: 'USER',
        status: 'ACTIVE',
        password: '',
        confirmPassword: ''
    });

    // Fetch users with filters
    const { data: usersData, isLoading: isLoadingUsers, error: usersError } = useQuery({
        queryKey: ['users-management', searchTerm, selectedRole, selectedStatus, currentPage],
        queryFn: async () => {
            return await apiClient.getUsers({
                q: searchTerm,
                role: selectedRole,
                status: selectedStatus,
                page: currentPage,
                limit: 10
            });
        },
        enabled: user?.role === 'ADMIN' || user?.role === 'LIBRARIAN'
    });

    // User statistics
    const { data: userStats, isLoading: isLoadingStats, error: statsError } = useQuery({
        queryKey: ['user-stats'],
        queryFn: async () => {
            return await apiClient.getUserStats();
        },
        enabled: user?.role === 'ADMIN' || user?.role === 'LIBRARIAN'
    });

    // Mutations
    const createUserMutation = useMutation({
        mutationFn: async (userData: any) => {
            return await apiClient.createUser(userData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users-management'] });
            queryClient.invalidateQueries({ queryKey: ['user-stats'] });
            setShowUserModal(false);
            setUserForm({ fullName: '', email: '', role: 'USER', status: 'ACTIVE', password: '', confirmPassword: '' });
            alert('Utilisateur ajouté avec succès !');
        },
        onError: (error: any) => {
            console.error('Create user error:', error);
            alert(error.response?.data?.error?.message || 'Une erreur est survenue lors de l\'ajout de l\'utilisateur');
        }
    });

    const updateUserMutation = useMutation({
        mutationFn: async ({ id, userData }: { id: string, userData: any }) => {
            return await apiClient.updateUser(id, userData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users-management'] });
            queryClient.invalidateQueries({ queryKey: ['user-stats'] });
            setShowUserModal(false);
            setEditingUser(null);
            setUserForm({ fullName: '', email: '', role: 'USER', status: 'ACTIVE', password: '', confirmPassword: '' });
            alert('Utilisateur mis à jour avec succès !');
        },
        onError: (error: any) => {
            console.error('Update user error:', error);
            alert(error.response?.data?.error?.message || 'Une erreur est survenue lors de la mise à jour de l\'utilisateur');
        }
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (id: string) => {
            return await apiClient.deleteUser(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users-management'] });
            queryClient.invalidateQueries({ queryKey: ['user-stats'] });
            alert('Utilisateur supprimé avec succès !');
        },
        onError: (error: any) => {
            console.error('Delete user error:', error);
            alert(error.response?.data?.error?.message || 'Une erreur est survenue lors de la suppression de l\'utilisateur');
        }
    });


    const activateUserMutation = useMutation({
        mutationFn: async (id: string) => {
            return await apiClient.updateUserStatus(id, 'ACTIVE');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users-management'] });
            queryClient.invalidateQueries({ queryKey: ['user-stats'] });
            alert('Utilisateur activé !');
        },
        onError: (error: any) => {
            console.error('Activate user error:', error);
            alert(error.response?.data?.error?.message || 'Une erreur est survenue lors de l\'activation de l\'utilisateur');
        }
    });

    // Form handlers
    const handleUserSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (userForm.password !== userForm.confirmPassword) {
            alert('Les mots de passe ne correspondent pas !');
            return;
        }

        const submitData = {
            fullName: userForm.fullName,
            email: userForm.email,
            role: userForm.role,
            status: userForm.status,
            ...(userForm.password && { password: userForm.password })
        };

        if (editingUser) {
            updateUserMutation.mutate({ id: editingUser._id, userData: submitData });
        } else {
            createUserMutation.mutate(submitData);
        }
    };

    const openUserModal = (user?: any) => {
        if (user) {
            setEditingUser(user);
            setUserForm({
                fullName: user.fullName || '',
                email: user.email || '',
                role: user.role || 'USER',
                status: user.status || 'ACTIVE',
                password: '',
                confirmPassword: ''
            });
        } else {
            setEditingUser(null);
            setUserForm({ fullName: '', email: '', role: 'USER', status: 'ACTIVE', password: '', confirmPassword: '' });
        }
        setShowUserModal(true);
    };

    const openDetailsModal = (user: any) => {
        setSelectedUser(user);
        setShowDetailsModal(true);
    };

    // Fetch detailed user stats when viewing user details
    const { data: userDetailedStats, isLoading: isLoadingUserStats } = useQuery({
        queryKey: ['user-detailed-stats', selectedUser?._id],
        queryFn: async () => {
            if (selectedUser?._id) {
                return await apiClient.getUserDetailedStats(selectedUser._id);
            }
            return null;
        },
        enabled: !!selectedUser?._id && (user?.role === 'ADMIN' || user?.role === 'LIBRARIAN')
    });

    const handleDeleteConfirm = (type: 'deleteUser' | 'activateUser', id: string, name: string) => {
        setConfirmAction({ type, id, name });
        setShowConfirmModal(true);
    };

    const executeAction = () => {
        if (!confirmAction) return;

        switch (confirmAction.type) {
            case 'deleteUser':
                deleteUserMutation.mutate(confirmAction.id);
                break;
            case 'activateUser':
                activateUserMutation.mutate(confirmAction.id);
                break;
        }

        setShowConfirmModal(false);
        setConfirmAction(null);
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'text-red-400 bg-red-500/20';
            case 'LIBRARIAN': return 'text-blue-400 bg-blue-500/20';
            case 'USER': return 'text-green-400 bg-green-500/20';
            default: return 'text-gray-400 bg-gray-500/20';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'text-green-400 bg-green-500/20';
            case 'INACTIVE': return 'text-gray-400 bg-gray-500/20';
            default: return 'text-gray-400 bg-gray-500/20';
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'ADMIN': return Shield;
            case 'LIBRARIAN': return UserCheck;
            case 'USER': return Users;
            default: return Users;
        }
    };

    if (!user || (user.role !== 'ADMIN' && user.role !== 'LIBRARIAN')) {
        return (
            <div className="min-h-screen bg-dark-900 pt-16 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🚫</div>
                    <h2 className="text-2xl font-heading font-bold text-dark-300 mb-4">
                        Accès refusé
                    </h2>
                    <p className="text-dark-400 mb-8">
                        Vous devez être administrateur ou bibliothécaire pour accéder à cette page.
                    </p>
                </div>
            </div>
        );
    }

    if (isLoadingUsers) {
        return (
            <div className="min-h-screen bg-dark-900 pt-16 flex items-center justify-center">
                <LoadingSpinner size="lg" text="Chargement de la liste des utilisateurs..." />
            </div>
        );
    }

    if (usersError) {
        return (
            <div className="min-h-screen bg-dark-900 pt-16 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-heading font-bold text-dark-300 mb-4">
                        Erreur de chargement des données
                    </h2>
                    <p className="text-dark-400 mb-8">
                        Impossible de charger la liste des utilisateurs. Veuillez réessayer plus tard.
                    </p>
                    <Button
                        variant="primary"
                        onClick={() => window.location.reload()}
                    >
                        Réessayer
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-900 pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-heading font-bold text-dark-50 mb-2">
                            Gestion des utilisateurs
                        </h1>
                        <p className="text-dark-300">
                            Gérer les comptes d'utilisateurs et les autorisations du système
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            variant="primary"
                            onClick={() => openUserModal()}
                            className="flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Ajouter un utilisateur
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <motion.div
                        className="glass-card p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-xl bg-blue-500/20">
                                <Users className="w-6 h-6 text-blue-400" />
                            </div>
                            <div className="text-sm font-medium text-green-400">
                                +12%
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-dark-50 mb-1">
                                {userStats?.totalUsers || usersData?.meta?.total || 0}
                            </h3>
                            <p className="text-dark-300 text-sm">Total des utilisateurs</p>
                            <p className="text-dark-400 text-xs mt-1">
                                {userStats?.totalLibrarians || 0} bibliothécaires et admin
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="glass-card p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-xl bg-green-500/20">
                                <UserCheck className="w-6 h-6 text-green-400" />
                            </div>
                            <div className="text-sm font-medium text-green-400">
                                +8%
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-dark-50 mb-1">
                                {userStats?.activeLoans || 0}
                            </h3>
                            <p className="text-dark-300 text-sm">Prêts en cours</p>
                            <p className="text-dark-400 text-xs mt-1">
                                {userStats?.totalBorrowed || 0} livres empruntés
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="glass-card p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-xl bg-purple-500/20">
                                <Shield className="w-6 h-6 text-purple-400" />
                            </div>
                            <div className="text-sm font-medium text-green-400">
                                +5%
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-dark-50 mb-1">
                                {userStats?.totalLibrarians || 0}
                            </h3>
                            <p className="text-dark-300 text-sm">Bibliothécaires et Admin</p>
                            <p className="text-dark-400 text-xs mt-1">
                                {userStats?.totalUsers || 0} utilisateurs normaux
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="glass-card p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-xl bg-red-500/20">
                                <UserX className="w-6 h-6 text-red-400" />
                            </div>
                            <div className="text-sm font-medium text-red-400">
                                -2%
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-dark-50 mb-1">
                                {userStats?.overdueLoans || 0}
                            </h3>
                            <p className="text-dark-300 text-sm">Livres en retard</p>
                            <p className="text-dark-400 text-xs mt-1">
                                À traiter immédiatement
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Filters and Search */}
                <div className="glass-card p-6 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Rechercher par nom ou e-mail..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="input-field pl-10"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="input-field"
                            >
                                <option value="">Tous les rôles</option>
                                <option value="ADMIN">Administrateur</option>
                                <option value="LIBRARIAN">Bibliothécaire</option>
                                <option value="USER">Utilisateur</option>
                            </select>

                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="input-field"
                            >
                                <option value="">Tous les statuts</option>
                                <option value="ACTIVE">Actif</option>
                                <option value="INACTIVE">Inactif</option>
                            </select>

                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedRole('');
                                    setSelectedStatus('');
                                    setCurrentPage(1);
                                }}
                                className="flex items-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Actualiser
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-dark-800">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                                        Utilisateur
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                                        Rôle
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                                        Statut
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                                        Activité
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-medium text-dark-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-700">
                                {usersData?.users && usersData.users.length > 0 ? (
                                    usersData.users.map((user: any, index: number) => {
                                        const RoleIcon = getRoleIcon(user.role);
                                        return (
                                            <motion.tr
                                                key={user._id}
                                                className="hover:bg-dark-800/50 transition-colors"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            {user.avatarUrl ? (
                                                                <>
                                                                    <img
                                                                        className="h-10 w-10 rounded-full object-cover"
                                                                        src={resolveMediaUrl(user.avatarUrl)}
                                                                        alt={user.fullName}
                                                                        onError={(e) => {
                                                                            e.currentTarget.style.display = 'none';
                                                                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                                        }}
                                                                    />
                                                                    <div className={`h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center ${user.avatarUrl ? 'hidden' : ''}`}>
                                                                        <Users className="w-5 h-5 text-white" />
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center">
                                                                    <span className="text-sm font-medium text-white">
                                                                        {user.fullName.charAt(0).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-dark-50">
                                                                {user.fullName}
                                                            </div>
                                                            <div className="text-sm text-dark-400">
                                                                {user.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                                        <RoleIcon className="w-3 h-3" />
                                                        {user.role === 'ADMIN' ? 'Administrateur' :
                                                            user.role === 'LIBRARIAN' ? 'Bibliothécaire' : 'Utilisateur'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                                                        {user.status === 'ACTIVE' ? (
                                                            <>
                                                                <CheckCircle className="w-3 h-3" />
                                                                Actif
                                                            </>
                                                        ) : (
                                                            <>
                                                                <XCircle className="w-3 h-3" />
                                                                Inactif
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-300">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <BookOpen className="w-3 h-3" />
                                                            <span>{user.totalLoans || 0} prêts</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <BookOpen className="w-3 h-3" />
                                                            <span>{user.activeLoans || 0} en cours</span>
                                                        </div>
                                                        {user.overdueLoans > 0 ? (
                                                            <div className="flex items-center gap-2 text-red-400">
                                                                <AlertTriangle className="w-3 h-3" />
                                                                <span>{user.overdueLoans} en retard</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2 text-gray-400">
                                                                <AlertTriangle className="w-3 h-3" />
                                                                <span>0 en retard</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => openDetailsModal(user)}
                                                            className="text-blue-400 hover:text-blue-300"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => openUserModal(user)}
                                                            className="text-green-400 hover:text-green-300"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        {user.status === 'INACTIVE' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteConfirm('activateUser', user._id, user.fullName)}
                                                                className="text-green-400 hover:text-green-300"
                                                            >
                                                                <UserCheck className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteConfirm('deleteUser', user._id, user.fullName)}
                                                            className="text-red-400 hover:text-red-300"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <div className="text-center">
                                                <div className="text-4xl mb-4">👥</div>
                                                <h3 className="text-lg font-medium text-dark-300 mb-2">
                                                    Aucun utilisateur
                                                </h3>
                                                <p className="text-dark-400 mb-4">
                                                    {searchTerm || selectedRole || selectedStatus
                                                        ? 'Aucun utilisateur ne correspond aux filtres'
                                                        : 'Aucun utilisateur dans le système'
                                                    }
                                                </p>
                                                {!searchTerm && !selectedRole && !selectedStatus && (
                                                    <Button
                                                        variant="primary"
                                                        onClick={() => openUserModal()}
                                                        className="flex items-center gap-2 mx-auto"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        Ajouter le premier utilisateur
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {usersData?.meta && usersData.meta.pages > 1 && (
                        <div className="px-6 py-4 border-t border-dark-700">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-dark-400">
                                    Affichage de {((currentPage - 1) * 10) + 1} à {Math.min(currentPage * 10, usersData.meta.total)} sur {usersData.meta.total} résultats
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Précédent
                                    </Button>
                                    <span className="text-sm text-dark-300">
                                        Page {currentPage} / {usersData.meta.pages}
                                    </span>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.min(usersData.meta.pages, prev + 1))}
                                        disabled={currentPage === usersData.meta.pages}
                                    >
                                        Suivant
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* User Modal */}
            {showUserModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-dark-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-heading font-semibold text-dark-50">
                                {editingUser ? 'Modifier l\'utilisateur' : 'Ajouter un nouvel utilisateur'}
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowUserModal(false)}
                                className="text-dark-400 hover:text-dark-200"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <form onSubmit={handleUserSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-dark-300 mb-2">
                                        Nom complet *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={userForm.fullName}
                                        onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                                        className="input-field"
                                        placeholder="Saisir le nom complet"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-300 mb-2">
                                        E-mail *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={userForm.email}
                                        onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                                        className="input-field"
                                        placeholder="Saisir l'e-mail"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-300 mb-2">
                                        Rôle *
                                    </label>
                                    <select
                                        value={userForm.role}
                                        onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                                        className="input-field"
                                    >
                                        <option value="USER">Utilisateur</option>
                                        <option value="LIBRARIAN">Bibliothécaire</option>
                                        <option value="ADMIN">Administrateur</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-300 mb-2">
                                        Statut *
                                    </label>
                                    <select
                                        value={userForm.status}
                                        onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                                        className="input-field"
                                    >
                                        <option value="ACTIVE">Actif</option>
                                        <option value="INACTIVE">Inactif</option>
                                    </select>
                                </div>
                                {!editingUser && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                                Mot de passe *
                                            </label>
                                            <input
                                                type="password"
                                                required={!editingUser}
                                                value={userForm.password}
                                                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                                                className="input-field"
                                                placeholder="Saisir le mot de passe"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                                Confirmer le mot de passe *
                                            </label>
                                            <input
                                                type="password"
                                                required={!editingUser}
                                                value={userForm.confirmPassword}
                                                onChange={(e) => setUserForm({ ...userForm, confirmPassword: e.target.value })}
                                                className="input-field"
                                                placeholder="Confirmer le mot de passe"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowUserModal(false)}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={createUserMutation.isPending || updateUserMutation.isPending}
                                >
                                    {createUserMutation.isPending || updateUserMutation.isPending ? (
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4 mr-2" />
                                    )}
                                    {editingUser ? 'Mettre à jour' : 'Ajouter un utilisateur'}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* User Details Modal */}
            {showDetailsModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-dark-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-heading font-semibold text-dark-50">
                                Détails de l'utilisateur
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowDetailsModal(false)}
                                className="text-dark-400 hover:text-dark-200"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="space-y-6">
                            {/* User Info */}
                            <div className="flex items-center gap-4">
                                {selectedUser.avatarUrl ? (
                                    <>
                                        <img
                                            className="h-16 w-16 rounded-full object-cover"
                                            src={resolveMediaUrl(selectedUser.avatarUrl)}
                                            alt={selectedUser.fullName}
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                            }}
                                        />
                                        <div className={`h-16 w-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center ${selectedUser.avatarUrl ? 'hidden' : ''}`}>
                                            <Users className="w-8 h-8 text-white" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-16 w-16 rounded-full bg-primary-500 flex items-center justify-center">
                                        <span className="text-xl font-medium text-white">
                                            {selectedUser.fullName.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <h4 className="text-xl font-semibold text-dark-50">
                                        {selectedUser.fullName}
                                    </h4>
                                    <p className="text-dark-400">{selectedUser.email}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(selectedUser.role)}`}>
                                            {selectedUser.role === 'ADMIN' ? 'Administrateur' :
                                                selectedUser.role === 'LIBRARIAN' ? 'Bibliothécaire' : 'Utilisateur'}
                                        </div>
                                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedUser.status)}`}>
                                            {selectedUser.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Activity Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-dark-700 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-400 mb-1">
                                        {isLoadingUserStats ? '...' : (userDetailedStats?.totalLoans || selectedUser?.totalLoans || 0)}
                                    </div>
                                    <div className="text-dark-300 text-sm">Total des prêts</div>
                                </div>
                                <div className="text-center p-4 bg-dark-700 rounded-lg">
                                    <div className="text-2xl font-bold text-green-400 mb-1">
                                        {isLoadingUserStats ? '...' : (userDetailedStats?.activeLoans || selectedUser?.activeLoans || 0)}
                                    </div>
                                    <div className="text-dark-300 text-sm">En cours</div>
                                </div>
                                <div className="text-center p-4 bg-dark-700 rounded-lg">
                                    <div className="text-2xl font-bold text-red-400 mb-1">
                                        {isLoadingUserStats ? '...' : (userDetailedStats?.overdueLoans || selectedUser?.overdueLoans || 0)}
                                    </div>
                                    <div className="text-dark-300 text-sm">En retard</div>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-dark-400" />
                                    <div>
                                        <div className="text-dark-300 text-sm">Date de création du compte</div>
                                        <div className="text-dark-50">
                                            {format(new Date(selectedUser.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Confirm Action Modal */}
            {showConfirmModal && confirmAction && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-dark-800 rounded-xl p-6 w-full max-w-md"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-heading font-semibold text-dark-50">
                                Confirmer l'action
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowConfirmModal(false)}
                                className="text-dark-400 hover:text-dark-200"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="mb-6">
                            <p className="text-dark-300 mb-2">
                                Êtes-vous sûr de vouloir {confirmAction.type === 'deleteUser' ? 'supprimer' :
                                    'activer'} cet utilisateur ?
                            </p>
                            <p className="text-dark-400 text-sm">
                                <strong>{confirmAction.name}</strong>
                            </p>
                            {confirmAction.type === 'deleteUser' && (
                                <p className="text-red-400 text-sm mt-2">
                                    Cette action est irréversible !
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3">
                            <Button
                                variant="secondary"
                                onClick={() => setShowConfirmModal(false)}
                            >
                                Annuler
                            </Button>
                            <Button
                                variant="primary"
                                onClick={executeAction}
                                className={confirmAction.type === 'deleteUser' ? 'bg-red-500 hover:bg-red-600' : ''}
                            >
                                {confirmAction.type === 'deleteUser' ? (
                                    <>
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Supprimer
                                    </>
                                ) : (
                                    <>
                                        <UserCheck className="w-4 h-4 mr-2" />
                                        Activer
                                    </>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
