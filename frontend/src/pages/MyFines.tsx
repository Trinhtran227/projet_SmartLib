import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    DollarSign,
    AlertTriangle,
    CheckCircle,
    XCircle,
    BookOpen,
    Calendar
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';

const MyFines: React.FC = () => {
    const [statusFilter, setStatusFilter] = useState<string>('PENDING');
    const [selectedFine, setSelectedFine] = useState<any>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Fetch user's fines
    const { data: finesData, isLoading } = useQuery({
        queryKey: ['user-fines', statusFilter],
        queryFn: () => apiClient.getFines(1, 50, statusFilter),
    });

    const fines = finesData?.data || [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'text-yellow-400';
            case 'PAID': return 'text-green-400';
            case 'WAIVED': return 'text-blue-400';
            default: return 'text-gray-400';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING': return 'En attente';
            case 'PAID': return 'Payée';
            case 'WAIVED': return 'Annulée';
            default: return status;
        }
    };

    const getTypeText = (type: string) => {
        switch (type) {
            case 'LATE_RETURN': return 'Retour tardif';
            case 'DAMAGE': return 'Livre endommagé';
            case 'LOSS': return 'Livre perdu';
            default: return type;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'LATE_RETURN': return 'text-yellow-400';
            case 'DAMAGE': return 'text-orange-400';
            case 'LOSS': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="min-h-screen bg-dark-900 pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-heading font-bold text-dark-50 mb-4">
                        Amendes
                    </h1>
                    <p className="text-dark-300">
                        Consulter et gérer vos amendes
                    </p>
                </div>

                {/* Filter */}
                <div className="mb-8">
                    <div className="flex space-x-1 glass rounded-xl p-1">
                        {[
                            { id: 'PENDING', label: 'En attente', color: 'text-yellow-400' },
                            { id: 'PAID', label: 'Payée', color: 'text-green-400' },
                            { id: 'WAIVED', label: 'Annulée', color: 'text-blue-400' },
                        ].map((filter) => (
                            <button
                                key={filter.id}
                                onClick={() => setStatusFilter(filter.id)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 ${statusFilter === filter.id
                                    ? 'bg-primary-500 text-white'
                                    : 'text-dark-300 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                <span className={`w-2 h-2 rounded-full ${filter.color.replace('text-', 'bg-')}`} />
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="glass-card p-6">
                    {isLoading ? (
                        <LoadingSpinner size="lg" text="Chargement..." />
                    ) : fines.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">💰</div>
                            <h3 className="text-xl font-heading font-semibold text-dark-300 mb-2">
                                Aucune amende
                            </h3>
                            <p className="text-dark-400">
                                {statusFilter === 'PENDING'
                                    ? 'Vous n\'avez aucune amende en attente'
                                    : statusFilter === 'PAID'
                                        ? 'Vous n\'avez payé aucune amende'
                                        : 'Vous n\'avez aucune amende annulée'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {fines.map((fine: any, index: number) => (
                                <motion.div
                                    key={fine._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="glass-card p-6 hover:bg-dark-700/50 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="w-5 h-5 text-accent-400" />
                                                    <span className="text-2xl font-bold text-dark-50">
                                                        {fine.amount?.toLocaleString('vi-VN')} {fine.currency}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <AlertTriangle className={`w-4 h-4 ${getTypeColor(fine.type)}`} />
                                                    <span className={`text-sm font-medium ${getTypeColor(fine.type)}`}>
                                                        {getTypeText(fine.type)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm font-medium ${getStatusColor(fine.status)}`}>
                                                        {getStatusText(fine.status)}
                                                    </span>
                                                </div>
                                            </div>

                                            {fine.description && (
                                                <p className="text-sm text-dark-400 mb-3">
                                                    <strong>Description :</strong> {fine.description}
                                                </p>
                                            )}

                                            {fine.waivedReason && (
                                                <p className="text-sm text-blue-400 mb-3">
                                                    <strong>Raison de l'annulation :</strong> {fine.waivedReason}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-4 text-xs text-dark-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    Créée le : {new Date(fine.createdAt).toLocaleDateString('vi-VN')}
                                                </div>
                                                {fine.paidAt && (
                                                    <div className="flex items-center gap-1">
                                                        <CheckCircle className="w-3 h-3" />
                                                        Payée le : {new Date(fine.paidAt).toLocaleDateString('vi-VN')}
                                                    </div>
                                                )}
                                                {fine.waivedAt && (
                                                    <div className="flex items-center gap-1">
                                                        <XCircle className="w-3 h-3" />
                                                        Annulée le : {new Date(fine.waivedAt).toLocaleDateString('vi-VN')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedFine(fine);
                                                    setShowDetailModal(true);
                                                }}
                                                className="flex items-center gap-2"
                                            >
                                                <BookOpen className="w-4 h-4" />
                                                Détails
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Summary */}
                {fines.length > 0 && (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-card p-6 text-center">
                            <div className="text-3xl font-bold text-yellow-400 mb-2">
                                {fines.filter((fine: any) => fine.status === 'PENDING').length}
                            </div>
                            <p className="text-dark-300">En attente</p>
                        </div>
                        <div className="glass-card p-6 text-center">
                            <div className="text-3xl font-bold text-green-400 mb-2">
                                {fines.filter((fine: any) => fine.status === 'PAID').length}
                            </div>
                            <p className="text-dark-300">Payée</p>
                        </div>
                        <div className="glass-card p-6 text-center">
                            <div className="text-3xl font-bold text-blue-400 mb-2">
                                {fines.filter((fine: any) => fine.status === 'WAIVED').length}
                            </div>
                            <p className="text-dark-300">Annulée</p>
                        </div>
                    </div>
                )}

                {/* Detail Modal */}
                <Modal
                    isOpen={showDetailModal}
                    onClose={() => setShowDetailModal(false)}
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
                                                Montant de l'amende
                                            </label>
                                            <p className="text-dark-50 text-lg font-semibold text-red-400">
                                                {selectedFine.amount?.toLocaleString('vi-VN')} {selectedFine.currency}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-dark-300 mb-1">
                                                Statut
                                            </label>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedFine.status)}`}>
                                                {getStatusText(selectedFine.status)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-dark-300 mb-1">
                                                Type d'amende
                                            </label>
                                            <p className="text-dark-50">
                                                {getTypeText(selectedFine.type)}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-dark-300 mb-1">
                                                Date de création
                                            </label>
                                            <p className="text-dark-50">
                                                {new Date(selectedFine.createdAt).toLocaleString('vi-VN')}
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

                                    {selectedFine.waivedReason && (
                                        <div>
                                            <label className="block text-sm font-medium text-dark-300 mb-1">
                                                Raison de l'annulation
                                            </label>
                                            <p className="text-dark-50 bg-blue-500/20 px-3 py-2 rounded">
                                                {selectedFine.waivedReason}
                                            </p>
                                        </div>
                                    )}

                                    {selectedFine.paidAt && (
                                        <div>
                                            <label className="block text-sm font-medium text-dark-300 mb-1">
                                                Date de paiement
                                            </label>
                                            <p className="text-dark-50">
                                                {new Date(selectedFine.paidAt).toLocaleString('vi-VN')}
                                            </p>
                                        </div>
                                    )}

                                    {selectedFine.waivedAt && (
                                        <div>
                                            <label className="block text-sm font-medium text-dark-300 mb-1">
                                                Date d'annulation
                                            </label>
                                            <p className="text-dark-50">
                                                {new Date(selectedFine.waivedAt).toLocaleString('vi-VN')}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Action Section */}
                                <div className="border-t border-dark-600 pt-4">
                                    <div className="flex gap-3 justify-end">
                                        <Button
                                            variant="secondary"
                                            onClick={() => setShowDetailModal(false)}
                                        >
                                            Fermer
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default MyFines;
