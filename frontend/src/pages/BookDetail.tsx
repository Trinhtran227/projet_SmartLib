import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    BookOpen,
    Calendar,
    User,
    Building,
    Hash,
    Star,
    ShoppingCart,
    Heart,
    Share2,
    ChevronDown,
    ChevronUp,
    MessageCircle,
    ThumbsUp,
    Eye,
    Clock,
    MapPin,
    Tag,
    Filter,
    Search,
    BookMarked,
    TrendingUp,
    Award,
    Users,
    Download,
    ExternalLink
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import BookCard from '../components/ui/BookCard';
import toast from 'react-hot-toast';
import { getCategoryDisplayName } from '../lib/categoryLabels';
import { resolveMediaUrl } from '../lib/mediaUrl';

// Utility function to extract error message from API response
const getErrorMessage = (error: any, defaultMessage: string = 'Une erreur est survenue'): string => {
    if (error.response?.data) {
        const errorData = error.response.data;

        if (typeof errorData === 'object') {
            if (errorData.message) {
                return errorData.message;
            } else if (errorData.error) {
                if (typeof errorData.error === 'string') {
                    return errorData.error;
                } else if (errorData.error.message) {
                    return errorData.error.message;
                }
            }
        } else if (typeof errorData === 'string') {
            return errorData;
        }
    } else if (error.message) {
        return error.message;
    }

    return defaultMessage;
};

const BookDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const { addItem } = useCart();

    const [selectedTab, setSelectedTab] = useState('description');
    const [quantity, setQuantity] = useState(1);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showReviews, setShowReviews] = useState(false);
    const [reviewText, setReviewText] = useState('');
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [expandedDescription, setExpandedDescription] = useState(false);
    const [showFullImage, setShowFullImage] = useState(false);
    const [hasUserReviewed, setHasUserReviewed] = useState(false);

    const { data: book, isLoading, error } = useQuery({
        queryKey: ['book', id],
        queryFn: () => apiClient.getBook(id!),
        enabled: !!id,
    });

    // Fetch similar books
    const { data: similarBooks } = useQuery({
        queryKey: ['similar-books', book?.categoryId?._id, book?.authors],
        queryFn: () => apiClient.getBooks({
            categoryId: book?.categoryId?._id,
            limit: 6,
            page: 1
        }),
        enabled: !!book?.categoryId?._id,
    });

    // Fetch books by same author
    const { data: authorBooks } = useQuery({
        queryKey: ['author-books', book?.authors],
        queryFn: () => apiClient.getBooks({
            q: book?.authors?.[0],
            limit: 6,
            page: 1
        }),
        enabled: !!book?.authors?.length,
    });

    // Load favorite status from API
    useEffect(() => {
        if (isAuthenticated && id) {
            apiClient.checkFavorite(id)
                .then((data) => setIsFavorite(data.isFavorited))
                .catch((error) => console.error('Error checking favorite:', error));
        }
    }, [isAuthenticated, id]);

    // Track book view
    useEffect(() => {
        if (id) {
            apiClient.trackBookView(id)
                .catch((error) => console.error('Error tracking view:', error));
        }
    }, [id]);

    // Fetch book reviews
    const { data: reviewsData } = useQuery({
        queryKey: ['book-reviews', id],
        queryFn: () => apiClient.getBookReviews(id!, 1, 10),
        enabled: !!id,
    });

    // Fetch book statistics
    const { data: statsData } = useQuery({
        queryKey: ['book-stats', id],
        queryFn: () => apiClient.getBookStats(id!),
        enabled: !!id,
    });

    // Check if user has already reviewed this book
    useEffect(() => {
        if (isAuthenticated && reviewsData?.reviews && user) {
            const userReview = reviewsData.reviews.find((review: any) =>
                review.userId?._id === user._id || review.userId === user._id
            );
            setHasUserReviewed(!!userReview);
        }
    }, [isAuthenticated, reviewsData, user]);

    const handleAddToCart = () => {
        if (!isAuthenticated) {
            setShowAuthModal(true);
            return;
        }

        if (book && book.quantityAvailable > 0) {
            addItem(book, quantity);
            toast.success(`Ajout de ${quantity} exemplaire(s) de "${book.title}" à la sélection`);
        } else {
            toast.error('Le livre n\'est actuellement pas disponible');
        }
    };

    const handleLogin = () => {
        setShowAuthModal(false);
        navigate('/login', { state: { from: { pathname: `/book/${id}` } } });
    };

    const handleToggleFavorite = async () => {
        if (!isAuthenticated) {
            setShowAuthModal(true);
            return;
        }

        try {
            if (isFavorite) {
                await apiClient.removeFavorite(id!);
                setIsFavorite(false);
                toast.success('Supprimé des favoris');
            } else {
                await apiClient.addFavorite(id!);
                setIsFavorite(true);
                toast.success('Ajouté aux favoris');
            }
        } catch (error: any) {
            console.error('Error toggling favorite:', error);
            toast.error(getErrorMessage(error, 'Une erreur est survenue lors de l\'action sur les favoris'));
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: book?.title,
                    text: `Découvrez le livre "${book?.title}" dans la bibliothèque`,
                    url: window.location.href,
                });
            } catch (error) {
                // User cancelled sharing or error occurred
                console.log('Share cancelled or failed:', error);
                setShowShareModal(true);
            }
        } else {
            setShowShareModal(true);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success('Lien copié dans le presse-papiers');
            setShowShareModal(false);
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            toast.error('Impossible de copier le lien');
        }
    };

    const handleSubmitReview = async () => {
        if (!isAuthenticated) {
            setShowAuthModal(true);
            return;
        }

        if (rating === 0) {
            toast.error('Veuillez sélectionner une note');
            return;
        }

        if (!reviewText.trim()) {
            toast.error('Veuillez entrer une évaluation');
            return;
        }

        if (reviewText.trim().length < 10) {
            toast.error('L\'évaluation doit comporter au moins 10 caractères');
            return;
        }

        if (reviewText.trim().length > 1000) {
            toast.error('L\'évaluation ne doit pas dépasser 1000 caractères');
            return;
        }

        try {
            console.log('Creating review with:', { bookId: id, rating, comment: reviewText });
            await apiClient.createReview(id!, rating, reviewText);
            toast.success('Merci pour votre évaluation ! Elle sera affichée après modération.');
            setReviewText('');
            setRating(0);
            setHoverRating(0);
            setShowReviews(false);
            // Refetch reviews by invalidating the query
            window.location.reload(); // Simple way to refresh reviews
        } catch (error: any) {
            console.error('Error submitting review:', error);
            const errorMessage = getErrorMessage(error, 'Une erreur est survenue lors de l\'envoi de l\'évaluation');
            toast.error(errorMessage);

            // If user already reviewed, close the modal
            if (errorMessage.includes('déjà évalué')) {
                setShowReviews(false);
            }
        }
    };

    const handleViewBook = (bookId: string) => {
        navigate(`/book/${bookId}`);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-dark-900 pt-16 flex items-center justify-center">
                <LoadingSpinner size="lg" text="Chargement des informations du livre..." />
            </div>
        );
    }

    if (error || !book) {
        return (
            <div className="min-h-screen bg-dark-900 pt-16 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">📚</div>
                    <h2 className="text-2xl font-heading font-bold text-dark-300 mb-4">
                        Livre introuvable
                    </h2>
                    <p className="text-dark-400 mb-6">
                        Le livre que vous recherchez n'existe pas ou a été supprimé.
                    </p>
                    <Button onClick={() => navigate('/catalog')}>
                        Retour au catalogue
                    </Button>
                </div>
            </div>
        );
    }

    const availabilityPercentage = (book.quantityAvailable / book.quantityTotal) * 100;
    const isAvailable = book.quantityAvailable > 0;

    return (
        <div className="min-h-screen bg-dark-900 pt-16">
            {/* Hero Section with Book Cover Background */}
            <div className="relative h-96 overflow-hidden">
                {book.coverImageUrl ? (
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(${resolveMediaUrl(book.coverImageUrl)})` }}
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800" />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                {/* Back Button */}
                <motion.button
                    className="absolute top-4 left-4 p-2 glass rounded-full hover:bg-white/20 transition-colors z-20"
                    onClick={() => {
                        if (window.history.length > 1) {
                            navigate(-1);
                        } else {
                            navigate('/catalog');
                        }
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <ArrowLeft className="w-5 h-5 text-white" />
                </motion.button>

                {/* Book Info Overlay */}
                <div className="relative z-10 h-full flex items-end p-4 sm:p-8">
                    <div className="max-w-7xl mx-auto w-full">
                        <div className="flex flex-col lg:flex-row items-end gap-4 lg:gap-8">
                            {/* Book Cover */}
                            <motion.div
                                className="relative"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div
                                    className="w-32 h-40 sm:w-48 sm:h-64 rounded-2xl overflow-hidden shadow-2xl cursor-pointer hover:scale-105 transition-transform duration-300 mx-auto lg:mx-0"
                                    onClick={() => setShowFullImage(true)}
                                >
                                    {book.coverImageUrl ? (
                                        <img
                                            src={resolveMediaUrl(book.coverImageUrl)}
                                            referrerPolicy="no-referrer"
                                            alt={book.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                            }}
                                        />
                                    ) : null}
                                    <div className={`w-full h-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center ${book.coverImageUrl ? 'hidden' : ''}`}>
                                        <BookOpen className="w-16 h-16 text-white" />
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div className="absolute -top-2 -right-2">
                                    {isAvailable ? (
                                        <span className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-full">
                                            Reste {book.quantityAvailable}
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full">
                                            Épuisé
                                        </span>
                                    )}
                                </div>
                            </motion.div>

                            {/* Book Details */}
                            <motion.div
                                className="flex-1 text-white"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold mb-4 text-center lg:text-left">
                                    {book.title}
                                </h1>

                                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mb-4">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        <span className="text-sm sm:text-lg">{book.authors.join(', ')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-sm sm:text-base">{book.year}</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 sm:gap-6 mb-6">
                                    <div className="flex items-center gap-2">
                                        <Hash className="w-4 h-4" />
                                        <span className="text-sm">ISBN: {book.isbn}</span>
                                    </div>
                                    {book.categoryId && (
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="w-4 h-4" />
                                            <span className="text-sm">{getCategoryDisplayName(book.categoryId)}</span>
                                        </div>
                                    )}
                                    {book.publisherId && (
                                        <div className="flex items-center gap-2">
                                            <Building className="w-4 h-4" />
                                            <span className="text-sm">{book.publisherId.name}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Book Stats */}
                                <div className="flex flex-wrap items-center gap-3 sm:gap-6 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Eye className="w-4 h-4" />
                                        <span className="text-xs sm:text-sm">{statsData?.views || 0} vues</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Heart className="w-4 h-4" />
                                        <span className="text-xs sm:text-sm">{statsData?.likes || 0} favoris</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4" />
                                        <span className="text-xs sm:text-sm">{statsData?.borrows || 0} emprunts</span>
                                    </div>
                                </div>

                                {/* Availability Bar */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span>Statut des stocks</span>
                                        <span>{book.quantityAvailable}/{book.quantityTotal} ex.</span>
                                    </div>
                                    <div className="w-full bg-white/20 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-300 ${availabilityPercentage > 50
                                                ? 'bg-green-500'
                                                : availabilityPercentage > 20
                                                    ? 'bg-yellow-500'
                                                    : 'bg-red-500'
                                                }`}
                                            style={{ width: `${availabilityPercentage}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                                    {isAvailable && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
                                                disabled={quantity <= 1}
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center">{quantity}</span>
                                            <button
                                                onClick={() => setQuantity(Math.min(book.quantityAvailable, quantity + 1))}
                                                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
                                                disabled={quantity >= book.quantityAvailable}
                                            >
                                                +
                                            </button>
                                        </div>
                                    )}

                                    <Button
                                        variant="accent"
                                        onClick={handleAddToCart}
                                        disabled={!isAvailable}
                                        className="flex items-center gap-2"
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                        {isAvailable ? 'Ajouter à la sélection' : 'Épuisé'}
                                    </Button>

                                    <button
                                        onClick={handleToggleFavorite}
                                        className={`p-3 glass rounded-full transition-colors ${isFavorite
                                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                            : 'hover:bg-white/10'
                                            }`}
                                        title={isFavorite ? 'Supprimer des favoris' : 'Ajouter aux favoris'}
                                    >
                                        <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                                    </button>

                                    <button
                                        onClick={handleShare}
                                        className="p-3 glass rounded-full hover:bg-white/10 transition-colors"
                                        title="Partager le livre"
                                    >
                                        <Share2 className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={() => setShowReviews(true)}
                                        className="p-3 glass rounded-full hover:bg-white/10 transition-colors"
                                        title="Évaluer le livre"
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Breadcrumb */}
                <div className="mb-6">
                    <nav className="flex items-center space-x-2 text-sm text-dark-400">
                        <button
                            onClick={() => navigate('/catalog')}
                            className="hover:text-primary-400 transition-colors"
                        >
                            Catalogue
                        </button>
                        <span>/</span>
                        {book.categoryId && (
                            <>
                                <span className="text-primary-400">{getCategoryDisplayName(book.categoryId)}</span>
                                <span>/</span>
                            </>
                        )}
                        <span className="text-dark-300 truncate">{book.title}</span>
                    </nav>
                </div>

                {/* Tabs */}
                <div className="mb-8">
                    <div className="flex flex-wrap gap-1 glass rounded-xl p-1">
                        {[
                            { id: 'description', label: 'Description', icon: BookOpen },
                            { id: 'details', label: 'Détails', icon: Hash },
                            { id: 'author', label: 'Auteur', icon: User },
                            { id: 'similar', label: 'Similaires', icon: Star },
                            { id: 'reviews', label: 'Évaluations', icon: MessageCircle },
                            { id: 'related', label: 'Liés', icon: TrendingUp },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${selectedTab === tab.id
                                    ? 'bg-primary-500 text-white'
                                    : 'text-dark-300 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <motion.div
                    key={selectedTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="glass-card p-8"
                >
                    {selectedTab === 'description' && (
                        <div>
                            <h3 className="text-2xl font-heading font-bold text-dark-50 mb-4">
                                Description du livre
                            </h3>
                            <div className="space-y-4">
                                <p className={`text-dark-300 leading-relaxed ${!expandedDescription ? 'line-clamp-4' : ''}`}>
                                    {book.description || 'Aucune description détaillée n\'est disponible pour ce livre.'}
                                </p>

                                {book.description && book.description.length > 200 && (
                                    <button
                                        onClick={() => setExpandedDescription(!expandedDescription)}
                                        className="flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors"
                                    >
                                        {expandedDescription ? (
                                            <>
                                                <ChevronUp className="w-4 h-4" />
                                                Voir moins
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="w-4 h-4" />
                                                Voir plus
                                            </>
                                        )}
                                    </button>
                                )}

                                {/* Keywords */}
                                {book.keywords && book.keywords.length > 0 && (
                                    <div>
                                        <h4 className="text-lg font-semibold text-dark-50 mb-2">Mots-clés :</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {book.keywords.map((keyword, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-sm"
                                                >
                                                    #{keyword}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {selectedTab === 'details' && (
                        <div>
                            <h3 className="text-2xl font-heading font-bold text-dark-50 mb-6">
                                Détails
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Hash className="w-5 h-5 text-primary-400" />
                                        <div>
                                            <p className="text-sm text-dark-400">ISBN</p>
                                            <p className="text-dark-50 font-medium">{book.isbn}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-primary-400" />
                                        <div>
                                            <p className="text-sm text-dark-400">Année de publication</p>
                                            <p className="text-dark-50 font-medium">{book.year}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <BookOpen className="w-5 h-5 text-primary-400" />
                                        <div>
                                            <p className="text-sm text-dark-400">Catégorie</p>
                                            <p className="text-dark-50 font-medium">{book.categoryId ? getCategoryDisplayName(book.categoryId) : 'Non classé'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Building className="w-5 h-5 text-primary-400" />
                                        <div>
                                            <p className="text-sm text-dark-400">Éditeur</p>
                                            <p className="text-dark-50 font-medium">{book.publisherId?.name || 'Non défini'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <User className="w-5 h-5 text-primary-400" />
                                        <div>
                                            <p className="text-sm text-dark-400">Auteur</p>
                                            <p className="text-dark-50 font-medium">{book.authors.join(', ')}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <BookOpen className="w-5 h-5 text-primary-400" />
                                        <div>
                                            <p className="text-sm text-dark-400">Quantité</p>
                                            <p className="text-dark-50 font-medium">
                                                {book.quantityAvailable}/{book.quantityTotal} ex.
                                            </p>
                                        </div>
                                    </div>

                                    {book.location && (
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-5 h-5 text-primary-400" />
                                            <div>
                                                <p className="text-sm text-dark-400">Emplacement</p>
                                                <p className="text-dark-50 font-medium">{book.location}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3">
                                        <Tag className="w-5 h-5 text-primary-400" />
                                        <div>
                                            <p className="text-sm text-dark-400">Statut</p>
                                            <p className={`font-medium ${book.status === 'ACTIVE' ? 'text-green-400' :
                                                book.status === 'INACTIVE' ? 'text-gray-400' :
                                                    book.status === 'LOST' ? 'text-red-400' :
                                                        'text-yellow-400'
                                                }`}>
                                                {book.status === 'ACTIVE' ? 'Actif' :
                                                    book.status === 'INACTIVE' ? 'Inactif' :
                                                        book.status === 'LOST' ? 'Perdu' :
                                                            'Endommagé'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedTab === 'author' && (
                        <div>
                            <h3 className="text-2xl font-heading font-bold text-dark-50 mb-6">
                                Informations sur l'auteur
                            </h3>
                            <div className="space-y-4">
                                {book.authors.map((author, index) => (
                                    <div key={index} className="flex items-center gap-4 p-4 glass rounded-xl">
                                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                                            <User className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-heading font-semibold text-dark-50">
                                                {author}
                                            </h4>
                                            <p className="text-dark-400">
                                                Auteur du livre "{book.title}"
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedTab === 'similar' && (
                        <div>
                            <h3 className="text-2xl font-heading font-bold text-dark-50 mb-6">
                                Livres du même genre
                            </h3>
                            {similarBooks?.books && similarBooks.books.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {similarBooks.books
                                        .filter(book => book._id !== id)
                                        .slice(0, 6)
                                        .map((similarBook) => (
                                            <motion.div
                                                key={similarBook._id}
                                                whileHover={{ y: -5 }}
                                                transition={{ duration: 0.2 }}
                                                className="cursor-pointer"
                                                onClick={() => handleViewBook(similarBook._id)}
                                            >
                                                <BookCard book={similarBook} />
                                            </motion.div>
                                        ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">📚</div>
                                    <p className="text-dark-400">
                                        Il n'y a pas de livres du même genre.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {selectedTab === 'reviews' && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-2xl font-heading font-bold text-dark-50">
                                        Évaluations du livre
                                    </h3>
                                    {reviewsData?.reviews && reviewsData.reviews.length > 0 && (
                                        <div className="flex items-center gap-4 mt-2">
                                            <div className="flex items-center gap-2">
                                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                <span className="text-sm text-dark-300">
                                                    {reviewsData.reviews.length} évaluations
                                                </span>
                                                {reviewsData.reviews.filter((r: any) => r.status === 'HIDDEN').length > 0 && (
                                                    <span className="text-sm text-yellow-400">
                                                        ({reviewsData.reviews.filter((r: any) => r.status === 'HIDDEN').length} masquées)
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-dark-400">
                                                Moyenne : {reviewsData.reviews
                                                    .reduce((acc: number, r: any) => acc + r.rating, 0) /
                                                    reviewsData.reviews.length || 0}/5
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {isAuthenticated && !hasUserReviewed && (
                                    <Button
                                        variant="primary"
                                        onClick={() => setShowReviews(true)}
                                        className="flex items-center gap-2"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        Écrire une évaluation
                                    </Button>
                                )}
                                {isAuthenticated && hasUserReviewed && (
                                    <div className="flex items-center gap-2 text-green-400">
                                        <MessageCircle className="w-4 h-4" />
                                        <span>Vous avez déjà évalué ce livre</span>
                                    </div>
                                )}
                            </div>

                            {/* Reviews */}
                            <div className="space-y-4">
                                {reviewsData?.reviews && reviewsData.reviews.length > 0 ? (
                                    reviewsData.reviews
                                        .map((review: any, index: number) => (
                                            <div key={index} className={`glass-card p-4 ${review.status === 'HIDDEN' ? 'opacity-60 border-l-4 border-yellow-500' : ''}`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-dark-50">
                                                            {review.userId?.fullName || review.userName || 'Utilisateur anonyme'}
                                                        </span>
                                                        {review.status === 'HIDDEN' && (
                                                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                                                                Masqué
                                                            </span>
                                                        )}
                                                        <div className="flex items-center gap-1">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-400'
                                                                        }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-sm text-yellow-400 font-medium">
                                                            {review.rating}/5
                                                        </span>
                                                    </div>
                                                    <span className="text-sm text-dark-400">
                                                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                                <p className="text-dark-300 leading-relaxed">
                                                    {review.status === 'HIDDEN' ? '****' : review.comment}
                                                </p>

                                                {/* Review Stats */}
                                                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-dark-700">
                                                    <div className="flex items-center gap-1 text-sm text-dark-400">
                                                        <ThumbsUp className="w-4 h-4" />
                                                        <span>{review.helpful || 0} utile</span>
                                                    </div>
                                                    <div className="text-sm text-dark-400">
                                                        {review.isAnonymous ? 'Évaluation anonyme' : 'Évaluation publique'}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="text-4xl mb-4">💬</div>
                                        <p className="text-dark-400">
                                            Aucune évaluation pour ce livre.
                                        </p>
                                        {isAuthenticated && !hasUserReviewed && (
                                            <Button
                                                variant="primary"
                                                onClick={() => setShowReviews(true)}
                                                className="mt-4"
                                            >
                                                Soyez le premier à évaluer
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {selectedTab === 'related' && (
                        <div>
                            <h3 className="text-2xl font-heading font-bold text-dark-50 mb-6">
                                Livres du même auteur
                            </h3>
                            {authorBooks?.books && authorBooks.books.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {authorBooks.books
                                        .filter(book => book._id !== id)
                                        .slice(0, 6)
                                        .map((authorBook) => (
                                            <motion.div
                                                key={authorBook._id}
                                                whileHover={{ y: -5 }}
                                                transition={{ duration: 0.2 }}
                                                className="cursor-pointer"
                                                onClick={() => handleViewBook(authorBook._id)}
                                            >
                                                <BookCard book={authorBook} />
                                            </motion.div>
                                        ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">👤</div>
                                    <p className="text-dark-400">
                                        Aucun autre livre de cet auteur.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Auth Modal */}
            <Modal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                title="Connectez-vous pour continuer 📚"
            >
                <div className="text-center py-6">
                    <div className="text-6xl mb-4">🔐</div>
                    <p className="text-dark-300 mb-6">
                        Vous devez être connecté pour ajouter des livres à votre sélection.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Button variant="secondary" onClick={() => setShowAuthModal(false)}>
                            Fermer
                        </Button>
                        <Button onClick={handleLogin}>
                            Se connecter
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Share Modal */}
            <Modal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                title="Partager le livre 📤"
            >
                <div className="py-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                Lien de partage :
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={window.location.href}
                                    readOnly
                                    className="flex-1 px-3 py-2 input-field text-sm"
                                />
                                <Button onClick={copyToClipboard} variant="primary">
                                    Copier
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    const text = `Voir le livre "${book?.title}" sur la bibliothèque : ${window.location.href}`;
                                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
                                }}
                                className="flex items-center gap-2"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Facebook
                            </Button>

                            <Button
                                variant="secondary"
                                onClick={() => {
                                    const text = `Voir le livre "${book?.title}" sur la bibliothèque : ${window.location.href}`;
                                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                                }}
                                className="flex items-center gap-2"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Twitter
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Review Modal */}
            <Modal
                isOpen={showReviews}
                onClose={() => setShowReviews(false)}
                title="Évaluer le livre ⭐"
            >
                <div className="py-6">
                    {/* Info Banner */}
                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <div className="text-blue-400 text-lg">ℹ️</div>
                            <div className="text-sm text-blue-300">
                                <p className="font-medium mb-1">Informations importantes :</p>
                                <p>Votre évaluation sera affichée publiquement après modération. Veuillez partager un avis honnête et utile.</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Rating */}
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-3">
                                Votre note :
                            </label>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="transition-colors"
                                    >
                                        <Star
                                            className={`w-8 h-8 ${star <= (hoverRating || rating)
                                                ? 'text-yellow-400 fill-current'
                                                : 'text-gray-400'
                                                }`}
                                        />
                                    </button>
                                ))}
                                <span className="ml-2 text-sm text-dark-400">
                                    {rating > 0 && `${rating}/5 étoiles`}
                                </span>
                            </div>
                        </div>

                        {/* Review Text */}
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                Commentaire :
                            </label>
                            <textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder="Partagez votre avis sur ce livre... (minimum 10 caractères)"
                                className="w-full px-3 py-2 input-field resize-none"
                                rows={4}
                                maxLength={1000}
                            />
                            <div className="flex justify-between items-center mt-1">
                                <span className={`text-xs ${reviewText.length < 10 ? 'text-red-400' : reviewText.length > 900 ? 'text-yellow-400' : 'text-dark-400'}`}>
                                    {reviewText.length < 10
                                        ? `Encore ${10 - reviewText.length} caractère(s) requis`
                                        : reviewText.length > 900
                                            ? `Reste ${1000 - reviewText.length} caractère(s)`
                                            : `${reviewText.length}/1000 caractères`
                                    }
                                </span>
                                <span className="text-xs text-dark-400">
                                    {reviewText.length}/1000
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="secondary"
                                onClick={() => setShowReviews(false)}
                            >
                                Annuler
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleSubmitReview}
                                disabled={rating === 0 || !reviewText.trim() || reviewText.trim().length < 10}
                            >
                                Envoyer
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Full Image Modal */}
            <Modal
                isOpen={showFullImage}
                onClose={() => setShowFullImage(false)}
                title=""
                size="xl"
            >
                <div className="p-4">
                    {book?.coverImageUrl ? (
                        <img
                            src={resolveMediaUrl(book.coverImageUrl)}
                            referrerPolicy="no-referrer"
                            alt={book.title}
                            className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                        />
                    ) : null}
                    <div className={`w-full h-96 bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center rounded-lg ${book?.coverImageUrl ? 'hidden' : ''}`}>
                        <BookOpen className="w-32 h-32 text-white" />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default BookDetail;
