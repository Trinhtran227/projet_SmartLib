import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { name: 'Accueil', href: '/' },
        { name: 'Nouveautés', href: '/catalog?sort=newest' },
        { name: 'Catégories', href: '/categories' },
        { name: 'Politiques', href: '/policy' },
        { name: 'Support', href: '/support' },
    ];

    const socialLinks = [
        { name: 'Facebook', icon: Facebook, href: '#' },
        { name: 'Twitter', icon: Twitter, href: '#' },
        { name: 'LinkedIn', icon: Linkedin, href: '#' },
        { name: 'Instagram', icon: Instagram, href: '#' },
    ];

    return (
        <footer className="bg-dark-900 border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-heading font-bold text-xl gradient-text">
                                Bibliothèque
                            </span>
                        </Link>
                        <p className="text-dark-300 text-sm leading-relaxed">
                            Découvrez les connaissances partout, à tout moment. Un système de gestion de bibliothèque moderne
                            avec une interface conviviale et une expérience exceptionnelle.
                        </p>
                        <div className="flex space-x-4">
                            {socialLinks.map((social) => (
                                <motion.a
                                    key={social.name}
                                    href={social.href}
                                    className="p-2 glass rounded-full hover:bg-primary-500/20 transition-colors duration-200"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <social.icon className="w-4 h-4 text-dark-300 hover:text-primary-400" />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="font-heading font-semibold text-dark-50 text-lg">
                            Liens rapides
                        </h3>
                        <ul className="space-y-2">
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.href}
                                        className="text-dark-300 hover:text-primary-400 transition-colors duration-200 text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h3 className="font-heading font-semibold text-dark-50 text-lg">
                            Informations de contact
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0" />
                                <span className="text-dark-300 text-sm">
                                    123 Rue ABC, District XYZ, HCMV
                                </span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Phone className="w-4 h-4 text-primary-400 flex-shrink-0" />
                                <span className="text-dark-300 text-sm">
                                    (028) 1234-5678
                                </span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />
                                <span className="text-dark-300 text-sm">
                                    info@thuvien.edu.vn
                                </span>
                            </div>
                        </div>
                        <div className="pt-4">
                            <p className="text-dark-400 text-xs">
                                Heures d'ouverture : Lun - Ven : 8h00 - 17h00<br />
                                Sam : 8h00 - 12h00
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <motion.div
                    className="mt-8 pt-8 border-t border-white/10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
                        <p className="text-dark-400 text-sm">
                            © {currentYear} Bibliothèque. Tous droits réservés.
                        </p>
                        <div className="flex items-center space-x-6 text-sm">
                            <Link
                                to="/privacy"
                                className="text-dark-400 hover:text-primary-400 transition-colors duration-200"
                            >
                                Politique de confidentialité
                            </Link>
                            <Link
                                to="/terms"
                                className="text-dark-400 hover:text-primary-400 transition-colors duration-200"
                            >
                                Conditions d'utilisation
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </footer>
    );
};

export default Footer;
