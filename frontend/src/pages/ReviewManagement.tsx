import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Star,
    ThumbsUp,
    ThumbsDown,
    Filter,
    Search,
    MoreVertical,
    CheckCircle,
    XCircle,
    Eye,
    Trash2,
    RefreshCw
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ReviewManagement: React.FC = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRating, setSelectedRating] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState<any>(null);

    // Real API data for reviews
    const { data: reviews, isLoading: isLoadingReviews } = useQuery({
        queryKey: ['reviews-management', searchTerm, selectedRating, selectedStatus, currentPage],
        queryFn: () => apiClient.getReviews({
            page: currentPage,
            limit: 10,
            search: searchTerm,
            rating: selectedRating ? parseInt(selectedRating) : undefined,
            status: selectedStatus || undefined
        }),
        enabled: user?.role === 'ADMIN' || user?.role === 'LIBRARIAN'
    });

    // Hide review mutation
    const hideReviewMutation = useMutation({
        mutationFn: (id: string) => apiClient.hideReview(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews-management'] });
            alert('Avis masqué !');
        },
        onError: (error: any) => {
            console.error('Hide review error:', error);
            alert('Erreur lors du masquage de l\'avis');
        }
    });

    // Show review mutation
    const showReviewMutation = useMutation({
        mutationFn: (id: string) => apiClient.showReview(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews-management'] });
            alert('Avis réaffiché !');
        },
        onError: (error: any) => {
            console.error('Show review error:', error);
            alert('Erreur lors du réaffichage de l\'avis');
        }
    });

    // Delete review mutation
    const deleteReviewMutation = useMutation({
        mutationFn: (id: string) => apiClient.deleteReview(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews-management'] });
            alert('Avis supprimé !');
        },
        onError: (error: any) => {
            console.error('Delete review error:', error);
            alert('Erreur lors de la suppression de l\'avis');
        }
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'text-green-400 bg-green-500/20';
            case 'HIDDEN': return 'text-gray-400 bg-gray-500/20';
            default: return 'text-gray-400 bg-gray-500/20';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'Affiché';
            case 'HIDDEN': return 'Masqué';
            default: return 'Inconnu';
        }
    };

    const openDetailsModal = (review: any) => {
        setSelectedReview(review);
        setShowDetailsModal(true);
    };

    const renderStars = (rating: number) => {
        return [...Array(5)].map((_, i) => (
            <span key={i} className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-dark-500'}`}>
                ★
            </span>
        ));
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

    if (isLoadingReviews) {
        return (
            <div className="min-h-screen bg-dark-900 pt-16 flex items-center justify-center">
                <LoadingSpinner size="lg" text="Chargement des avis..." />
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
                            Gestion des avis et commentaires
                        </h1>
                        <p className="text-dark-300">
                            Parcourir et gérer les avis des lecteurs sur les livres
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="glass-card p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                Rechercher
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="Rechercher par livre, utilisateur..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                Avis
                            </label>
                            <select
                                value={selectedRating}
                                onChange={(e) => setSelectedRating(e.target.value)}
                                className="input-field"
                            >
                                <option value="">Tous les avis</option>
                                <option value="5">5 étoiles</option>
                                <option value="4">4 étoiles</option>
                                <option value="3">3 étoiles</option>
                                <option value="2">2 étoiles</option>
                                <option value="1">1 étoile</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                Statut
                            </label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="input-field"
                            >
                                <option value="">Tous les statuts</option>
                                <option value="ACTIVE">Affiché</option>
                                <option value="HIDDEN">Masqué</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedRating('');
                                    setSelectedStatus('');
                                    setCurrentPage(1);
                                }}
                                className="w-full"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Actualiser
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Reviews Table */}
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-dark-700">
                            <thead className="bg-dark-800">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                                        Livre
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                                        Critique
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                                        Note
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                                        Commentaire
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                                        Statut
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                                        Date de création
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-medium text-dark-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-700">
                                {reviews?.reviews && reviews.reviews.length > 0 ? (
                                    reviews.reviews.map((review: any, index: number) => (
                                        <motion.tr
                                            key={review._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="hover:bg-dark-800/50 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-dark-50 font-medium">{review.bookTitle}</div>
                                                    <div className="text-dark-400 text-sm">{review.bookAuthor}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-dark-50 font-medium">{review.userName}</div>
                                                    <div className="text-dark-400 text-sm">{review.userEmail}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1">
                                                        {renderStars(review.rating)}
                                                    </div>
                                                    <span className="text-dark-300 text-sm">{review.rating}/5</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="max-w-xs">
                                                    <p className="text-dark-300 text-sm line-clamp-2">{review.comment}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                                                    {review.status === 'ACTIVE' ? (
                                                        <CheckCircle className="w-3 h-3" />
                                                    ) : (
                                                        <XCircle className="w-3 h-3" />
                                                    )}
                                                    {getStatusText(review.status)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-300">
                                                {format(new Date(review.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openDetailsModal(review)}
                                                        className="text-blue-400 hover:text-blue-300"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    {review.status === 'ACTIVE' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => hideReviewMutation.mutate(review._id)}
                                                            disabled={hideReviewMutation.isPending}
                                                            className="text-yellow-400 hover:text-yellow-300"
                                                            title="Masquer l'avis"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                    {review.status === 'HIDDEN' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => showReviewMutation.mutate(review._id)}
                                                            disabled={showReviewMutation.isPending}
                                                            className="text-green-400 hover:text-green-300"
                                                            title="Réafficher l'avis"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => deleteReviewMutation.mutate(review._id)}
                                                        disabled={deleteReviewMutation.isPending}
                                                        className="text-red-400 hover:text-red-300"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center">
                                            <div className="text-center">
                                                <div className="text-4xl mb-4">💬</div>
                                                <h3 className="text-lg font-medium text-dark-300 mb-2">
                                                    Aucun avis
                                                </h3>
                                                <p className="text-dark-400">
                                                    Aucun avis ne correspond aux filtres actuels
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {reviews && reviews.pages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                        <div className="text-dark-400 text-sm">
                            Affichage de {((currentPage - 1) * 10) + 1} à {Math.min(currentPage * 10, reviews.total)} sur {reviews.total} avis
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Précédent
                            </Button>
                            <span className="text-dark-300 text-sm">
                                Page {currentPage} / {reviews.pages}
                            </span>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, reviews.pages))}
                                disabled={currentPage === reviews.pages}
                            >
                                Suivant
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Review Details Modal */}
            {showDetailsModal && selectedReview && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-dark-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-heading font-semibold text-dark-50">
                                Détails de l'avis
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowDetailsModal(false)}
                                className="text-dark-400 hover:text-dark-200"
                            >
                                ✕
                            </Button>
                        </div>

                        <div className="space-y-6">
                            {/* Book Info */}
                            <div className="p-4 bg-dark-700 rounded-lg">
                                <h4 className="text-lg font-semibold text-dark-50 mb-2">Informations sur le livre</h4>
                                <div className="space-y-2">
                                    <div>
                                        <span className="text-dark-300">Titre du livre :</span>
                                        <span className="text-dark-50 ml-2">{selectedReview.bookTitle}</span>
                                    </div>
                                    <div>
                                        <span className="text-dark-300">Auteur :</span>
                                        <span className="text-dark-50 ml-2">{selectedReview.bookAuthor}</span>
                                    </div>
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="p-4 bg-dark-700 rounded-lg">
                                <h4 className="text-lg font-semibold text-dark-50 mb-2">Informations sur l'utilisateur</h4>
                                <div className="space-y-2">
                                    <div>
                                        <span className="text-dark-300">Nom :</span>
                                        <span className="text-dark-50 ml-2">{selectedReview.userName}</span>
                                    </div>
                                    <div>
                                        <span className="text-dark-300">E-mail :</span>
                                        <span className="text-dark-50 ml-2">{selectedReview.userEmail}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Review Content */}
                            <div className="p-4 bg-dark-700 rounded-lg">
                                <h4 className="text-lg font-semibold text-dark-50 mb-2">Contenu de l'avis</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-dark-300">Note :</span>
                                        <div className="flex items-center gap-1">
                                            {renderStars(selectedReview.rating)}
                                        </div>
                                        <span className="text-dark-50">{selectedReview.rating}/5</span>
                                    </div>
                                    <div>
                                        <span className="text-dark-300">Commentaire :</span>
                                        <p className="text-dark-50 mt-1 p-3 bg-dark-800 rounded-lg">
                                            {selectedReview.comment}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-dark-400">
                                        <span>Utile : {selectedReview.helpful}</span>
                                        <span>Signalements : {selectedReview.reportCount}</span>
                                        <span>Date de création : {format(new Date(selectedReview.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-700">
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowDetailsModal(false)}
                                >
                                    Fermer
                                </Button>
                                {selectedReview.status === 'ACTIVE' && (
                                    <Button
                                        variant="primary"
                                        onClick={() => {
                                            hideReviewMutation.mutate(selectedReview._id);
                                            setShowDetailsModal(false);
                                        }}
                                        className="bg-yellow-500 hover:bg-yellow-600"
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Masquer l'avis
                                    </Button>
                                )}
                                {selectedReview.status === 'HIDDEN' && (
                                    <Button
                                        variant="primary"
                                        onClick={() => {
                                            showReviewMutation.mutate(selectedReview._id);
                                            setShowDetailsModal(false);
                                        }}
                                        className="bg-green-500 hover:bg-green-600"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Réafficher l'avis
                                    </Button>
                                )}
                                <Button
                                    variant="primary"
                                    onClick={() => {
                                        deleteReviewMutation.mutate(selectedReview._id);
                                        setShowDetailsModal(false);
                                    }}
                                    className="bg-red-500 hover:bg-red-600"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Supprimer l'avis
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ReviewManagement;
