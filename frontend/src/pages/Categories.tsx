import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Grid, List, BookOpen, TrendingUp, Star, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { getCategoryDisplayName } from '../lib/categoryLabels';

const Categories: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
        const saved = localStorage.getItem('categories-view-mode');
        return saved === 'list' ? 'list' : 'grid';
    });
    const [sortBy, setSortBy] = useState('name');

    // Fetch categories
    const { data: categoriesData, isLoading, error, refetch } = useQuery({
        queryKey: ['categories'],
        queryFn: () => apiClient.getCategories(),
    });

    // Filter and sort categories
    const filteredCategories = React.useMemo(() => {
        if (!categoriesData) return [];

        let filtered = categoriesData.filter((category: any) => {
            const searchLower = searchQuery.toLowerCase();
            const labelFr = getCategoryDisplayName(category).toLowerCase();
            return (
                category.name.toLowerCase().includes(searchLower) ||
                labelFr.includes(searchLower) ||
                category.slug.toLowerCase().includes(searchLower)
            );
        });

        // Sort categories
        filtered.sort((a: any, b: any) => {
            switch (sortBy) {
                case 'name':
                    return getCategoryDisplayName(a).localeCompare(getCategoryDisplayName(b), 'fr');
                case 'books':
                    return (b.bookCount || 0) - (a.bookCount || 0);
                case 'popular':
                    return (b.bookCount || 0) - (a.bookCount || 0); // Use book count as popularity
                default:
                    return 0;
            }
        });

        return filtered;
    }, [categoriesData, searchQuery, sortBy]);

    const handleViewCategory = (category: any) => {
        // Navigate to catalog with category filter
        navigate(`/catalog?category=${category.slug}&categoryName=${encodeURIComponent(getCategoryDisplayName(category))}`);
    };

    // Save view mode preference
    React.useEffect(() => {
        localStorage.setItem('categories-view-mode', viewMode);
    }, [viewMode]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-dark-900 pt-16 flex items-center justify-center">
                <LoadingSpinner size="lg" text="Chargement des catégories..." />
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
                        Impossible de charger les catégories.
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
                                <BookOpen className="w-8 h-8 text-primary-400" />
                                Catégories de livres
                            </h1>
                            <p className="text-dark-400 mt-1">
                                {filteredCategories.length} catégorie(s) disponible(s)
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
                            placeholder="Rechercher une catégorie..."
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
                            <option value="name">Nom A-Z</option>
                            <option value="books">Nombre de livres</option>
                            <option value="popular">Populaire</option>
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

                {/* Categories List */}
                {filteredCategories.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📚</div>
                        <h3 className="text-xl font-heading font-semibold text-dark-300 mb-2">
                            {searchQuery ? 'Aucune catégorie trouvée' : 'Aucune catégorie'}
                        </h3>
                        <p className="text-dark-400 mb-6">
                            {searchQuery
                                ? 'Essayez avec un autre mot-clé'
                                : 'Les catégories de livres s\'afficheront ici'
                            }
                        </p>
                        {!searchQuery && (
                            <Button onClick={() => navigate('/catalog')}>
                                Voir tous les livres
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className={`grid gap-6 ${viewMode === 'grid'
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                        : 'grid-cols-1'
                        }`}>
                        {filteredCategories.map((category: any, index: number) => (
                            <motion.div
                                key={category._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group"
                            >
                                {viewMode === 'list' ? (
                                    <div className="glass-card p-6 hover:bg-dark-700/50 transition-colors cursor-pointer group"
                                        onClick={() => handleViewCategory(category)}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <BookOpen className="w-8 h-8 text-primary-400" />
                                                </div>
                                                <div>
                                                    <h3 className="font-heading font-semibold text-dark-50 text-lg mb-1 group-hover:text-primary-400 transition-colors">
                                                        {getCategoryDisplayName(category)}
                                                    </h3>
                                                    <p className="text-dark-400 text-sm">
                                                        {category.description || 'Découvrez les livres de cette catégorie'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-primary-400">
                                                        {category.bookCount || 0}
                                                    </div>
                                                    <div className="text-xs text-dark-400">Livres</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-accent-400">
                                                        {category.bookCount > 0 ? 'Avec des livres' : 'Vide'}
                                                    </div>
                                                    <div className="text-xs text-dark-400">Statut</div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewCategory(category);
                                                    }}
                                                    className="group-hover:bg-primary-500/20 group-hover:text-primary-400 transition-colors"
                                                >
                                                    Voir les livres
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="glass-card p-6 hover:bg-dark-700/50 transition-all duration-300 cursor-pointer group-hover:scale-105"
                                        onClick={() => handleViewCategory(category)}>
                                        <div className="text-center">
                                            <div className="w-20 h-20 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                                <BookOpen className="w-10 h-10 text-primary-400" />
                                            </div>
                                            <h3 className="font-heading font-semibold text-dark-50 text-lg mb-2 group-hover:text-primary-400 transition-colors">
                                                {getCategoryDisplayName(category)}
                                            </h3>
                                            <p className="text-dark-400 text-sm mb-4 line-clamp-2">
                                                {category.description || 'Découvrez les livres de cette catégorie'}
                                            </p>
                                            <div className="flex items-center justify-center gap-4 mb-4">
                                                <div className="text-center">
                                                    <div className="text-xl font-bold text-primary-400">
                                                        {category.bookCount || 0}
                                                    </div>
                                                    <div className="text-xs text-dark-400">Livres</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-xl font-bold text-accent-400">
                                                        {category.bookCount > 0 ? 'Avec des livres' : 'Vide'}
                                                    </div>
                                                    <div className="text-xs text-dark-400">Statut</div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                className="w-full group-hover:bg-primary-600 transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewCategory(category);
                                                }}
                                            >
                                                Voir les livres
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Popular Categories */}
                {!searchQuery && filteredCategories.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-heading font-bold text-dark-50 mb-6 flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-accent-400" />
                            Catégories populaires
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredCategories
                                .slice(0, 6)
                                .map((category: any, index: number) => (
                                    <motion.div
                                        key={category._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="glass-card p-4 hover:bg-dark-700/50 transition-colors cursor-pointer group"
                                        onClick={() => handleViewCategory(category)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-accent-500/20 to-primary-500/20 rounded-lg flex items-center justify-center">
                                                <Star className="w-6 h-6 text-accent-400" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-dark-50 group-hover:text-primary-400 transition-colors">{getCategoryDisplayName(category)}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="text-sm text-accent-400 font-medium">
                                                        {category.bookCount || 0} livre(s)
                                                    </div>
                                                    <div className="text-xs text-dark-400">
                                                        {category.bookCount > 0 ? 'Avec des livres' : 'Vide'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Categories;
