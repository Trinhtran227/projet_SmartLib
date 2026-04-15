import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingCart,
    Trash2,
    Plus,
    Minus,
    Calendar,
    BookOpen,
    ArrowRight,
    X
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { apiClient } from '../lib/api';
import { resolveMediaUrl } from '../lib/mediaUrl';

const Cart: React.FC = () => {
    const { items, updateQuantity, removeItem, clearCart, totalItems } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [dueDate, setDueDate] = useState(() => {
        const date = addDays(new Date(), 7);
        return format(date, 'yyyy-MM-dd');
    });
    const [isCreatingLoan, setIsCreatingLoan] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleQuantityChange = (bookId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeItem(bookId);
        } else {
            updateQuantity(bookId, newQuantity);
        }
    };

    const handleCreateLoan = async () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: '/cart' } } });
            return;
        }

        setIsCreatingLoan(true);
        try {
            const loanItems = items.map(item => ({
                bookId: item.bookId,
                qty: item.qty
            }));

            await apiClient.createLoan(dueDate, loanItems);

            toast.success('Prêt créé avec succès ! 📚');
            clearCart();
            navigate('/my-loans');
        } catch (error: any) {
            const message = error.response?.data?.error?.message || 'Une erreur est survenue lors de la création du prêt';
            toast.error(message);
        } finally {
            setIsCreatingLoan(false);
            setShowConfirmModal(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-dark-900 pt-16 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="text-6xl mb-6">🔐</div>
                    <h2 className="text-2xl font-heading font-bold text-dark-50 mb-4">
                        Connexion requise
                    </h2>
                    <p className="text-dark-300 mb-8">
                        Vous devez vous connecter pour voir votre sélection et créer un prêt.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Button variant="secondary" onClick={() => navigate('/')}>
                            Accueil
                        </Button>
                        <Button onClick={() => navigate('/login')}>
                            Se connecter
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-dark-900 pt-16 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="text-6xl mb-6">🛒</div>
                    <h2 className="text-2xl font-heading font-bold text-dark-50 mb-4">
                        Votre sélection est vide
                    </h2>
                    <p className="text-dark-300 mb-8">
                        Vous n'avez aucun livre dans votre sélection. Explorez et ajoutez des livres !
                    </p>
                    <Button onClick={() => navigate('/catalog')}>
                        Explorer les livres
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-900 pt-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-heading font-bold text-dark-50 mb-2">
                            Votre sélection de livres
                        </h1>
                        <p className="text-dark-300">
                            {totalItems} livre(s) dans la sélection
                        </p>
                    </div>

                    <Button
                        variant="ghost"
                        onClick={clearCart}
                        className="text-red-400 hover:text-red-300"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Tout supprimer
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item, index) => (
                            <motion.div
                                key={item.bookId}
                                className="glass-card p-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="flex items-center gap-4">
                                    {/* Book Cover */}
                                    <div className="w-16 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                        {item.book.coverImageUrl ? (
                                            <img
                                                src={resolveMediaUrl(item.book.coverImageUrl)}
                                                referrerPolicy="no-referrer"
                                                alt={item.book.title}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                }}
                                            />
                                        ) : null}
                                        <div className={`w-full h-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center ${item.book.coverImageUrl ? 'hidden' : ''}`}>
                                            <BookOpen className="w-6 h-6 text-white" />
                                        </div>
                                    </div>

                                    {/* Book Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-heading font-semibold text-dark-50 line-clamp-2 mb-1">
                                            {item.book.title}
                                        </h3>
                                        <p className="text-sm text-dark-300 line-clamp-1 mb-2">
                                            {item.book.authors.join(', ')}
                                        </p>
                                        <div className="flex items-center gap-4 text-sm text-dark-400">
                                            <span>ISBN: {item.book.isbn}</span>
                                            <span>Année : {item.book.year}</span>
                                        </div>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleQuantityChange(item.bookId, item.qty - 1)}
                                                className="w-8 h-8 rounded-full bg-dark-700 hover:bg-dark-600 transition-colors flex items-center justify-center"
                                                disabled={item.qty <= 1}
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>

                                            <span className="w-8 text-center font-medium text-dark-50">
                                                {item.qty}
                                            </span>

                                            <button
                                                onClick={() => handleQuantityChange(item.bookId, item.qty + 1)}
                                                className="w-8 h-8 rounded-full bg-dark-700 hover:bg-dark-600 transition-colors flex items-center justify-center"
                                                disabled={item.qty >= item.book.quantityAvailable}
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => removeItem(item.bookId)}
                                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="glass-card p-6 sticky top-24">
                            <h3 className="text-xl font-heading font-bold text-dark-50 mb-6">
                                Détails du prêt
                            </h3>

                            {/* Due Date Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-dark-200 mb-2">
                                    Date de retour prévue
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-4 h-4" />
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        min={format(new Date(), 'yyyy-MM-dd')}
                                        className="w-full pl-10 pr-4 py-3 input-field"
                                    />
                                </div>
                                <p className="text-xs text-dark-400 mt-1">
                                    Emprunt gratuit pendant 7 jours
                                </p>
                            </div>

                            {/* Summary */}
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-dark-300">
                                    <span>Total des titres :</span>
                                    <span className="font-medium">{totalItems}</span>
                                </div>
                                <div className="flex justify-between text-dark-300">
                                    <span>Total des exemplaires :</span>
                                    <span className="font-medium">{items.reduce((sum, item) => sum + item.qty, 0)}</span>
                                </div>
                                <hr className="border-white/10" />
                                <div className="flex justify-between text-dark-50 font-semibold">
                                    <span>Total :</span>
                                    <span>{totalItems} titre(s)</span>
                                </div>
                            </div>

                            {/* Create Loan Button */}
                            <Button
                                onClick={() => setShowConfirmModal(true)}
                                className="w-full flex items-center justify-center gap-2"
                                disabled={isCreatingLoan}
                            >
                                {isCreatingLoan ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Création du prêt en cours...
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="w-4 h-4" />
                                        Créer le prêt
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </Button>

                            <p className="text-xs text-dark-400 mt-4 text-center">
                                En créant un prêt, vous acceptez les{' '}
                                <a href="/terms" className="text-primary-400 hover:text-primary-300">
                                    conditions d'utilisation
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirm Modal */}
            <Modal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                title="Confirmer la création du prêt"
            >
                <div className="space-y-4">
                    <div className="text-center">
                        <div className="text-4xl mb-4">📚</div>
                        <p className="text-dark-300 mb-4">
                            Êtes-vous sûr de vouloir créer un prêt pour {totalItems} titre(s) ?
                        </p>
                        <div className="bg-dark-800 rounded-lg p-4 mb-6">
                            <div className="flex justify-between text-sm text-dark-300 mb-2">
                                <span>Date de retour prévue :</span>
                                <span className="font-medium">
                                    {format(new Date(dueDate), 'dd/MM/yyyy', { locale: fr })}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm text-dark-300">
                                <span>Total des livres :</span>
                                <span className="font-medium">{items.reduce((sum, item) => sum + item.qty, 0)} exemplaire(s)</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => setShowConfirmModal(false)}
                            className="flex-1"
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleCreateLoan}
                            className="flex-1"
                            disabled={isCreatingLoan}
                        >
                            Confirmer
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Cart;
