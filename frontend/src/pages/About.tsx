import React from 'react';
import { motion } from 'framer-motion';
import {
    BookOpen,
    Users,
    Target,
    Award,
    Heart,
    Globe,
    Shield,
    Zap
} from 'lucide-react';

const About: React.FC = () => {
    const features = [
        {
            icon: BookOpen,
            title: 'Vaste collection de livres',
            description: 'Plus de 10 000 titres dans divers domaines, mis à jour continuellement'
        },
        {
            icon: Users,
            title: 'Communauté d\'apprentissage',
            description: 'Connectez-vous avec des milliers d\'étudiants et de professeurs sur le système'
        },
        {
            icon: Target,
            title: 'Objectifs clairs',
            description: 'Soutien maximal à l\'apprentissage et à la recherche pour les étudiants'
        },
        {
            icon: Award,
            title: 'Haute qualité',
            description: 'Les livres sont soigneusement sélectionnés auprès d\'éditeurs réputés'
        },
        {
            icon: Heart,
            title: 'Service dévoué',
            description: 'Une équipe de bibliothécaires professionnels, prêts à vous assister 24/7'
        },
        {
            icon: Globe,
            title: 'Accès à tout moment',
            description: 'Le système en ligne vous permet de rechercher et de réserver des livres à tout moment, n\'importe où'
        }
    ];

    const stats = [
        { number: '10,000+', label: 'Livres' },
        { number: '5,000+', label: 'Étudiants' },
        { number: '500+', label: 'Professeurs' },
        { number: '50+', label: 'Catégories' }
    ];

    return (
        <div className="min-h-screen bg-dark-900 pt-16">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900" />

                {/* Background Elements */}
                <div className="absolute inset-0">
                    {Array.from({ length: 30 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-white/20 rounded-full"
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
                            À propos de la bibliothèque
                        </h1>
                        <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                            Un système moderne de gestion de bibliothèque, offrant la meilleure expérience d'apprentissage et de recherche à la communauté étudiante.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-dark-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                className="text-center"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <div className="text-3xl md:text-4xl font-bold text-primary-400 mb-2">
                                    {stat.number}
                                </div>
                                <div className="text-dark-300 font-medium">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl font-heading font-bold text-dark-50 mb-6">
                                Notre mission
                            </h2>
                            <p className="text-dark-300 text-lg leading-relaxed mb-6">
                                La bibliothèque a été fondée avec pour mission de fournir aux étudiants et aux enseignants des ressources d'étude et de recherche riches et modernes. Nous nous engageons à offrir la meilleure expérience d'apprentissage grâce à une technologie de pointe et un service professionnel.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-primary-400" />
                                    <span className="text-dark-300">Haute sécurité des informations</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Zap className="w-5 h-5 text-primary-400" />
                                    <span className="text-dark-300">Vitesse d'accès rapide</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Heart className="w-5 h-5 text-primary-400" />
                                    <span className="text-dark-300">Service dévoué</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="relative"
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <div className="glass-card p-8">
                                <div className="text-center">
                                    <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <BookOpen className="w-12 h-12 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-heading font-bold text-dark-50 mb-4">
                                        Bibliothèque numérique moderne
                                    </h3>
                                    <p className="text-dark-300 leading-relaxed">
                                        Appliquer une technologie de pointe pour offrir aux utilisateurs la meilleure expérience d'apprentissage et de recherche.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-dark-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-heading font-bold text-dark-50 mb-4">
                            Pourquoi nous choisir ?
                        </h2>
                        <p className="text-dark-300 text-lg max-w-2xl mx-auto">
                            Nous proposons les meilleures fonctionnalités et services pour soutenir votre apprentissage et votre recherche.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                className="glass-card p-6 text-center"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <feature.icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-heading font-semibold text-dark-50 mb-4">
                                    {feature.title}
                                </h3>
                                <p className="text-dark-300 leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-heading font-bold text-dark-50 mb-6">
                            Contactez-nous
                        </h2>
                        <p className="text-dark-300 text-lg mb-8">
                            Vous avez des questions ou besoin d'aide ? Nous sommes toujours prêts à vous aider.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="glass-card p-6">
                                <Globe className="w-8 h-8 text-primary-400 mx-auto mb-4" />
                                <h3 className="font-heading font-semibold text-dark-50 mb-2">
                                    Website
                                </h3>
                                <p className="text-dark-300 text-sm">
                                    www.thuvien.edu.vn
                                </p>
                            </div>

                            <div className="glass-card p-6">
                                <Users className="w-8 h-8 text-primary-400 mx-auto mb-4" />
                                <h3 className="font-heading font-semibold text-dark-50 mb-2">
                                    Hotline
                                </h3>
                                <p className="text-dark-300 text-sm">
                                    (028) 1234-5678
                                </p>
                            </div>

                            <div className="glass-card p-6">
                                <Heart className="w-8 h-8 text-primary-400 mx-auto mb-4" />
                                <h3 className="font-heading font-semibold text-dark-50 mb-2">
                                    Email
                                </h3>
                                <p className="text-dark-300 text-sm">
                                    support@thuvien.edu.vn
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default About;
