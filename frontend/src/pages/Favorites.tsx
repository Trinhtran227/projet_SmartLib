import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, ArrowLeft, Search, Filter, Grid, List, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import BookCard from '../components/ui/BookCard';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { getCategoryDisplayName } from '../lib/categoryLabels';
import { resolveMediaUrl } from '../lib/mediaUrl';

const Favorites: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
        const saved = localStorage.getItem('favorites-view-mode');
        return saved === 'list' ? 'list' : 'grid';
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    // Fetch favorites
    const { data: favoritesData, isLoading, error, refetch } = useQuery({
        queryKey: ['favorites', searchQuery, sortBy],
        queryFn: () => apiClient.getFavorites(1, 50), // Get more items for client-side filtering
        enabled: isAuthenticated,
    });

    // Filter and sort favorites
    const filteredFavorites = React.useMemo(() => {
        if (!favoritesData?.favorites) return [];

        let filtered = favoritesData.favorites.filter((favorite: any) => {
            const book = favorite.bookId;
            if (!book) return false;

            const searchLower = searchQuery.toLowerCase();
            return (
                book.title.toLowerCase().includes(searchLower) ||
                book.authors.some((author: string) => author.toLowerCase().includes(searchLower)) ||
                book.isbn.toLowerCase().includes(searchLower)
            );
        });

        // Sort favorites
        filtered.sort((a: any, b: any) => {
            const bookA = a.bookId;
            const bookB = b.bookId;

            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'title':
                    return bookA.title.localeCompare(bookB.title);
                case 'author':
                    return bookA.authors[0].localeCompare(bookB.authors[0]);
                case 'year':
                    return bookB.year - bookA.year;
                default:
                    return 0;
            }
        });

        return filtered;
    }, [favoritesData?.favorites, searchQuery, sortBy]);

    const handleRemoveFavorite = async (bookId: string) => {
        try {
            await apiClient.removeFavorite(bookId);
            toast.success('Retiré des favoris');
            refetch();
        } catch (error: any) {
            console.error('Error removing favorite:', error);
            toast.error(error.response?.data?.error?.message || 'Une erreur est survenue');
        }
    };

    const handleViewBook = (bookId: string) => {
        navigate(`/book/${bookId}`);
    };

    // Save view mode preference
    React.useEffect(() => {
        localStorage.setItem('favorites-view-mode', viewMode);
    }, [viewMode]);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-dark-900 pt-16 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🔐</div>
                    <h2 className="text-2xl font-heading font-bold text-dark-300 mb-4">
                        Connexion requise
                    </h2>
                    <p className="text-dark-400 mb-6">
                        Vous devez être connecté pour voir vos favoris.
                    </p>
                    <Button onClick={() => navigate('/login')}>
                        Se connecter
                    </Button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-dark-900 pt-16 flex items-center justify-center">
                <LoadingSpinner size="lg" text="Chargement de vos favoris..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-dark-900 pt-16 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-heading font-bold text-dark-300 mb-4">
                        Une erreur est survenue
                    </h2>
                    <p className="text-dark-400 mb-6">
                        Impossible de charger la liste de vos favoris.
                    </p>
                    <Button onClick={() => refetch()}>
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
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Retour
                        </Button>
                        <div>
                            <h1 className="text-3xl font-heading font-bold text-dark-50 flex items-center gap-3">
                                <Heart className="w-8 h-8 text-red-400" />
                                Livres favoris
                            </h1>
                            <p className="text-dark-400 mt-1">
                                {filteredFavorites.length} livre(s) dans vos favoris
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col lg:flex-row gap-4 mb-8">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Rechercher dans vos favoris..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 input-field"
                        />
                    </div>

                    {/* Sort */}
                    <div className="flex items-center gap-4">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-3 input-field"
                        >
                            <option value="newest">Plus récents</option>
                            <option value="oldest">Plus anciens</option>
                            <option value="title">Nom A-Z</option>
                            <option value="author">Auteur</option>
                            <option value="year">Année de publication</option>
                        </select>

                        {/* View Mode */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-dark-400 hover:text-dark-300'
                                    }`}
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-dark-400 hover:text-dark-300'
                                    }`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Favorites List */}
                {filteredFavorites.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">💔</div>
                        <h3 className="text-xl font-heading font-semibold text-dark-300 mb-2">
                            {searchQuery ? 'Aucun résultat' : 'Liste de favoris vide'}
                        </h3>
                        <p className="text-dark-400 mb-6">
                            {searchQuery
                                ? 'Essayez avec un autre mot-clé'
                                : 'Ajoutez des livres à vos favoris pour les voir ici'
                            }
                        </p>
                        {!searchQuery && (
                            <Button onClick={() => navigate('/catalog')}>
                                Découvrir des livres
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className={`grid gap-6 ${viewMode === 'grid'
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                        : 'grid-cols-1'
                        }`}>
                        {filteredFavorites.map((favorite: any, index: number) => (
                            <motion.div
                                key={favorite._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="relative group"
                            >
                                {viewMode === 'list' ? (
                                    <div className="glass-card p-4 hover:bg-dark-700/50 transition-colors">
                                        <div className="flex gap-4">
                                            {/* Book Cover */}
                                            <div className="w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden">
                                                {favorite.bookId.coverImageUrl ? (
                                                    <img
                                                        src={resolveMediaUrl(favorite.bookId.coverImageUrl)}
                                                        referrerPolicy="no-referrer"
                                                        alt={favorite.bookId.title}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                        }}
                                                    />
                                                ) : null}
                                                <div className={`w-full h-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center ${favorite.bookId.coverImageUrl ? 'hidden' : ''}`}>
                                                    <Heart className="w-8 h-8 text-primary-400" />
                                                </div>
                                            </div>

                                            {/* Book Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-heading font-semibold text-dark-50 text-lg mb-2 line-clamp-2">
                                                    {favorite.bookId.title}
                                                </h3>
                                                <p className="text-dark-300 mb-2 line-clamp-1">
                                                    {favorite.bookId.authors.join(', ')}
                                                </p>
                                                <div className="flex items-center gap-4 text-sm text-dark-400 mb-2">
                                                    {favorite.bookId.year && <span>Année : {favorite.bookId.year}</span>}
                                                    {favorite.bookId.categoryId && (
                                                        <span>Catégorie : {getCategoryDisplayName(favorite.bookId.categoryId)}</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-dark-400">Restant :</span>
                                                        <span className={`text-sm font-medium ${favorite.bookId.quantityAvailable > 5 ? 'text-green-400' :
                                                            favorite.bookId.quantityAvailable > 0 ? 'text-yellow-400' : 'text-red-400'
                                                            }`}>
                                                            {favorite.bookId.quantityAvailable}/{favorite.bookId.quantityTotal}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleViewBook(favorite.bookId._id)}
                                                        >
                                                            Voir les détails
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveFavorite(favorite.bookId._id)}
                                                            className="text-red-400 hover:text-red-300"
                                                        >
                                                            Supprimer
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <BookCard book={favorite.bookId} />

                                        {/* Remove Button */}
                                        <button
                                            onClick={() => handleRemoveFavorite(favorite.bookId._id)}
                                            className="absolute top-2 right-2 p-2 bg-red-500/20 text-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/30"
                                        >
                                            <Heart className="w-4 h-4 fill-current" />
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Favorites;
