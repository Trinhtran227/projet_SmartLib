import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    BookOpen,
    Clock,
    AlertTriangle,
    User,
    Calendar,
    DollarSign,
    RefreshCw,
    Eye,
    Check
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const LoanManagement: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'pending' | 'borrowed' | 'extensions' | 'fines'>('pending');
    const [selectedLoan, setSelectedLoan] = useState<any>(null);
    const [selectedFine, setSelectedFine] = useState<any>(null);
    const [showLoanModal, setShowLoanModal] = useState(false);
    const [showExtensionModal, setShowExtensionModal] = useState(false);
    const [showFineModal, setShowFineModal] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [actionNotes, setActionNotes] = useState('');
    const [returnConditions, setReturnConditions] = useState<{ [key: string]: { condition: string, notes: string, damageLevel: number } }>({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [finePolicy, setFinePolicy] = useState<any>(null);

    // Fetch pending loans
    const { data: pendingLoans, isLoading: isLoadingLoans, refetch: refetchLoans, error: loansError } = useQuery({
        queryKey: ['pending-loans'],
        queryFn: () => apiClient.getPendingLoans(1, 20, 'PENDING'),
        enabled: !!(user && (user.role === 'ADMIN' || user.role === 'LIBRARIAN'))
    });

    // Fetch borrowed loans
    const { data: borrowedLoans, isLoading: isLoadingBorrowed, refetch: refetchBorrowed } = useQuery({
        queryKey: ['borrowed-loans'],
        queryFn: () => apiClient.getPendingLoans(1, 20, 'BORROWED'),
        enabled: !!(user && (user.role === 'ADMIN' || user.role === 'LIBRARIAN'))
    });

    // Fetch extensions
    const { data: extensions, isLoading: isLoadingExtensions, refetch: refetchExtensions } = useQuery({
        queryKey: ['extensions'],
        queryFn: () => apiClient.getExtensions(1, 20, 'PENDING'),
        enabled: !!(user && (user.role === 'ADMIN' || user.role === 'LIBRARIAN'))
    });

    // Fetch fines
    const { data: fines, isLoading: isLoadingFines, refetch: refetchFines } = useQuery({
        queryKey: ['fines'],
        queryFn: async () => {
            const result = await apiClient.getFines(1, 20, 'PENDING');
            console.log('Fines data received:', result);
            return result;
        },
        enabled: !!(user && (user.role === 'ADMIN' || user.role === 'LIBRARIAN'))
    });

    // Fetch fine policy
    const { data: policyData } = useQuery({
        queryKey: ['fine-policy'],
        queryFn: () => apiClient.getFinePolicy(),
        enabled: !!(user && (user.role === 'ADMIN' || user.role === 'LIBRARIAN'))
    });

    // Update fine policy when data is loaded
    React.useEffect(() => {
        if (policyData) {
            setFinePolicy(policyData);
        }
    }, [policyData]);

    // Debug logging
    console.log('User role:', user?.role);
    console.log('Pending loans data:', pendingLoans);
    console.log('Is loading loans:', isLoadingLoans);
    console.log('Loans error:', loansError);

    // Check if user has permission
    if (!user || (user.role !== 'ADMIN' && user.role !== 'LIBRARIAN')) {
        return (
            <div className="min-h-screen bg-dark-900 pt-16 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🚫</div>
                    <h2 className="text-2xl font-heading font-bold text-dark-300 mb-4">
                        Accès refusé
                    </h2>
                    <p className="text-dark-400 mb-8">
                        Vous devez disposer de privilèges d'administrateur ou de bibliothécaire pour accéder à cette page.
                    </p>
                    <p className="text-sm text-dark-500">
                        Rôle actuel : {user?.role || 'Non connecté'}
                    </p>
                </div>
            </div>
        );
    }

    const handleApproveLoan = async () => {
        if (!selectedLoan) return;

        console.log('Approving loan:', selectedLoan._id);
        console.log('Loan items:', selectedLoan.items);

        setIsProcessing(true);
        try {
            const result = await apiClient.approveLoan(selectedLoan._id, actionNotes);
            console.log('Loan approval result:', result);
            toast.success('Emprunt approuvé');
            setShowLoanModal(false);
            setSelectedLoan(null);
            setActionNotes('');
            refetchLoans();
        } catch (error: any) {
            console.error('Approve loan error:', error);
            console.error('Error response:', error.response?.data);
            const errorMessage = error.response?.data?.error?.message ||
                error.response?.data?.message ||
                'Une erreur est survenue lors de l\'approbation de l\'emprunt';
            toast.error(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRejectLoan = async () => {
        if (!selectedLoan) return;

        setIsProcessing(true);
        try {
            await apiClient.rejectLoan(selectedLoan._id, actionNotes);
            toast.success('Emprunt refusé');
            setShowLoanModal(false);
            setSelectedLoan(null);
            setActionNotes('');
            refetchLoans();
        } catch (error: any) {
            console.error('Reject loan error:', error);
            const errorMessage = error.response?.data?.error?.message ||
                error.response?.data?.message ||
                'Une erreur est survenue lors du refus de l\'emprunt';
            toast.error(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    const showConfirmation = (message: string, action: () => void) => {
        setConfirmMessage(message);
        setConfirmAction(() => action);
        setShowConfirmDialog(true);
    };

    const handleConfirm = () => {
        if (confirmAction) {
            confirmAction();
        }
        setShowConfirmDialog(false);
        setConfirmAction(null);
        setConfirmMessage('');
    };

    const handleApproveExtension = async () => {
        if (!selectedLoan) return;

        setIsProcessing(true);
        try {
            await apiClient.approveExtension(selectedLoan._id, actionNotes);
            toast.success('Prolongation approuvée');
            setShowExtensionModal(false);
            setSelectedLoan(null);
            setActionNotes('');
            refetchExtensions();
        } catch (error: any) {
            toast.error(error.response?.data?.error?.message || 'Une erreur est survenue');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRejectExtension = async () => {
        if (!selectedLoan) return;

        setIsProcessing(true);
        try {
            await apiClient.rejectExtension(selectedLoan._id, actionNotes);
            toast.success('Prolongation refusée');
            setShowExtensionModal(false);
            setSelectedLoan(null);
            setActionNotes('');
            refetchExtensions();
        } catch (error: any) {
            toast.error(error.response?.data?.error?.message || 'Une erreur est survenue');
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePayFine = async () => {
        if (!selectedFine) return;

        setIsProcessing(true);
        try {
            await apiClient.payFine(selectedFine._id);
            toast.success('Amende payée avec succès');
            setShowFineModal(false);
            setSelectedLoan(null);
            setActionNotes('');
            refetchFines();
        } catch (error: any) {
            console.error('Pay fine error:', error);
            const errorMessage = error.response?.data?.error?.message ||
                error.response?.data?.message ||
                'Une erreur est survenue lors du paiement de l\'amende';
            toast.error(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleWaiveFine = async () => {
        if (!selectedFine) return;

        setIsProcessing(true);
        try {
            await apiClient.waiveFine(selectedFine._id, actionNotes);
            toast.success('Amende annulée avec succès');
            setShowFineModal(false);
            setSelectedLoan(null);
            setActionNotes('');
            refetchFines();
        } catch (error: any) {
            console.error('Waive fine error:', error);
            const errorMessage = error.response?.data?.error?.message ||
                error.response?.data?.message ||
                'Une erreur est survenue lors de l\'annulation de l\'amende';
            toast.error(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReturnLoan = async () => {
        if (!selectedLoan) return;

        setIsProcessing(true);
        try {
            // Prepare returned items with conditions
            const returnedItems = selectedLoan.items.map((item: any) => ({
                bookId: item.bookId._id,
                qty: item.qty,
                condition: returnConditions[item.bookId._id]?.condition || 'GOOD',
                damageLevel: returnConditions[item.bookId._id]?.damageLevel || 0,
                notes: returnConditions[item.bookId._id]?.notes || ''
            }));

            await apiClient.returnLoan(selectedLoan._id, returnedItems, actionNotes);
            toast.success('Livre retourné avec succès');
            setShowReturnModal(false);
            setSelectedLoan(null);
            setReturnConditions({});
            setActionNotes('');
            refetchBorrowed();
        } catch (error: any) {
            toast.error(error.response?.data?.error?.message || 'Une erreur est survenue');
        } finally {
            setIsProcessing(false);
        }
    };

    // Format status to Vietnamese
    const formatStatus = (status: string) => {
        const statusMap: { [key: string]: string } = {
            'PENDING': 'En attente',
            'BORROWED': 'Emprunté',
            'PARTIAL_RETURN': 'Retour partiel',
            'RETURNED': 'Retourné',
            'OVERDUE': 'En retard',
            'CANCELLED': 'Annulé',
            // Fine statuses
            'PAID': 'Payé',
            'WAIVED': 'Annulé'
        };
        return statusMap[status] || status;
    };

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-500/20 text-yellow-400';
            case 'BORROWED':
                return 'bg-green-500/20 text-green-400';
            case 'PARTIAL_RETURN':
                return 'bg-orange-500/20 text-orange-400';
            case 'OVERDUE':
                return 'bg-red-500/20 text-red-400';
            case 'RETURNED':
                return 'bg-blue-500/20 text-blue-400';
            case 'CANCELLED':
                return 'bg-gray-500/20 text-gray-400';
            // Fine statuses
            case 'PAID':
                return 'bg-green-500/20 text-green-400';
            case 'WAIVED':
                return 'bg-blue-500/20 text-blue-400';
            default:
                return 'bg-gray-500/20 text-gray-400';
        }
    };


    return (
        <div className="min-h-screen bg-dark-900 pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-heading font-bold text-dark-50 mb-4">
                        Gérer les emprunts
                    </h1>
                    <p className="text-dark-300">
                        Approuver les demandes d'emprunt, les prolongations et gérer les amendes
                    </p>
                </div>

                {/* Tabs */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-1 glass rounded-xl p-1">
                        {[
                            { id: 'pending', label: 'En attente', icon: Clock, count: pendingLoans?.meta?.total || 0 },
                            { id: 'borrowed', label: 'Empruntés', icon: BookOpen, count: borrowedLoans?.meta?.total || 0 },
                            { id: 'extensions', label: 'Prolongations', icon: Calendar, count: extensions?.meta?.total || 0 },
                            { id: 'fines', label: 'Amendes', icon: DollarSign, count: fines?.meta?.total || 0 },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === tab.id
                                    ? 'bg-primary-500 text-white'
                                    : 'text-dark-300 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                                {tab.count > 0 && (
                                    <span className="bg-accent-500 text-white text-xs rounded-full px-2 py-1">
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="glass-card p-6">
                    {activeTab === 'pending' && (
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h2 className="text-xl font-heading font-semibold text-dark-50">
                                        Demandes d'emprunt en attente
                                    </h2>
                                    <p className="text-sm text-dark-400 mt-1">
                                        Total : {pendingLoans?.meta?.total || 0} demande(s)
                                        {pendingLoans?.data && ` (${pendingLoans.data.length} affichée(s))`}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    onClick={() => refetchLoans()}
                                    className="flex items-center gap-2 self-start sm:self-auto"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Actualiser
                                </Button>
                            </div>

                            {isLoadingLoans ? (
                                <LoadingSpinner size="lg" text="Chargement..." />
                            ) : loansError ? (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">❌</div>
                                    <h3 className="text-xl font-heading font-semibold text-red-400 mb-2">
                                        Erreur de chargement
                                    </h3>
                                    <p className="text-dark-400 mb-4">
                                        {loansError?.message || 'Impossible de charger la liste des demandes d\'emprunt'}
                                    </p>
                                    <Button
                                        variant="primary"
                                        onClick={() => refetchLoans()}
                                        className="flex items-center gap-2"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Réessayer
                                    </Button>
                                </div>
                            ) : pendingLoans?.data?.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">📚</div>
                                    <h3 className="text-xl font-heading font-semibold text-dark-300 mb-2">
                                        Aucune demande
                                    </h3>
                                    <p className="text-dark-400">
                                        Aucune demande d'emprunt en attente pour le moment
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {pendingLoans?.data?.map((loan: any) => (
                                        <motion.div
                                            key={loan._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="glass-card p-6 hover:bg-dark-700/50 transition-colors"
                                        >
                                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <User className="w-4 h-4 text-primary-400" />
                                                            <span className="font-medium text-dark-50">
                                                                {loan.readerUserId?.fullName}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <BookOpen className="w-4 h-4 text-accent-400" />
                                                            <span className="text-dark-300">
                                                                {loan.items?.length} livre(s)
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 text-green-400" />
                                                            <span className="text-dark-300">
                                                                Date limite : {new Date(loan.dueDate).toLocaleDateString('fr-FR')}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        {loan.items?.map((item: any, index: number) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-center gap-2 px-3 py-1 bg-primary-500/20 text-primary-300 rounded-lg text-sm"
                                                            >
                                                                <BookOpen className="w-3 h-3" />
                                                                {item.bookId?.title}
                                                                <span className="text-xs bg-primary-500/30 px-2 py-0.5 rounded">
                                                                    x{item.qty}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {loan.notes && (
                                                        <p className="text-sm text-dark-400 mb-3">
                                                            <strong>Notes :</strong> {loan.notes}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedLoan(loan);
                                                            setShowLoanModal(true);
                                                        }}
                                                        className="flex items-center justify-center gap-2"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        Voir les détails
                                                    </Button>
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedLoan(loan);
                                                            setActionNotes('');
                                                            setShowLoanModal(true);
                                                        }}
                                                        className="flex items-center justify-center gap-2"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                        Approuver
                                                    </Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'borrowed' && (
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h2 className="text-xl font-heading font-semibold text-dark-50">
                                        Livres empruntés
                                    </h2>
                                    <p className="text-sm text-dark-400 mt-1">
                                        Total : {borrowedLoans?.meta?.total || 0} emprunt(s)
                                        {borrowedLoans?.data && ` (${borrowedLoans.data.length} affiché(s))`}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    onClick={() => refetchBorrowed()}
                                    className="flex items-center gap-2 self-start sm:self-auto"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Actualiser
                                </Button>
                            </div>

                            {isLoadingBorrowed ? (
                                <LoadingSpinner size="lg" text="Chargement..." />
                            ) : borrowedLoans?.data?.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">📚</div>
                                    <h3 className="text-xl font-heading font-semibold text-dark-300 mb-2">
                                        Aucun livre emprunté
                                    </h3>
                                    <p className="text-dark-400">
                                        Aucun livre n'est actuellement emprunté
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {borrowedLoans?.data?.map((loan: any) => (
                                        <motion.div
                                            key={loan._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="glass-card p-6 hover:bg-dark-700/50 transition-colors"
                                        >
                                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <User className="w-4 h-4 text-primary-400" />
                                                            <span className="font-medium text-dark-50">
                                                                {loan.readerUserId?.fullName}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <BookOpen className="w-4 h-4 text-accent-400" />
                                                            <span className="text-dark-300">
                                                                {loan.items?.length} livre(s)
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 text-green-400" />
                                                            <span className="text-dark-300">
                                                                Date limite : {new Date(loan.dueDate).toLocaleDateString('fr-FR')}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        {loan.items?.map((item: any, index: number) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-center gap-2 px-3 py-1 bg-primary-500/20 text-primary-300 rounded-lg text-sm"
                                                            >
                                                                <BookOpen className="w-3 h-3" />
                                                                {item.bookId?.title}
                                                                <span className="text-xs bg-primary-500/30 px-2 py-0.5 rounded">
                                                                    x{item.qty}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {loan.notes && (
                                                        <div className="bg-dark-700/50 p-3 rounded-lg mb-4">
                                                            <p className="text-sm text-dark-300">
                                                                <span className="font-medium">Notes :</span> {loan.notes}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-col sm:flex-row gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setSelectedLoan(loan);
                                                            // Initialize return conditions for each item
                                                            const initialConditions: { [key: string]: { condition: string, notes: string, damageLevel: number } } = {};
                                                            loan.items?.forEach((item: any) => {
                                                                initialConditions[item.bookId._id] = {
                                                                    condition: 'GOOD',
                                                                    notes: '',
                                                                    damageLevel: 0
                                                                };
                                                            });
                                                            setReturnConditions(initialConditions);
                                                            setActionNotes('');
                                                            setShowReturnModal(true);
                                                        }}
                                                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                                                    >
                                                        Retourner
                                                    </Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'extensions' && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-heading font-semibold text-dark-50">
                                    Demandes de prolongation
                                </h2>
                                <Button
                                    variant="ghost"
                                    onClick={() => refetchExtensions()}
                                    className="flex items-center gap-2"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Actualiser
                                </Button>
                            </div>

                            {isLoadingExtensions ? (
                                <LoadingSpinner size="lg" text="Chargement..." />
                            ) : extensions?.data?.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">📅</div>
                                    <h3 className="text-xl font-heading font-semibold text-dark-300 mb-2">
                                        Aucune demande de prolongation
                                    </h3>
                                    <p className="text-dark-400">
                                        Aucune demande de prolongation en attente
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {extensions?.data?.map((extension: any) => (
                                        <motion.div
                                            key={extension._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="glass-card p-6 hover:bg-dark-700/50 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-4 mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <User className="w-4 h-4 text-primary-400" />
                                                            <span className="font-medium text-dark-50">
                                                                {extension.userId?.fullName}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 text-accent-400" />
                                                            <span className="text-dark-300">
                                                                Prolongation de {extension.extensionDays} jour(s)
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-4 h-4 text-green-400" />
                                                            <span className="text-dark-300">
                                                                Jusqu'au : {new Date(extension.newDueDate).toLocaleDateString('vi-VN')}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {extension.reason && (
                                                        <p className="text-sm text-dark-400 mb-3">
                                                            <strong>Raison :</strong> {extension.reason}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedLoan(extension);
                                                            setActionNotes('');
                                                            setShowExtensionModal(true);
                                                        }}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                        Approuver
                                                    </Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'fines' && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-heading font-semibold text-dark-50">
                                    Liste des amendes
                                </h2>
                                <Button
                                    variant="ghost"
                                    onClick={() => refetchFines()}
                                    className="flex items-center gap-2"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Actualiser
                                </Button>
                            </div>

                            {isLoadingFines ? (
                                <LoadingSpinner size="lg" text="Chargement..." />
                            ) : fines?.data?.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">💰</div>
                                    <h3 className="text-xl font-heading font-semibold text-dark-300 mb-2">
                                        Aucune amende
                                    </h3>
                                    <p className="text-dark-400">
                                        Aucune amende en attente de traitement
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {fines?.data?.filter((fine: any) => fine.status === 'PENDING').map((fine: any) => {
                                        console.log('Fine item:', fine);
                                        return (
                                            <motion.div
                                                key={fine._id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="glass-card p-6 hover:bg-dark-700/50 transition-colors"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-4 mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <User className="w-4 h-4 text-primary-400" />
                                                                <span className="font-medium text-dark-50">
                                                                    {fine.userId?.fullName || 'Aucune information'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <DollarSign className="w-4 h-4 text-accent-400" />
                                                                <span className="text-dark-300">
                                                                    {fine.amount?.toLocaleString('vi-VN')} {fine.currency}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <AlertTriangle className="w-4 h-4 text-red-400" />
                                                                <span className="text-dark-300">
                                                                    {fine.type === 'LATE_RETURN' ? 'Retour tardif' :
                                                                        fine.type === 'DAMAGE' ? 'Endommagé' :
                                                                            fine.type === 'LOSS' ? 'Livre perdu' : fine.type}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(fine.status)}`}>
                                                                    {formatStatus(fine.status)}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {fine.description && (
                                                            <p className="text-sm text-dark-400 mb-3">
                                                                <strong>Description :</strong> {fine.description}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="primary"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedFine(fine);
                                                                setActionNotes('');
                                                                setShowFineModal(true);
                                                            }}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                            Traiter
                                                        </Button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Loan Modal */}
            <Modal
                isOpen={showLoanModal}
                onClose={() => setShowLoanModal(false)}
                title="Détails de la demande d'emprunt"
            >
                <div className="py-6">
                    {selectedLoan && (
                        <div className="space-y-6">
                            {/* Loan Information */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-dark-300 mb-1">
                                            Code de demande
                                        </label>
                                        <p className="text-dark-50 font-mono text-sm bg-dark-700 px-3 py-2 rounded">
                                            {selectedLoan.code}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-dark-300 mb-1">
                                            Statut
                                        </label>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedLoan.status)}`}>
                                            {formatStatus(selectedLoan.status)}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-dark-300 mb-1">
                                            Emprunteur
                                        </label>
                                        <p className="text-dark-50">
                                            {selectedLoan.readerUserId?.fullName}
                                        </p>
                                        <p className="text-sm text-dark-400">
                                            {selectedLoan.readerUserId?.email}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-dark-300 mb-1">
                                            Échéance
                                        </label>
                                        <p className="text-dark-50">
                                            {new Date(selectedLoan.dueDate).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-dark-300 mb-2">
                                        Liste des livres
                                    </label>
                                    <div className="space-y-2">
                                        {selectedLoan.items?.map((item: any, index: number) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-dark-50">
                                                        {item.bookId?.title}
                                                    </h4>
                                                    <p className="text-sm text-dark-400">
                                                        Auteur(s) : {item.bookId?.authors?.join(', ')}
                                                    </p>
                                                    <p className="text-xs text-dark-500">
                                                        ISBN: {item.bookId?.isbn}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-sm text-dark-300">
                                                        Quantité : {item.qty}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {selectedLoan.notes && (
                                    <div>
                                        <label className="block text-sm font-medium text-dark-300 mb-1">
                                            Notes
                                        </label>
                                        <p className="text-dark-50 bg-dark-700 px-3 py-2 rounded">
                                            {selectedLoan.notes}
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-dark-300 mb-1">
                                            Date de création
                                        </label>
                                        <p className="text-dark-50">
                                            {new Date(selectedLoan.createdAt).toLocaleString('vi-VN')}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-dark-300 mb-1">
                                            Créé par
                                        </label>
                                        <p className="text-dark-50">
                                            {selectedLoan.createdByRole}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Section */}
                            <div className="border-t border-dark-600 pt-4">
                                <div>
                                    <label className="block text-sm font-medium text-dark-300 mb-2">
                                        Notes de traitement (facultatif)
                                    </label>
                                    <textarea
                                        value={actionNotes}
                                        onChange={(e) => setActionNotes(e.target.value)}
                                        placeholder="Saisir les notes de traitement..."
                                        className="w-full px-3 py-2 input-field resize-none"
                                        rows={3}
                                    />
                                </div>

                                <div className="flex gap-3 justify-end mt-4">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setShowLoanModal(false)}
                                    >
                                        Fermer
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => showConfirmation('Êtes-vous sûr de vouloir refuser cette demande d\'emprunt ?', handleRejectLoan)}
                                        disabled={isProcessing}
                                        className="text-red-400 hover:text-red-300"
                                    >
                                        {isProcessing ? 'Traitement en cours...' : 'Refuser'}
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={handleApproveLoan}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? 'Traitement en cours...' : 'Approuver'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Extension Modal */}
            <Modal
                isOpen={showExtensionModal}
                onClose={() => setShowExtensionModal(false)}
                title="Détails de la demande de prolongation"
            >
                <div className="py-6">
                    {selectedLoan && (
                        <div className="space-y-6">
                            {/* Extension Information */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-dark-300 mb-1">
                                            Demandeur
                                        </label>
                                        <p className="text-dark-50">
                                            {selectedLoan.userId?.fullName || 'Aucune information'}
                                        </p>
                                        <p className="text-sm text-dark-400">
                                            {selectedLoan.userId?.email || 'Aucune information'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-dark-300 mb-1">
                                            Statut
                                        </label>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedLoan.status)}`}>
                                            {formatStatus(selectedLoan.status)}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-dark-300 mb-1">
                                            Jours de prolongation
                                        </label>
                                        <p className="text-dark-50 text-lg font-semibold">
                                            {selectedLoan.extensionDays} jour(s)
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-dark-300 mb-1">
                                            Nouvelle échéance
                                        </label>
                                        <p className="text-dark-50">
                                            {new Date(selectedLoan.newDueDate).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                </div>

                                {selectedLoan.reason && (
                                    <div>
                                        <label className="block text-sm font-medium text-dark-300 mb-1">
                                            Raison de prolongation
                                        </label>
                                        <p className="text-dark-50 bg-dark-700 px-3 py-2 rounded">
                                            {selectedLoan.reason}
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-dark-300 mb-1">
                                            Date de demande
                                        </label>
                                        <p className="text-dark-50">
                                            {new Date(selectedLoan.createdAt).toLocaleString('vi-VN')}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-dark-300 mb-1">
                                            Ancienne échéance
                                        </label>
                                        <p className="text-dark-50">
                                            {new Date(selectedLoan.originalDueDate).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Section */}
                            <div className="border-t border-dark-600 pt-4">
                                <div>
                                    <label className="block text-sm font-medium text-dark-300 mb-2">
                                        Notes de traitement (facultatif)
                                    </label>
                                    <textarea
                                        value={actionNotes}
                                        onChange={(e) => setActionNotes(e.target.value)}
                                        placeholder="Saisir les notes de traitement..."
                                        className="w-full px-3 py-2 input-field resize-none"
                                        rows={3}
                                    />
                                </div>

                                <div className="flex gap-3 justify-end mt-4">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setShowExtensionModal(false)}
                                    >
                                        Fermer
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => showConfirmation('Êtes-vous sûr de vouloir refuser cette demande de prolongation ?', handleRejectExtension)}
                                        disabled={isProcessing}
                                        className="text-red-400 hover:text-red-300"
                                    >
                                        {isProcessing ? 'Traitement en cours...' : 'Refuser'}
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={handleApproveExtension}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? 'Traitement en cours...' : 'Approuver'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Fine Modal */}
            <Modal
                isOpen={showFineModal}
                onClose={() => setShowFineModal(false)}
                title="Détails de l'amende"
            >
                <div className="py-6">
                    {selectedFine && (
                        <div className="space-y-6">
                            {/* Fine Information */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-dark-300 mb-1">
                                            Personne pénalisée
                                        </label>
                                        <p className="text-dark-50">
                                            {selectedFine.userId?.fullName || 'Aucune information'}
                                        </p>
                                        <p className="text-sm text-dark-400">
                                            {selectedFine.userId?.email || 'Aucune information'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-dark-300 mb-1">
                                            Statut
                                        </label>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedFine.status)}`}>
                                            {formatStatus(selectedFine.status)}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-dark-300 mb-1">
                                            Montant de l'amende
                                        </label>
                                        <p className="text-dark-50 text-lg font-semibold text-red-400">
                                            {selectedFine.amount?.toLocaleString('vi-VN')} {selectedFine.currency}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-dark-300 mb-1">
                                            Type d'amende
                                        </label>
                                        <p className="text-dark-50">
                                            {selectedFine.type === 'LATE_RETURN' ? 'Retour tardif' :
                                                selectedFine.type === 'DAMAGE' ? 'Endommagé' :
                                                    selectedFine.type === 'LOSS' ? 'Livre perdu' : selectedFine.type}
                                        </p>
                                    </div>
                                </div>

                                {selectedFine.description && (
                                    <div>
                                        <label className="block text-sm font-medium text-dark-300 mb-1">
                                            Description
                                        </label>
                                        <p className="text-dark-50 bg-dark-700 px-3 py-2 rounded">
                                            {selectedFine.description}
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-dark-300 mb-1">
                                            Date de création
                                        </label>
                                        <p className="text-dark-50">
                                            {new Date(selectedFine.createdAt).toLocaleString('vi-VN')}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-dark-300 mb-1">
                                            Date d'échéance
                                        </label>
                                        <p className="text-dark-50">
                                            {selectedFine.dueDate ? new Date(selectedFine.dueDate).toLocaleDateString('vi-VN') : 'Aucune'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Section */}
                            <div className="border-t border-dark-600 pt-4">
                                <div>
                                    <label className="block text-sm font-medium text-dark-300 mb-2">
                                        Raison de l'annulation (si applicable)
                                    </label>
                                    <textarea
                                        value={actionNotes}
                                        onChange={(e) => setActionNotes(e.target.value)}
                                        placeholder="Saisir la raison de l'annulation..."
                                        className="w-full px-3 py-2 input-field resize-none"
                                        rows={3}
                                    />
                                </div>

                                <div className="flex gap-3 justify-end mt-4">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setShowFineModal(false)}
                                    >
                                        Fermer
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => showConfirmation('Êtes-vous sûr de vouloir annuler cette amende ?', handleWaiveFine)}
                                        disabled={isProcessing}
                                        className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20"
                                    >
                                        {isProcessing ? 'Traitement en cours...' : 'Annuler l\'amende'}
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={() => showConfirmation('Êtes-vous sûr de vouloir payer cette amende ?', handlePayFine)}
                                        disabled={isProcessing}
                                        className="bg-green-500 hover:bg-green-600 text-white"
                                    >
                                        {isProcessing ? 'Traitement en cours...' : 'Payer'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Return Modal */}
            <Modal
                isOpen={showReturnModal}
                onClose={() => setShowReturnModal(false)}
                title="Retourner le livre"
            >
                <div className="py-6">
                    {selectedLoan && (
                        <div className="space-y-6">
                            {/* Loan Information */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-dark-300 mb-1">
                                            Code d'emprunt
                                        </label>
                                        <p className="text-dark-50 font-mono text-sm bg-dark-700 px-3 py-2 rounded">
                                            {selectedLoan.code}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-dark-300 mb-1">
                                            Emprunteur
                                        </label>
                                        <p className="text-dark-50">
                                            {selectedLoan.readerUserId?.fullName}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-dark-300 mb-2">
                                        Liste des livres retournés
                                    </label>
                                    <div className="space-y-3">
                                        {selectedLoan.items?.map((item: any, index: number) => (
                                            <div key={index} className="p-4 bg-dark-700 rounded-lg">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-dark-50">
                                                            {item.bookId?.title}
                                                        </h4>
                                                        <p className="text-sm text-dark-400">
                                                            Auteur(s) : {item.bookId?.authors?.join(', ')}
                                                        </p>
                                                    </div>
                                                    <span className="text-sm text-dark-300">
                                                        Quantité : {item.qty}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-dark-300 mb-2">
                                                            État du livre
                                                        </label>
                                                        <select
                                                            value={returnConditions[item.bookId._id]?.condition || 'GOOD'}
                                                            onChange={(e) => setReturnConditions(prev => ({
                                                                ...prev,
                                                                [item.bookId._id]: {
                                                                    ...prev[item.bookId._id],
                                                                    condition: e.target.value,
                                                                    damageLevel: e.target.value === 'DAMAGED' ? (prev[item.bookId._id]?.damageLevel || 10) : 0
                                                                }
                                                            }))}
                                                            className="w-full px-3 py-2 input-field"
                                                        >
                                                            <option value="GOOD">Bon</option>
                                                            <option value="DAMAGED">Endommagé</option>
                                                            <option value="LOST">Perdu</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-dark-300 mb-2">
                                                            Notes
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={returnConditions[item.bookId._id]?.notes || ''}
                                                            onChange={(e) => setReturnConditions(prev => ({
                                                                ...prev,
                                                                [item.bookId._id]: {
                                                                    ...prev[item.bookId._id],
                                                                    notes: e.target.value
                                                                }
                                                            }))}
                                                            placeholder="Notes sur l'état du livre..."
                                                            className="w-full px-3 py-2 input-field"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Damage Level Slider - Only show if condition is DAMAGED */}
                                                {returnConditions[item.bookId._id]?.condition === 'DAMAGED' && (
                                                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                                        <label className="block text-sm font-medium text-red-400 mb-3">
                                                            Niveau de dommage : {returnConditions[item.bookId._id]?.damageLevel || 10}%
                                                        </label>
                                                        <input
                                                            type="range"
                                                            min="10"
                                                            max="90"
                                                            step="10"
                                                            value={returnConditions[item.bookId._id]?.damageLevel || 10}
                                                            onChange={(e) => setReturnConditions(prev => ({
                                                                ...prev,
                                                                [item.bookId._id]: {
                                                                    ...prev[item.bookId._id],
                                                                    damageLevel: parseInt(e.target.value)
                                                                }
                                                            }))}
                                                            className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer slider"
                                                        />
                                                        <div className="flex justify-between text-xs text-red-300 mt-2">
                                                            <span>10% - Léger</span>
                                                            <span>50% - Moyen</span>
                                                            <span>90% - Sévère</span>
                                                        </div>
                                                        <div className="mt-2 text-sm text-red-300">
                                                            💰 Amende estimée : {((returnConditions[item.bookId._id]?.damageLevel || 10) * (finePolicy?.damageFeeRate || 0.3) * 100).toFixed(0)}% de la valeur du livre
                                                            {item.bookId?.price && (
                                                                <span className="block text-xs text-red-400 mt-1">
                                                                    (Prix du livre : {item.bookId.price.toLocaleString('vi-VN')} VND - Amende : {Math.round(item.bookId.price * (finePolicy?.damageFeeRate || 0.3) * (returnConditions[item.bookId._id]?.damageLevel || 10) / 100).toLocaleString('vi-VN')} VND)
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Lost Book Warning */}
                                                {returnConditions[item.bookId._id]?.condition === 'LOST' && (
                                                    <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                                                        <div className="flex items-center gap-2 text-red-400 font-medium">
                                                            <span className="text-lg">⚠️</span>
                                                            <span>Livre perdu</span>
                                                        </div>
                                                        <div className="mt-2 text-sm text-red-300">
                                                            💰 Amende : {(finePolicy?.lostBookFeeRate || 1.0) * 100}% de la valeur du livre
                                                            {item.bookId?.price && (
                                                                <span className="block text-xs text-red-400 mt-1">
                                                                    (Prix du livre : {item.bookId.price.toLocaleString('vi-VN')} VND - Amende : {Math.round(item.bookId.price * (finePolicy?.lostBookFeeRate || 1.0)).toLocaleString('vi-VN')} VND)
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Action Section */}
                            <div className="border-t border-dark-600 pt-4">
                                <div>
                                    <label className="block text-sm font-medium text-dark-300 mb-2">
                                        Notes de retour (facultatif)
                                    </label>
                                    <textarea
                                        value={actionNotes}
                                        onChange={(e) => setActionNotes(e.target.value)}
                                        placeholder="Saisir les notes de retour..."
                                        className="w-full px-3 py-2 input-field resize-none"
                                        rows={3}
                                    />
                                </div>

                                <div className="flex gap-3 justify-end mt-4">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setShowReturnModal(false)}
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={handleReturnLoan}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? 'Traitement en cours...' : 'Confirmer le retour'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Confirmation Dialog */}
            <Modal
                isOpen={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
                title="Confirmation"
            >
                <div className="py-6">
                    <div className="text-center">
                        <div className="text-6xl mb-4">⚠️</div>
                        <p className="text-lg text-dark-300 mb-6">
                            {confirmMessage}
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button
                                variant="secondary"
                                onClick={() => setShowConfirmDialog(false)}
                            >
                                Annuler
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleConfirm}
                            >
                                Confirmer
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default LoanManagement;
