import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, Star, ArrowRight, Sparkles, Users, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { Book } from '../types';
import BookCard from '../components/ui/BookCard';
import { BookListSkeleton } from '../components/ui/Skeleton';

const Home: React.FC = () => {
    const navigate = useNavigate();

    // Fetch books for different sections
    const { data: newBooks, isLoading: isLoadingNew } = useQuery({
        queryKey: ['books', 'new'],
        queryFn: () => apiClient.getBooks({ limit: 8, sort: 'newest' }),
    });

    const { data: popularBooks, isLoading: isLoadingPopular } = useQuery({
        queryKey: ['books', 'popular'],
        queryFn: () => apiClient.getBooks({ limit: 8, sort: 'popular' }),
    });

    const { data: topRatedBooks, isLoading: isLoadingTopRated } = useQuery({
        queryKey: ['books', 'top-rated'],
        queryFn: () => apiClient.getBooks({ limit: 8, sort: 'rating' }),
    });


    const carouselSections = [
        {
            title: 'Nouveautés du jour',
            data: newBooks?.books || [],
            isLoading: isLoadingNew,
        },
        {
            title: 'Les plus empruntés',
            data: popularBooks?.books || [],
            isLoading: isLoadingPopular,
        },
        {
            title: 'Les mieux notés',
            data: topRatedBooks?.books || [],
            isLoading: isLoadingTopRated,
        },
    ];

    return (
        <div className="min-h-screen bg-dark-900">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900" />

                {/* Animated Background Elements */}
                <div className="absolute inset-0">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-white/20 rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                            }}
                            animate={{
                                y: [0, -20, 0],
                                opacity: [0.2, 0.8, 0.2],
                            }}
                            transition={{
                                duration: 3 + Math.random() * 2,
                                repeat: Infinity,
                                delay: Math.random() * 2,
                            }}
                        />
                    ))}
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white mb-6">
                            Découvrez le savoir
                            <br />
                            <span className="bg-gradient-to-r from-accent-400 to-accent-300 bg-clip-text text-transparent">
                                n'importe où, n'importe quand
                            </span>
                        </h1>

                        <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                            Empruntez, lisez, enregistrez – tout en un seul endroit.
                            Un système moderne de gestion de bibliothèque pour une expérience exceptionnelle.
                        </p>

                        {/* Stats Section */}
                        <div className="max-w-4xl mx-auto mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="glass-card p-6 text-center"
                                >
                                    <BookOpen className="w-8 h-8 text-accent-400 mx-auto mb-3" />
                                    <div className="text-2xl font-bold text-white mb-1">10,000+</div>
                                    <div className="text-white/70">Livres</div>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="glass-card p-6 text-center"
                                >
                                    <Users className="w-8 h-8 text-accent-400 mx-auto mb-3" />
                                    <div className="text-2xl font-bold text-white mb-1">5,000+</div>
                                    <div className="text-white/70">Lecteurs</div>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="glass-card p-6 text-center"
                                >
                                    <Award className="w-8 h-8 text-accent-400 mx-auto mb-3" />
                                    <div className="text-2xl font-bold text-white mb-1">50+</div>
                                    <div className="text-white/70">Catégories</div>
                                </motion.div>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <motion.button
                                className="btn-accent text-lg px-8 py-4"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/catalog')}
                            >
                                Découvrir les nouveautés
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </motion.button>

                            <motion.button
                                className="btn-secondary text-lg px-8 py-4"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/login')}
                            >
                                Se connecter
                            </motion.button>
                        </div>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                        <motion.div
                            className="w-1 h-3 bg-white/60 rounded-full mt-2"
                            animate={{ y: [0, 12, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </div>
                </motion.div>
            </section>

            {/* Dynamic Content Rows */}
            <section className="py-16 bg-dark-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {carouselSections.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="mb-16">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-3xl font-heading font-bold gradient-text">
                                    {section.title}
                                </h2>
                                <motion.button
                                    className="flex items-center text-primary-400 hover:text-primary-300 transition-colors duration-200"
                                    whileHover={{ x: 5 }}
                                    onClick={() => navigate('/catalog')}
                                >
                                    Voir tout
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </motion.button>
                            </div>

                            {section.isLoading ? (
                                <BookListSkeleton />
                            ) : (
                                <div className="relative">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                                        {section.data.map((book: Book, index: number) => (
                                            <motion.div
                                                key={book._id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                <BookCard book={book} />
                                            </motion.div>
                                        ))}
                                    </div>

                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-dark-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-heading font-bold text-dark-50 mb-4">
                            Pourquoi nous choisir ?
                        </h2>
                        <p className="text-dark-300 text-lg max-w-2xl mx-auto">
                            Un système moderne de gestion de bibliothèque aux fonctionnalités exceptionnelles.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: BookOpen,
                                title: 'Vaste collection de livres',
                                description: 'Des milliers de livres de toutes catégories, toujours mis à jour avec les dernières nouveautés.',
                                color: 'from-blue-500 to-blue-600',
                            },
                            {
                                icon: TrendingUp,
                                title: 'Système intelligent',
                                description: 'La technologie IA suggère des livres pertinents et automatise la gestion des emprunts.',
                                color: 'from-green-500 to-green-600',
                            },
                            {
                                icon: Star,
                                title: 'Expérience exceptionnelle',
                                description: 'Interface moderne, conviviale et facile à utiliser sur tous les appareils.',
                                color: 'from-purple-500 to-purple-600',
                            },
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                className="glass-card p-8 text-center group hover:scale-105 transition-transform duration-300"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.2 }}
                                viewport={{ once: true }}
                            >
                                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                    <feature.icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-heading font-semibold text-dark-50 mb-4 group-hover:text-primary-400 transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-dark-300 leading-relaxed group-hover:text-dark-200 transition-colors">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Popular Categories Section */}
            <section className="py-16 bg-dark-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-heading font-bold text-dark-50 mb-4">
                            Catégories populaires
                        </h2>
                        <p className="text-dark-300 text-lg max-w-2xl mx-auto">
                            Découvrez nos catégories de livres les plus populaires.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {[
                            { name: 'Science', icon: Sparkles, color: 'from-blue-500 to-blue-600' },
                            { name: 'Littérature', icon: BookOpen, color: 'from-green-500 to-green-600' },
                            { name: 'Économie', icon: TrendingUp, color: 'from-yellow-500 to-yellow-600' },
                            { name: 'Histoire', icon: Award, color: 'from-purple-500 to-purple-600' },
                            { name: 'Technologie', icon: Star, color: 'from-red-500 to-red-600' },
                            { name: 'Art', icon: Users, color: 'from-pink-500 to-pink-600' },
                        ].map((category, index) => (
                            <motion.div
                                key={index}
                                className="glass-card p-6 text-center group hover:scale-105 transition-all duration-300 cursor-pointer"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                onClick={() => navigate('/categories')}
                            >
                                <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                    <category.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-sm font-medium text-dark-50 group-hover:text-primary-400 transition-colors">
                                    {category.name}
                                </h3>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
