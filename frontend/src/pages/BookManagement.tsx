import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    BookOpen,
    Plus,
    Edit,
    Trash2,
    Search,
    Filter,
    Eye,
    Save,
    X,
    Tag,
    Calendar,
    User,
    DollarSign,
    Hash,
    Building,
    FileText,
    RefreshCw,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { getCategoryDisplayName, getCategoryDisplayNameFromName } from '../lib/categoryLabels';
import { resolveMediaUrl } from '../lib/mediaUrl';

const BookManagement: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // States
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedPublisher, setSelectedPublisher] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [sortBy, setSortBy] = useState('title');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [showBookModal, setShowBookModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showBookDetailModal, setShowBookDetailModal] = useState(false);
    const [selectedBook, setSelectedBook] = useState<any>(null);
    const [confirmAction, setConfirmAction] = useState<{
        type: 'deleteBook' | 'deleteCategory';
        id: string;
        title: string;
    } | null>(null);
    const [editingBook, setEditingBook] = useState<any>(null);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [viewMode, setViewMode] = useState<'books' | 'categories'>('books');

    // Form states
    const [bookForm, setBookForm] = useState({
        title: '',
        authors: [''],
        isbn: '',
        publisher: '',
        year: '',
        pages: '',
        category: '',
        faculty: '',
        department: '',
        description: '',
        quantityTotal: 1,
        quantityAvailable: 1,
        location: '',
        keywords: [''],
        coverImageUrl: '',
        price: 0
    });
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [categoryForm, setCategoryForm] = useState({
        name: '',
        description: ''
    });

    // Queries
    const { data: books, isLoading: isLoadingBooks } = useQuery({
        queryKey: ['books-management', currentPage, searchTerm, selectedCategory, selectedPublisher, selectedStatus, sortBy, sortOrder, itemsPerPage],
        queryFn: async () => {
            // Find category and publisher IDs from names
            const categoryId = selectedCategory ? categories?.find(cat => cat.name === selectedCategory)?._id : undefined;
            const publisherId = selectedPublisher ? publishers?.find(pub => pub.name === selectedPublisher)?._id : undefined;

            const result = await apiClient.getBooks({
                page: currentPage,
                limit: itemsPerPage,
                q: searchTerm,
                categoryId: categoryId,
                publisherId: publisherId,
                // Note: Backend doesn't support status, sortBy, sortOrder filters yet
            });
            console.log('Books data from API:', result);

            // Client-side filtering for status (backend doesn't support it yet)
            let filteredBooks = result?.books || [];
            if (selectedStatus) {
                filteredBooks = filteredBooks.filter((book: any) => {
                    const available = book.quantityAvailable || book.availableQuantity || 0;
                    if (selectedStatus === 'available') {
                        return available > 0;
                    } else if (selectedStatus === 'unavailable') {
                        return available === 0;
                    }
                    return true;
                });
            }

            // Client-side sorting (backend doesn't support it yet)
            if (sortBy && sortOrder) {
                filteredBooks = filteredBooks.sort((a: any, b: any) => {
                    let aValue, bValue;

                    switch (sortBy) {
                        case 'title':
                            aValue = a.title || '';
                            bValue = b.title || '';
                            break;
                        case 'year':
                            aValue = a.year || a.publicationYear || 0;
                            bValue = b.year || b.publicationYear || 0;
                            break;
                        case 'createdAt':
                            aValue = new Date(a.createdAt || 0).getTime();
                            bValue = new Date(b.createdAt || 0).getTime();
                            break;
                        case 'quantityAvailable':
                            aValue = a.quantityAvailable || a.availableQuantity || 0;
                            bValue = b.quantityAvailable || b.availableQuantity || 0;
                            break;
                        default:
                            return 0;
                    }

                    if (sortOrder === 'asc') {
                        return aValue > bValue ? 1 : -1;
                    } else {
                        return aValue < bValue ? 1 : -1;
                    }
                });
            }

            if (filteredBooks.length > 0) {
                console.log('First book sample:', filteredBooks[0]);
                console.log('Book pages:', (filteredBooks[0] as any).pages);
                console.log('Book description:', (filteredBooks[0] as any).description);
                console.log('Book categoryId:', (filteredBooks[0] as any).categoryId);
                console.log('Book publisherId:', (filteredBooks[0] as any).publisherId);
            }

            return {
                ...result,
                books: filteredBooks
            };
        },
        enabled: user?.role === 'ADMIN' || user?.role === 'LIBRARIAN'
    });

    const { data: categories, isLoading: isLoadingCategories, error: categoriesError } = useQuery({
        queryKey: ['categories-management'],
        queryFn: async () => {
            console.log('Fetching categories...');
            const result = await apiClient.getCategories();
            console.log('Categories fetched:', result);
            console.log('Categories type:', typeof result);
            console.log('Categories length:', Array.isArray(result) ? result.length : 'Not an array');
            return result;
        },
        enabled: user?.role === 'ADMIN' || user?.role === 'LIBRARIAN'
    });

    const { data: publishers, isLoading: isLoadingPublishers } = useQuery({
        queryKey: ['publishers-management'],
        queryFn: async () => {
            console.log('Fetching publishers...');
            const result = await apiClient.getPublishers();
            console.log('Publishers fetched:', result);
            return result;
        },
        enabled: user?.role === 'ADMIN' || user?.role === 'LIBRARIAN'
    });

    const { data: faculties, isLoading: isLoadingFaculties } = useQuery({
        queryKey: ['faculties-management'],
        queryFn: async () => {
            console.log('Fetching faculties...');
            const result = await apiClient.getFaculties();
            console.log('Faculties fetched:', result);
            return result;
        },
        enabled: user?.role === 'ADMIN' || user?.role === 'LIBRARIAN'
    });

    const { data: departments, isLoading: isLoadingDepartments } = useQuery({
        queryKey: ['departments-management', bookForm.faculty],
        queryFn: async () => {
            if (!bookForm.faculty) return [];
            console.log('Fetching departments for faculty:', bookForm.faculty);
            const result = await apiClient.getDepartments(bookForm.faculty);
            console.log('Departments fetched:', result);
            return result;
        },
        enabled: user?.role === 'ADMIN' || user?.role === 'LIBRARIAN' && !!bookForm.faculty
    });

    // Mutations
    const createBookMutation = useMutation({
        mutationFn: async (bookData: any) => {
            return await apiClient.createBook(bookData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['books-management'] });
            setShowBookModal(false);
            setBookForm({ title: '', authors: [''], isbn: '', publisher: '', year: '', pages: '', category: '', faculty: '', department: '', description: '', quantityTotal: 1, quantityAvailable: 1, location: '', keywords: [''], coverImageUrl: '', price: 0 });
            setSelectedImageFile(null);
            setImagePreview('');
            alert('Livre ajouté avec succès !');
        }
    });

    const updateBookMutation = useMutation({
        mutationFn: async ({ id, bookData }: { id: string, bookData: any }) => {
            return await apiClient.updateBook(id, bookData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['books-management'] });
            setShowBookModal(false);
            setEditingBook(null);
            setBookForm({ title: '', authors: [''], isbn: '', publisher: '', year: '', pages: '', category: '', faculty: '', department: '', description: '', quantityTotal: 1, quantityAvailable: 1, location: '', keywords: [''], coverImageUrl: '', price: 0 });
            setSelectedImageFile(null);
            setImagePreview('');
            alert('Livre mis à jour avec succès !');
        }
    });

    const deleteBookMutation = useMutation({
        mutationFn: async (id: string) => {
            return await apiClient.deleteBook(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['books-management'] });
            alert('Livre supprimé avec succès !');
        }
    });

    const createCategoryMutation = useMutation({
        mutationFn: async (categoryData: any) => {
            console.log('Creating category with data:', categoryData);
            const result = await apiClient.createCategory(categoryData);
            console.log('Category creation result:', result);
            return result;
        },
        onSuccess: (data) => {
            console.log('Category created successfully:', data);
            console.log('Category created data type:', typeof data);
            console.log('Category created data keys:', data ? Object.keys(data) : 'No data');

            // Invalidate and refetch categories
            queryClient.invalidateQueries({ queryKey: ['categories-management'] });
            queryClient.refetchQueries({ queryKey: ['categories-management'] });

            setShowCategoryModal(false);
            setCategoryForm({ name: '', description: '' });
            alert('Catégorie ajoutée avec succès !');
        },
        onError: (error: any) => {
            console.error('Category creation error:', error);
            let errorMessage = 'Erreur inconnue';

            if (error.response?.status === 409) {
                errorMessage = 'Une catégorie avec ce nom existe déjà. Veuillez en choisir un autre.';
            } else if (error.response?.data?.error?.message) {
                errorMessage = error.response.data.error.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            alert('Erreur lors de l\'ajout de la catégorie : ' + errorMessage);
        }
    });

    const updateCategoryMutation = useMutation({
        mutationFn: async ({ id, categoryData }: { id: string, categoryData: any }) => {
            return await apiClient.updateCategory(id, categoryData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories-management'] });
            setShowCategoryModal(false);
            setEditingCategory(null);
            setCategoryForm({ name: '', description: '' });
            alert('Catégorie mise à jour avec succès !');
        }
    });

    const deleteCategoryMutation = useMutation({
        mutationFn: async (id: string) => {
            return await apiClient.deleteCategory(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories-management'] });
            alert('Catégorie supprimée avec succès !');
        }
    });


    // Form handlers
    const handleBookSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Remove ISBN from form data - server will auto-generate
        const { isbn, category, publisher, faculty, department, ...formData } = bookForm;

        // Find category and publisher IDs from names
        const categoryId = category ? categories?.find(cat => cat.name === category)?._id : undefined;
        const publisherId = publisher ? publishers?.find(pub => pub.name === publisher)?._id : undefined;

        // For faculty and department, we'll use the names directly if IDs are not found
        // The backend will handle creating new ones if needed
        const facultyId = faculty ? faculties?.find(fac => fac.name === faculty)?._id : undefined;
        const departmentId = department ? departments?.find(dept => dept.name === department)?._id : undefined;

        // Validate required fields
        if (!categoryId) {
            alert('Veuillez sélectionner la catégorie du livre');
            return;
        }

        if (!publisher || publisher.trim() === '') {
            alert('Veuillez entrer le nom de l\'éditeur');
            return;
        }

        if (!faculty || faculty.trim() === '') {
            alert('Veuillez entrer le nom de la faculté');
            return;
        }

        if (!department || department.trim() === '') {
            alert('Veuillez entrer le nom du département');
            return;
        }

        if (!formData.price || formData.price <= 0) {
            alert('Veuillez entrer un prix valide pour le livre');
            return;
        }

        // Handle image upload
        let coverImageUrl = formData.coverImageUrl;
        if (selectedImageFile) {
            setIsUploadingImage(true);
            try {
                // Upload file to server
                const formData = new FormData();
                formData.append('coverImage', selectedImageFile);

                const uploadResult = await apiClient.uploadBookCover(formData);
                coverImageUrl = uploadResult.coverImageUrl;
            } catch (error) {
                console.error('Error uploading image:', error);
                alert('Erreur lors du téléchargement de l\'image');
                setIsUploadingImage(false);
                return;
            } finally {
                setIsUploadingImage(false);
            }
        }

        // Prepare data for API
        const apiData = {
            ...formData,
            categoryId: categoryId,
            publisherId: publisherId || null, // Send null if not found, backend will create new
            facultyId: facultyId || null, // Send null if not found, backend will create new
            departmentId: departmentId || null, // Send null if not found, backend will create new
            publisherName: publisher, // Always include publisher name
            facultyName: faculty, // Always include faculty name
            departmentName: department, // Always include department name
            coverImageUrl: coverImageUrl
        };

        console.log('Submitting book data:', apiData);

        if (editingBook) {
            updateBookMutation.mutate({ id: editingBook._id, bookData: apiData });
        } else {
            createBookMutation.mutate(apiData);
        }
    };

    const handleCategorySubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Check for duplicate name before submitting
        if (!editingCategory) {
            const existingCategory = categories?.find(
                (cat: any) => cat.name.toLowerCase() === categoryForm.name.toLowerCase()
            );

            if (existingCategory) {
                alert('Une catégorie avec ce nom existe déjà. Veuillez en choisir un autre.');
                return;
            }
        }

        if (editingCategory) {
            updateCategoryMutation.mutate({ id: editingCategory._id, categoryData: categoryForm });
        } else {
            createCategoryMutation.mutate(categoryForm);
        }
    };


    const openBookModal = (book?: any) => {
        if (book) {
            setEditingBook(book);
            setBookForm({
                title: book.title || '',
                authors: book.authors || [''],
                isbn: book.isbn || '',
                publisher: book.publisherId?.name || book.publisher || '',
                year: book.year || '',
                pages: book.pages || '',
                category: book.categoryId?.name || book.category || '',
                faculty: book.facultyId?.name || book.faculty || '',
                department: book.departmentId?.name || book.department || '',
                description: book.description || '',
                quantityTotal: book.quantityTotal || 1,
                quantityAvailable: book.quantityAvailable || 1,
                location: book.location || '',
                keywords: book.keywords || [''],
                coverImageUrl: book.coverImageUrl || '',
                price: book.price || 0
            });
            // Handle cover image URL
            const coverImageUrl = book.coverImageUrl;
            setImagePreview(coverImageUrl ? resolveMediaUrl(coverImageUrl) : '');
        } else {
            setEditingBook(null);
            setBookForm({ title: '', authors: [''], isbn: '', publisher: '', year: '', pages: '', category: '', faculty: '', department: '', description: '', quantityTotal: 1, quantityAvailable: 1, location: '', keywords: [''], coverImageUrl: '', price: 0 });
            setImagePreview('');
        }
        setSelectedImageFile(null);
        setShowBookModal(true);
    };

    const openCategoryModal = (category?: any) => {
        if (category) {
            setEditingCategory(category);
            setCategoryForm({
                name: category.name || '',
                description: category.description || ''
            });
        } else {
            setEditingCategory(null);
            setCategoryForm({ name: '', description: '' });
        }
        setShowCategoryModal(true);
    };

    const openBookDetailModal = (book: any) => {
        console.log('Opening book detail for:', book);
        console.log('Category data:', book.categoryId, book.category);
        console.log('Publisher data:', book.publisherId, book.publisher);
        console.log('Pages data:', book.pages);
        console.log('Description data:', book.description);
        setSelectedBook(book);
        setShowBookDetailModal(true);
    };

    const handleDeleteConfirm = (type: 'deleteBook' | 'deleteCategory', id: string, title: string) => {
        setConfirmAction({ type, id, title });
        setShowConfirmModal(true);
    };

    // Image upload handlers
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Veuillez sélectionner un fichier image valide');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('La taille du fichier ne doit pas dépasser 5 Mo');
                return;
            }

            setSelectedImageFile(file);

            // Create preview URL
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageRemove = () => {
        setSelectedImageFile(null);
        setImagePreview('');
        setBookForm({ ...bookForm, coverImageUrl: '' });
    };


    const executeDelete = () => {
        if (!confirmAction) return;

        if (confirmAction.type === 'deleteBook') {
            deleteBookMutation.mutate(confirmAction.id);
        } else if (confirmAction.type === 'deleteCategory') {
            deleteCategoryMutation.mutate(confirmAction.id);
        }

        setShowConfirmModal(false);
        setConfirmAction(null);
    };

    // Helper functions
    const resetFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedPublisher('');
        setSelectedStatus('');
        setSortBy('title');
        setSortOrder('asc');
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedPublisher('');
        setSelectedStatus('');
        setSortBy('title');
        setSortOrder('asc');
        setCurrentPage(1);
        console.log('All filters cleared');
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handleFilterChange = (filterType: string, value: string) => {
        switch (filterType) {
            case 'category':
                setSelectedCategory(value);
                break;
            case 'publisher':
                setSelectedPublisher(value);
                break;
            case 'status':
                setSelectedStatus(value);
                break;
        }
        setCurrentPage(1);
        console.log('Filter changed:', { filterType, value, currentFilters: { selectedCategory, selectedPublisher, selectedStatus } });
    };

    const handleSortChange = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
        setCurrentPage(1);
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

    return (
        <div className="min-h-screen bg-dark-900 pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-heading font-bold text-dark-50 mb-2">
                            Gestion des livres et catégories
                        </h1>
                        <p className="text-dark-300">
                            Gérer tous les livres et catégories de la bibliothèque
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            variant="secondary"
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Retour au tableau de bord
                        </Button>
                    </div>
                </div>

                {/* View Mode Toggle */}
                <div className="glass-card p-6 mb-8">
                    <div className="flex items-center gap-4">
                        <h3 className="text-lg font-semibold text-dark-50">Mode d'affichage :</h3>
                        <div className="flex gap-2">
                            <Button
                                variant={viewMode === 'books' ? 'primary' : 'secondary'}
                                onClick={() => setViewMode('books')}
                                className="flex items-center gap-2"
                            >
                                <BookOpen className="w-4 h-4" />
                                Gestion des livres
                            </Button>
                            <Button
                                variant={viewMode === 'categories' ? 'primary' : 'secondary'}
                                onClick={() => setViewMode('categories')}
                                className="flex items-center gap-2"
                            >
                                <Tag className="w-4 h-4" />
                                Gestion des catégories
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Books Management */}
                {viewMode === 'books' && (
                    <>
                        {/* Search and Filters */}
                        <div className="glass-card p-6 mb-8">
                            {/* Header Section - Search & Actions */}
                            <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
                                {/* Search Bar */}
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Rechercher par titre, auteur, ISBN..."
                                            value={searchTerm}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            className="input-field pl-10"
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                        className={`flex items-center gap-2 ${(selectedCategory || selectedPublisher || selectedStatus)
                                            ? 'border-primary-500 bg-primary-500/10'
                                            : ''
                                            }`}
                                    >
                                        <Filter className="w-4 h-4" />
                                        {showAdvancedFilters ? 'Masquer les filtres' : 'Filtres avancés'}
                                        {(selectedCategory || selectedPublisher || selectedStatus) && (
                                            <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                                        )}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={clearFilters}
                                        className="flex items-center gap-2"
                                    >
                                        <X className="w-4 h-4" />
                                        Effacer les filtres
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={() => openBookModal()}
                                        className="flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Ajouter un livre
                                    </Button>
                                </div>
                            </div>

                            {/* Quick Status Filters */}
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className="text-sm font-medium text-dark-300">Filtres rapides :</span>
                                <div className="flex gap-2">
                                    <Button
                                        variant={selectedStatus === 'available' ? 'primary' : 'ghost'}
                                        size="sm"
                                        onClick={() => handleFilterChange('status', selectedStatus === 'available' ? '' : 'available')}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${selectedStatus === 'available'
                                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                            : 'text-dark-400 hover:text-green-400 hover:bg-green-500/10'
                                            }`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${selectedStatus === 'available' ? 'bg-green-400' : 'bg-green-500'
                                            }`}></div>
                                        Disponible
                                    </Button>
                                    <Button
                                        variant={selectedStatus === 'unavailable' ? 'primary' : 'ghost'}
                                        size="sm"
                                        onClick={() => handleFilterChange('status', selectedStatus === 'unavailable' ? '' : 'unavailable')}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${selectedStatus === 'unavailable'
                                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                            : 'text-dark-400 hover:text-red-400 hover:bg-red-500/10'
                                            }`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${selectedStatus === 'unavailable' ? 'bg-red-400' : 'bg-red-500'
                                            }`}></div>
                                        Épuisé
                                    </Button>
                                </div>
                            </div>

                            {/* Advanced Filters */}
                            {showAdvancedFilters && (
                                <div className="border-t border-dark-700 pt-4">
                                    {/* Active Filters Summary */}
                                    {(selectedCategory || selectedPublisher || selectedStatus) && (
                                        <div className="mb-4 p-4 bg-gradient-to-r from-primary-500/10 to-primary-600/10 border border-primary-500/30 rounded-xl shadow-lg">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2 bg-primary-500/20 rounded-lg">
                                                    <Filter className="w-4 h-4 text-primary-400" />
                                                </div>
                                                <div>
                                                    <span className="text-sm font-semibold text-primary-300">Filtres actifs</span>
                                                    <p className="text-xs text-primary-400">Filtres actuellement appliqués</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedCategory && (
                                                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-500/20 text-primary-300 text-sm rounded-full border border-primary-500/30">
                                                        <div className="w-1.5 h-1.5 bg-primary-400 rounded-full"></div>
                                                        Catégorie : <span className="font-medium">{getCategoryDisplayNameFromName(selectedCategory)}</span>
                                                    </span>
                                                )}
                                                {selectedPublisher && (
                                                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-500/20 text-primary-300 text-sm rounded-full border border-primary-500/30">
                                                        <div className="w-1.5 h-1.5 bg-primary-400 rounded-full"></div>
                                                        Éditeur : <span className="font-medium">{selectedPublisher}</span>
                                                    </span>
                                                )}
                                                {selectedStatus && (
                                                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-full border ${selectedStatus === 'available'
                                                        ? 'bg-green-500/20 text-green-300 border-green-500/30'
                                                        : 'bg-red-500/20 text-red-300 border-red-500/30'
                                                        }`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${selectedStatus === 'available' ? 'bg-green-400' : 'bg-red-400'
                                                            }`}></div>
                                                        Statut : <span className="font-medium">{selectedStatus === 'available' ? 'Disponible' : 'Épuisé'}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-dark-300 mb-2 flex items-center gap-2">
                                                Catégorie
                                                {selectedCategory && (
                                                    <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                                                )}
                                            </label>
                                            <select
                                                value={selectedCategory}
                                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                                className={`input-field transition-all duration-200 ${selectedCategory
                                                    ? 'border-primary-500 bg-primary-500/5 shadow-lg shadow-primary-500/10'
                                                    : 'hover:border-primary-400/50 focus:border-primary-500'
                                                    }`}
                                            >
                                                <option value="">Toutes les catégories</option>
                                                {categories?.map((category: any) => (
                                                    <option key={category._id} value={category.name}>
                                                        {getCategoryDisplayName(category)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-dark-300 mb-2 flex items-center gap-2">
                                                Éditeur
                                                {selectedPublisher && (
                                                    <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                                                )}
                                            </label>
                                            <select
                                                value={selectedPublisher}
                                                onChange={(e) => handleFilterChange('publisher', e.target.value)}
                                                className={`input-field transition-all duration-200 ${selectedPublisher
                                                    ? 'border-primary-500 bg-primary-500/5 shadow-lg shadow-primary-500/10'
                                                    : 'hover:border-primary-400/50 focus:border-primary-500'
                                                    }`}
                                            >
                                                <option value="">Tous les éditeurs</option>
                                                {publishers?.map((publisher: any) => (
                                                    <option key={publisher._id} value={publisher.name}>
                                                        {publisher.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-dark-300 mb-2 flex items-center gap-2">
                                                Statut
                                                {selectedStatus && (
                                                    <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                                                )}
                                            </label>
                                            <select
                                                value={selectedStatus}
                                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                                className={`input-field transition-all duration-200 ${selectedStatus
                                                    ? 'border-primary-500 bg-primary-500/5 shadow-lg shadow-primary-500/10'
                                                    : 'hover:border-primary-400/50 focus:border-primary-500'
                                                    }`}
                                            >
                                                <option value="">Tous les statuts</option>
                                                <option value="available">Disponible</option>
                                                <option value="unavailable">Épuisé</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                                Trier par
                                            </label>
                                            <div className="flex gap-2">
                                                <select
                                                    value={sortBy}
                                                    onChange={(e) => setSortBy(e.target.value)}
                                                    className="input-field flex-1"
                                                >
                                                    <option value="title">Titre</option>
                                                    <option value="year">Année de publication</option>
                                                    <option value="createdAt">Date d'ajout</option>
                                                    <option value="quantityAvailable">Quantité</option>
                                                </select>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                                    className={`px-3 transition-all duration-300 hover:scale-110 ${sortOrder === 'asc'
                                                        ? 'text-primary-400 hover:text-primary-300'
                                                        : 'text-dark-400 hover:text-primary-400'
                                                        }`}
                                                >
                                                    <span className={`transition-transform duration-300 ${sortOrder === 'asc' ? 'rotate-0' : 'rotate-180'
                                                        }`}>
                                                        ↑
                                                    </span>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-dark-700">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <label className="text-sm font-medium text-dark-300">
                                                    Afficher :
                                                </label>
                                                <select
                                                    value={itemsPerPage}
                                                    onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                                                    className="input-field w-24 transition-all duration-200 hover:border-primary-400/50 focus:border-primary-500"
                                                >
                                                    <option value={5}>5</option>
                                                    <option value={10}>10</option>
                                                    <option value={20}>20</option>
                                                    <option value={50}>50</option>
                                                    <option value={100}>100</option>
                                                    <option value={1000}>Tous</option>
                                                </select>
                                                <span className="text-dark-400 text-sm">livres/page</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                onClick={resetFilters}
                                                className="text-dark-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all duration-200 flex items-center gap-2"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                                Tout réinitialiser
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Books Table */}
                        <div className="glass-card p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-heading font-semibold text-dark-50">
                                        Liste des livres
                                    </h3>
                                    <div className="flex items-center gap-4 mt-1">
                                        <span className="text-dark-400 text-sm">
                                            Affiché : <span className="text-dark-300 font-medium">{books?.books?.length || 0}</span> / <span className="text-dark-300 font-medium">{(books as any)?.meta?.total || 0}</span> livres
                                        </span>
                                        {(books as any)?.meta?.totalPages && (books as any).meta.totalPages > 1 && (
                                            <span className="text-dark-400 text-sm">
                                                • Page <span className="text-dark-300 font-medium">{currentPage}</span> / <span className="text-dark-300 font-medium">{(books as any)?.meta?.totalPages || 1}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => queryClient.invalidateQueries({ queryKey: ['books-management'] })}
                                    className="text-dark-400 hover:text-dark-200"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </Button>
                            </div>

                            {isLoadingBooks ? (
                                <div className="text-center py-8">
                                    <LoadingSpinner size="lg" text="Chargement de la liste des livres..." />
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[1000px]">
                                        <thead>
                                            <tr className="border-b border-dark-700">
                                                <th className="text-left py-3 px-4 text-dark-300 font-medium">Détails du livre</th>
                                                <th className="text-left py-3 px-4 text-dark-300 font-medium">Auteur</th>
                                                <th className="text-left py-3 px-4 text-dark-300 font-medium">Catégorie</th>
                                                <th className="text-left py-3 px-4 text-dark-300 font-medium">Quantité</th>
                                                <th className="text-left py-3 px-4 text-dark-300 font-medium">Statut</th>
                                                <th className="text-left py-3 px-4 text-dark-300 font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {books?.books?.map((book: any) => (
                                                <tr key={book._id} className="border-b border-dark-800 hover:bg-dark-800/50">
                                                    <td className="py-4 px-4">
                                                        <div className="min-w-[250px]">
                                                            <p className="text-dark-50 font-medium line-clamp-1">{book.title}</p>
                                                            <p className="text-dark-400 text-sm">ISBN: {book.isbn}</p>
                                                            <p className="text-dark-500 text-xs">Année : {book.year || book.publicationYear || 'N/A'}</p>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <p className="text-dark-300 font-medium">
                                                            {Array.isArray(book.authors) ? book.authors.join(', ') : book.author || 'N/A'}
                                                        </p>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="space-y-1">
                                                            <span className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm">
                                                                {book.categoryId
                                                                    ? getCategoryDisplayName(book.categoryId)
                                                                    : getCategoryDisplayNameFromName(
                                                                          String(book.category?.name || book.category || ''),
                                                                      ) || 'N/A'}
                                                            </span>
                                                            <p className="text-dark-400 text-xs">
                                                                {book.publisherId?.name || book.publisher || 'N/A'}
                                                            </p>
                                                            <p className="text-dark-500 text-xs">
                                                                {book.facultyId?.name || book.faculty || 'N/A'} - {book.departmentId?.name || book.department || 'N/A'}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-dark-300 font-medium">
                                                                {book.quantityAvailable || book.availableQuantity}/{book.quantityTotal || book.quantity}
                                                            </span>
                                                            <div className="w-full bg-dark-700 rounded-full h-2">
                                                                <div
                                                                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                                                                    style={{ width: `${((book.quantityAvailable || book.availableQuantity) / (book.quantityTotal || book.quantity)) * 100}%` }}
                                                                ></div>
                                                            </div>
                                                            <p className="text-dark-400 text-xs">
                                                                {book.pages ? `${book.pages} pages` : 'N/A'}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`px-2 py-1 rounded-full text-xs ${(book.quantityAvailable || book.availableQuantity) > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                                    }`}>
                                                                    {(book.quantityAvailable || book.availableQuantity) > 0 ? 'Disponible' : 'Épuisé'}
                                                                </span>
                                                            </div>
                                                            <p className="text-dark-400 text-xs line-clamp-2">
                                                                {book.description || 'Aucune description'}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => openBookDetailModal(book)}
                                                                className="text-blue-400 hover:text-blue-300"
                                                                title="Voir les détails"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => openBookModal(book)}
                                                                className="text-green-400 hover:text-green-300"
                                                                title="Modifier le livre"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteConfirm('deleteBook', book._id, book.title)}
                                                                className="text-red-400 hover:text-red-300"
                                                                title="Supprimer le livre"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {books?.books?.length === 0 && (
                                        <div className="text-center py-8">
                                            <div className="text-4xl mb-4">📚</div>
                                            <p className="text-dark-400">Aucun livre trouvé</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Pagination */}
                            {books?.books && books.books.length > 0 && (
                                <div className="flex items-center justify-between mt-6">
                                    {/* Results Info */}
                                    <div className="text-dark-400 text-sm">
                                        Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, books?.books?.length || 0)} sur {books?.books?.length || 0} résultats
                                    </div>

                                    {/* Pagination Controls */}
                                    <div className="flex items-center gap-2">
                                        {/* First Page */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setCurrentPage(1)}
                                            disabled={currentPage === 1}
                                            className="px-3 py-2 text-dark-300 hover:text-dark-100 hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Début
                                        </Button>

                                        {/* Previous Page */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-2 text-dark-300 hover:text-dark-100 hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Précédent
                                        </Button>

                                        {/* Page Numbers */}
                                        {(() => {
                                            // For client-side filtering, we'll show all results on one page
                                            // since we're filtering after getting data from API
                                            const totalPages = 1; // Always 1 page for client-side filtering
                                            const pages = [];

                                            for (let i = 1; i <= totalPages; i++) {
                                                pages.push(
                                                    <Button
                                                        key={i}
                                                        variant={i === currentPage ? "primary" : "ghost"}
                                                        size="sm"
                                                        onClick={() => setCurrentPage(i)}
                                                        className={`w-10 h-10 rounded-full ${i === currentPage
                                                            ? 'bg-primary-500 text-white hover:bg-primary-600'
                                                            : 'text-dark-300 hover:text-dark-100 hover:bg-dark-700'
                                                            }`}
                                                    >
                                                        {i}
                                                    </Button>
                                                );
                                            }

                                            return pages;
                                        })()}

                                        {/* Next Page */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => Math.min(1, prev + 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-2 text-dark-300 hover:text-dark-100 hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Suivant
                                        </Button>

                                        {/* Last Page */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setCurrentPage(1)}
                                            disabled={currentPage === 1}
                                            className="px-3 py-2 text-dark-300 hover:text-dark-100 hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Fin
                                        </Button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </>
                )}

                {/* Categories Management */}
                {viewMode === 'categories' && (
                    <>
                        <div className="glass-card p-6 mb-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-dark-50">Gestion des catégories</h3>
                                <Button
                                    variant="primary"
                                    onClick={() => openCategoryModal()}
                                    className="flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Ajouter une catégorie
                                </Button>
                            </div>
                        </div>

                        <div className="glass-card p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-heading font-semibold text-dark-50">
                                    Liste des catégories ({categories?.length || 0})
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-dark-400 text-sm">
                                        Affichage de toutes les {categories?.length || 0} catégories
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => queryClient.invalidateQueries({ queryKey: ['categories-management'] })}
                                        className="text-dark-400 hover:text-dark-200"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {isLoadingCategories ? (
                                <div className="text-center py-8">
                                    <LoadingSpinner size="lg" text="Chargement de la liste des catégories..." />
                                </div>
                            ) : categoriesError ? (
                                <div className="text-center py-8">
                                    <div className="text-red-400 mb-2">Erreur de chargement des catégories</div>
                                    <div className="text-dark-400 text-sm">{categoriesError.message}</div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {(() => {
                                        console.log('Rendering categories:', categories);
                                        return null;
                                    })()}
                                    {categories?.map((category: any) => (
                                        <div key={category._id} className="bg-dark-800 rounded-lg p-4 hover:bg-dark-700 transition-colors">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h4 className="text-dark-50 font-medium mb-1">{getCategoryDisplayName(category)}</h4>
                                                    <p className="text-dark-400 text-sm">{category.description}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openCategoryModal(category)}
                                                        className="text-blue-400 hover:text-blue-300"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteConfirm('deleteCategory', category._id, category.name)}
                                                        className="text-red-400 hover:text-red-300"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {categories?.length === 0 && (
                                        <div className="col-span-full text-center py-8">
                                            <div className="text-4xl mb-4">🏷️</div>
                                            <p className="text-dark-400">Aucune catégorie</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Book Bottom Sheet Modal */}
                {showBookModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            className="bg-dark-800 rounded-t-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-dark-800 border-b border-dark-700 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-heading font-semibold text-dark-50">
                                            {editingBook ? 'Modifier le livre' : 'Ajouter un livre'}
                                        </h3>
                                        <p className="text-dark-400 text-sm mt-1">
                                            {editingBook ? 'Mettre à jour les informations du livre' : 'Ajouter un nouveau livre à la bibliothèque'}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowBookModal(false)}
                                        className="text-dark-400 hover:text-dark-200"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Form Content */}
                            <form onSubmit={handleBookSubmit} className="p-6 space-y-8">
                                {/* Basic Information Section */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 pb-3 border-b border-dark-700">
                                        <div className="p-2 bg-primary-500/20 rounded-lg">
                                            <BookOpen className="w-5 h-5 text-primary-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold text-dark-50">Informations de base</h4>
                                            <p className="text-dark-400 text-sm">Informations principales sur le livre</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="lg:col-span-2">
                                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                                Titre du livre *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={bookForm.title}
                                                onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                                                className={`input-field ${!bookForm.title ? 'border-red-500 bg-red-500/5' : ''}`}
                                                placeholder="Saisir le titre du livre"
                                            />
                                            {!bookForm.title && (
                                                <p className="text-red-400 text-sm mt-1">Veuillez saisir le titre du livre</p>
                                            )}
                                        </div>

                                        <div className="lg:col-span-2">
                                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                                Auteur *
                                            </label>
                                            <div className="space-y-2">
                                                {bookForm.authors.map((author, index) => (
                                                    <div key={index} className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={author}
                                                            onChange={(e) => {
                                                                const newAuthors = [...bookForm.authors];
                                                                newAuthors[index] = e.target.value;
                                                                setBookForm({ ...bookForm, authors: newAuthors });
                                                            }}
                                                            className={`input-field flex-1 ${!author ? 'border-red-500 bg-red-500/5' : ''}`}
                                                            placeholder="Saisir le nom de l'auteur"
                                                        />
                                                        {bookForm.authors.length > 1 && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    const newAuthors = bookForm.authors.filter((_, i) => i !== index);
                                                                    setBookForm({ ...bookForm, authors: newAuthors });
                                                                }}
                                                                className="text-red-400 hover:text-red-300"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setBookForm({ ...bookForm, authors: [...bookForm.authors, ''] })}
                                                    className="text-primary-400 hover:text-primary-300"
                                                >
                                                    <Plus className="w-4 h-4 mr-1" />
                                                    Ajouter un auteur
                                                </Button>
                                                {bookForm.authors.some(author => !author.trim()) && (
                                                    <p className="text-red-400 text-sm">Veuillez saisir le nom de l'auteur</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                                Éditeur *
                                            </label>
                                            <input
                                                type="text"
                                                value={bookForm.publisher}
                                                onChange={(e) => setBookForm({ ...bookForm, publisher: e.target.value })}
                                                className={`input-field ${!bookForm.publisher || bookForm.publisher.trim() === '' ? 'border-red-500 bg-red-500/5' : ''}`}
                                                placeholder="Sélectionner ou saisir le nom de l'éditeur"
                                                list="publisher-list"
                                                required
                                            />
                                            <datalist id="publisher-list">
                                                {publishers?.map((publisher: any) => (
                                                    <option key={publisher._id} value={publisher.name}>
                                                        {publisher.name}
                                                    </option>
                                                ))}
                                            </datalist>
                                            {(!bookForm.publisher || bookForm.publisher.trim() === '') && (
                                                <p className="text-red-400 text-sm mt-1">Veuillez entrer le nom de l'éditeur</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                                Catégorie *
                                            </label>
                                            <select
                                                value={bookForm.category}
                                                onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                                                className={`input-field ${!bookForm.category ? 'border-red-500 bg-red-500/5' : ''}`}
                                                required
                                            >
                                                <option value="">Sélectionner une catégorie</option>
                                                {categories?.map((category: any) => (
                                                    <option key={category._id} value={category.name}>
                                                        {getCategoryDisplayName(category)}
                                                    </option>
                                                ))}
                                            </select>
                                            {!bookForm.category && (
                                                <p className="text-red-400 text-sm mt-1">Veuillez sélectionner une catégorie</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                                Faculté *
                                            </label>
                                            <input
                                                type="text"
                                                value={bookForm.faculty}
                                                onChange={(e) => {
                                                    setBookForm({ ...bookForm, faculty: e.target.value, department: '' });
                                                }}
                                                className={`input-field ${!bookForm.faculty || bookForm.faculty.trim() === '' ? 'border-red-500 bg-red-500/5' : ''}`}
                                                placeholder="Sélectionnez ou entrez le nom de la faculté"
                                                list="faculty-list"
                                                required
                                            />
                                            <datalist id="faculty-list">
                                                {faculties?.map((faculty: any) => (
                                                    <option key={faculty._id} value={faculty.name}>
                                                        {faculty.name}
                                                    </option>
                                                ))}
                                            </datalist>
                                            {(!bookForm.faculty || bookForm.faculty.trim() === '') && (
                                                <p className="text-red-400 text-sm mt-1">Veuillez entrer le nom de la faculté</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                                Département *
                                            </label>
                                            <input
                                                type="text"
                                                value={bookForm.department}
                                                onChange={(e) => setBookForm({ ...bookForm, department: e.target.value })}
                                                className={`input-field ${!bookForm.department || bookForm.department.trim() === '' ? 'border-red-500 bg-red-500/5' : ''}`}
                                                placeholder="Sélectionnez ou entrez le nom du département"
                                                list="department-list"
                                                required
                                                disabled={!bookForm.faculty}
                                            />
                                            <datalist id="department-list">
                                                {departments?.map((department: any) => (
                                                    <option key={department._id} value={department.name}>
                                                        {department.name}
                                                    </option>
                                                ))}
                                            </datalist>
                                            {(!bookForm.department || bookForm.department.trim() === '') && (
                                                <p className="text-red-400 text-sm mt-1">Veuillez entrer le nom du département</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                                Année de publication
                                            </label>
                                            <input
                                                type="number"
                                                value={bookForm.year}
                                                onChange={(e) => setBookForm({ ...bookForm, year: e.target.value })}
                                                className="input-field"
                                                placeholder="Entrez l'année de publication"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                                Nombre de pages
                                            </label>
                                            <input
                                                type="number"
                                                value={bookForm.pages}
                                                onChange={(e) => setBookForm({ ...bookForm, pages: e.target.value })}
                                                className="input-field"
                                                placeholder="Entrez le nombre de pages"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Inventory Section */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 pb-3 border-b border-dark-700">
                                        <div className="p-2 bg-green-500/20 rounded-lg">
                                            <Hash className="w-5 h-5 text-green-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold text-dark-50">Gestion de l'inventaire</h4>
                                            <p className="text-dark-400 text-sm">Quantité et emplacement de stockage</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                                Quantité totale *
                                            </label>
                                            <input
                                                type="number"
                                                required
                                                min="1"
                                                value={bookForm.quantityTotal}
                                                onChange={(e) => setBookForm({ ...bookForm, quantityTotal: parseInt(e.target.value) || 1 })}
                                                className={`input-field ${!bookForm.quantityTotal || bookForm.quantityTotal < 1 ? 'border-red-500 bg-red-500/5' : ''}`}
                                                placeholder="Entrez la quantité totale"
                                            />
                                            {(!bookForm.quantityTotal || bookForm.quantityTotal < 1) && (
                                                <p className="text-red-400 text-sm mt-1">Veuillez entrer une quantité valide (≥ 1)</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                                Quantité disponible *
                                            </label>
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                max={bookForm.quantityTotal}
                                                value={bookForm.quantityAvailable}
                                                onChange={(e) => setBookForm({ ...bookForm, quantityAvailable: parseInt(e.target.value) || 0 })}
                                                className={`input-field ${bookForm.quantityAvailable < 0 || bookForm.quantityAvailable > bookForm.quantityTotal ? 'border-red-500 bg-red-500/5' : ''}`}
                                                placeholder="Entrez la quantité disponible"
                                            />
                                            {(bookForm.quantityAvailable < 0 || bookForm.quantityAvailable > bookForm.quantityTotal) && (
                                                <p className="text-red-400 text-sm mt-1">
                                                    La quantité disponible doit être comprise entre 0 et {bookForm.quantityTotal}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                                Emplacement de stockage
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={bookForm.location}
                                                    onChange={(e) => setBookForm({ ...bookForm, location: e.target.value })}
                                                    className="input-field flex-1"
                                                    placeholder="Exemple : Étagère A1-001"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => {
                                                        const generateLocation = () => {
                                                            const shelves = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
                                                            const shelf = shelves[Math.floor(Math.random() * shelves.length)];
                                                            const row = Math.floor(Math.random() * 5) + 1;
                                                            const position = Math.floor(Math.random() * 999) + 1;
                                                            return `Étagère ${shelf}${row}-${position.toString().padStart(3, '0')}`;
                                                        };
                                                        const newLocation = generateLocation();
                                                        setBookForm({ ...bookForm, location: newLocation });
                                                    }}
                                                    className="flex items-center gap-1 px-3"
                                                    title="Générer automatiquement l'emplacement"
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                    Générer
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Information Section */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 pb-3 border-b border-dark-700">
                                        <div className="p-2 bg-blue-500/20 rounded-lg">
                                            <FileText className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold text-dark-50">Informations supplémentaires</h4>
                                            <p className="text-dark-400 text-sm">Description, mots-clés et images</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                                Prix *
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                required
                                                value={bookForm.price}
                                                onChange={(e) => setBookForm({ ...bookForm, price: parseFloat(e.target.value) || 0 })}
                                                className={`input-field ${!bookForm.price || bookForm.price <= 0 ? 'border-red-500 bg-red-500/5' : ''}`}
                                                placeholder="Entrez le prix du livre"
                                            />
                                            {(!bookForm.price || bookForm.price <= 0) && (
                                                <p className="text-red-400 text-sm mt-1">Veuillez entrer un prix valide pour le livre</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                                Image de couverture
                                            </label>

                                            {/* Image Preview */}
                                            {imagePreview && (
                                                <div className="mb-4">
                                                    <div className="relative inline-block">
                                                        <img
                                                            src={imagePreview}
                                                            alt="Preview"
                                                            className="w-32 h-40 object-cover rounded-lg border border-dark-600"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={handleImageRemove}
                                                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 p-0"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* File Upload */}
                                            <div className="space-y-3">
                                                <div>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageSelect}
                                                        className="hidden"
                                                        id="image-upload"
                                                    />
                                                    <label
                                                        htmlFor="image-upload"
                                                        className="flex items-center justify-center w-full h-12 border-2 border-dashed border-primary-500/50 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-primary-500/5 transition-all duration-200"
                                                    >
                                                        <div className="flex items-center gap-2 text-primary-400">
                                                            <Plus className="w-4 h-4" />
                                                            <span className="text-sm font-medium">
                                                                {selectedImageFile ? 'Sélectionner une autre image' : 'Sélectionner une image'}
                                                            </span>
                                                        </div>
                                                    </label>
                                                </div>

                                                {/* URL Input as alternative */}
                                                <div>
                                                    <label className="block text-sm font-medium text-dark-400 mb-2">
                                                        Ou entrer l'URL de l'image
                                                    </label>
                                                    <input
                                                        type="url"
                                                        value={bookForm.coverImageUrl}
                                                        onChange={(e) => {
                                                            const v = e.target.value;
                                                            setBookForm({ ...bookForm, coverImageUrl: v });
                                                            if (v) {
                                                                setImagePreview(resolveMediaUrl(v));
                                                                setSelectedImageFile(null);
                                                            } else {
                                                                setImagePreview('');
                                                            }
                                                        }}
                                                        className="input-field"
                                                        placeholder="Entrez l'URL de couverture"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-dark-300 mb-2">
                                            Description
                                        </label>
                                        <div className="space-y-2">
                                            <textarea
                                                value={bookForm.description}
                                                onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                                                className="input-field"
                                                rows={3}
                                                placeholder="Entrez la description du livre ou laissez vide pour générer automatiquement"
                                            />
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => {
                                                    const generateDescription = () => {
                                                        const descriptions = [
                                                            'Ce livre fournit des connaissances fondamentales et avancées sur le sujet abordé.',
                                                            'Ouvrage de référence utile pour les étudiants et chercheurs dans ce domaine.',
                                                            'Le contenu est présenté de manière scientifique et accessible, adapté à un large public.',
                                                            'Ce livre comprend de nombreux exemples pratiques et des exercices d\'application.',
                                                            'Document rédigé sur la base d\'une expérience pratique et de recherches approfondies.',
                                                            'Contexte actualisé selon les tendances modernes et adapté à l\'ère numérique.',
                                                            'Ce livre convient à l\'auto-apprentissage et comme référence professionnelle.',
                                                            'Le document est illustré avec de nombreuses images et des schémas détaillés.'
                                                        ];
                                                        return descriptions[Math.floor(Math.random() * descriptions.length)];
                                                    };
                                                    const newDescription = generateDescription();
                                                    setBookForm({ ...bookForm, description: newDescription });
                                                }}
                                                className="flex items-center gap-1"
                                                title="Générer automatiquement une description"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                                Générer une description
                                            </Button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-dark-300 mb-2">
                                            Mots-clés
                                        </label>
                                        <div className="space-y-2">
                                            {bookForm.keywords.map((keyword, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={keyword}
                                                        onChange={(e) => {
                                                            const newKeywords = [...bookForm.keywords];
                                                            newKeywords[index] = e.target.value;
                                                            setBookForm({ ...bookForm, keywords: newKeywords });
                                                        }}
                                                        className="input-field flex-1"
                                                        placeholder="Entrez un mot-clé"
                                                    />
                                                    {bookForm.keywords.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                const newKeywords = bookForm.keywords.filter((_, i) => i !== index);
                                                                setBookForm({ ...bookForm, keywords: newKeywords });
                                                            }}
                                                            className="text-red-400 hover:text-red-300"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setBookForm({ ...bookForm, keywords: [...bookForm.keywords, ''] })}
                                                    className="text-primary-400 hover:text-primary-300"
                                                >
                                                    <Plus className="w-4 h-4 mr-1" />
                                                    Ajouter un mot-clé
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => {
                                                        const generateKeywords = () => {
                                                            const commonKeywords = [
                                                                'livre', 'étude', 'recherche', 'référence', 'manuel',
                                                                'ingénierie', 'technologie', 'affaires', 'gestion', 'marketing',
                                                                'finance', 'comptabilité', 'droit', 'médecine', 'science',
                                                                'histoire', 'littérature', 'art', 'sport', 'tourisme'
                                                            ];
                                                            const numKeywords = Math.floor(Math.random() * 3) + 2;
                                                            const selectedKeywords: string[] = [];
                                                            for (let i = 0; i < numKeywords; i++) {
                                                                const randomKeyword = commonKeywords[Math.floor(Math.random() * commonKeywords.length)];
                                                                if (!selectedKeywords.includes(randomKeyword)) {
                                                                    selectedKeywords.push(randomKeyword);
                                                                }
                                                            }
                                                            return selectedKeywords;
                                                        };
                                                        const newKeywords = generateKeywords();
                                                        setBookForm({ ...bookForm, keywords: newKeywords });
                                                    }}
                                                    className="flex items-center gap-1"
                                                    title="Générer automatiquement des mots-clés"
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                    Générer
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="sticky bottom-0 bg-dark-800 border-t border-dark-700 p-6 -mx-6 -mb-6">
                                    <div className="flex items-center justify-end gap-3">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => setShowBookModal(false)}
                                        >
                                            Annuler
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            disabled={createBookMutation.isPending || updateBookMutation.isPending || isUploadingImage}
                                        >
                                            {createBookMutation.isPending || updateBookMutation.isPending || isUploadingImage ? (
                                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <Save className="w-4 h-4 mr-2" />
                                            )}
                                            {isUploadingImage ? 'Téléchargement de l\'image...' : editingBook ? 'Mettre à jour' : 'Ajouter le livre'}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}


                {/* Category Bottom Sheet Modal */}
                {showCategoryModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            className="bg-dark-800 rounded-t-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-dark-800 border-b border-dark-700 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-heading font-semibold text-dark-50">
                                            {editingCategory ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
                                        </h3>
                                        <p className="text-dark-400 text-sm mt-1">
                                            {editingCategory ? 'Mettre à jour les informations de la catégorie' : 'Créer une nouvelle catégorie pour classer les livres'}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowCategoryModal(false)}
                                        className="text-dark-400 hover:text-dark-200"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Form Content */}
                            <form onSubmit={handleCategorySubmit} className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-dark-300 mb-2">
                                        Nom de la catégorie *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={categoryForm.name}
                                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                        className="input-field"
                                        placeholder="Entrez le nom de la catégorie"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-300 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={categoryForm.description}
                                        onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                                        className="input-field"
                                        rows={3}
                                        placeholder="Entrez la description de la catégorie"
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="sticky bottom-0 bg-dark-800 border-t border-dark-700 p-6 -mx-6 -mb-6">
                                    <div className="flex items-center justify-end gap-3">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => setShowCategoryModal(false)}
                                        >
                                            Annuler
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                                        >
                                            {createCategoryMutation.isPending || updateCategoryMutation.isPending ? (
                                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <Save className="w-4 h-4 mr-2" />
                                            )}
                                            {editingCategory ? 'Mettre à jour' : 'Ajouter la catégorie'}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Book Detail Bottom Sheet Modal */}
                {showBookDetailModal && selectedBook && (
                    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            className="bg-dark-800 rounded-t-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-dark-800 border-b border-dark-700 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-heading font-semibold text-dark-50">
                                            Détails du livre
                                        </h3>
                                        <p className="text-dark-400 text-sm mt-1">
                                            Voir les informations détaillées et les images du livre
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowBookDetailModal(false)}
                                        className="text-dark-400 hover:text-dark-200"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Book Cover */}
                                    <div className="lg:col-span-1">
                                        <div className="aspect-[3/4] bg-dark-700 rounded-lg overflow-hidden">
                                            {selectedBook.coverImageUrl ? (
                                                <img
                                                    src={resolveMediaUrl(selectedBook.coverImageUrl)}
                                                    referrerPolicy="no-referrer"
                                                    alt={selectedBook.title}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                    }}
                                                />
                                            ) : null}
                                            <div className={`w-full h-full flex items-center justify-center ${selectedBook.coverImageUrl ? 'hidden' : ''}`}>
                                                <div className="text-center">
                                                    <BookOpen className="w-16 h-16 text-dark-400 mx-auto mb-2" />
                                                    <p className="text-dark-400 text-sm">Aucune image de couverture</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Book Details */}
                                    <div className="lg:col-span-2 space-y-6">
                                        {/* Basic Info */}
                                        <div>
                                            <h4 className="text-2xl font-heading font-bold text-dark-50 mb-2">
                                                {selectedBook.title}
                                            </h4>
                                            <p className="text-dark-300 text-lg mb-1">
                                                {Array.isArray(selectedBook.authors) ? selectedBook.authors.join(', ') : selectedBook.author || 'N/A'}
                                            </p>
                                            <p className="text-dark-400 text-sm">ISBN: {selectedBook.isbn}</p>
                                        </div>

                                        {/* Category and Publisher */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-dark-400 text-sm">Catégorie</label>
                                                <p className="text-dark-300 font-medium">
                                                    {selectedBook.categoryId
                                                        ? getCategoryDisplayName(selectedBook.categoryId)
                                                        : getCategoryDisplayNameFromName(
                                                              String(selectedBook.category?.name || selectedBook.category || ''),
                                                          ) || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-dark-400 text-sm">Éditeur</label>
                                                <p className="text-dark-300 font-medium">
                                                    {selectedBook.publisherId?.name || selectedBook.publisher || 'N/A'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Faculty and Department */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-dark-400 text-sm">Faculté</label>
                                                <p className="text-dark-300 font-medium">
                                                    {selectedBook.facultyId?.name || selectedBook.faculty || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-dark-400 text-sm">Département</label>
                                                <p className="text-dark-300 font-medium">
                                                    {selectedBook.departmentId?.name || selectedBook.department || 'N/A'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Year and Pages */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-dark-400 text-sm">Année de publication</label>
                                                <p className="text-dark-300 font-medium">
                                                    {selectedBook.year || selectedBook.publicationYear || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-dark-400 text-sm">Nombre de pages</label>
                                                <p className="text-dark-300 font-medium">
                                                    {selectedBook.pages || 'N/A'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Quantity and Status */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-dark-400 text-sm">Quantité</label>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-dark-300 font-medium">
                                                        {selectedBook.quantityAvailable || selectedBook.availableQuantity}/{selectedBook.quantityTotal || selectedBook.quantity}
                                                    </span>
                                                    <span className="text-dark-400 text-sm">disponible(s)</span>
                                                </div>
                                                <div className="w-full bg-dark-700 rounded-full h-2 mt-1">
                                                    <div
                                                        className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${((selectedBook.quantityAvailable || selectedBook.availableQuantity) / (selectedBook.quantityTotal || selectedBook.quantity)) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-dark-400 text-sm">Statut</label>
                                                <div className="mt-1">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${(selectedBook.quantityAvailable || selectedBook.availableQuantity) > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                        }`}>
                                                        {(selectedBook.quantityAvailable || selectedBook.availableQuantity) > 0 ? 'Disponible' : 'Épuisé'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Location and Price */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-dark-400 text-sm">Emplacement de stockage</label>
                                                <p className="text-dark-300 font-medium">
                                                    {selectedBook.location || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-dark-400 text-sm">Prix</label>
                                                <p className="text-dark-300 font-medium">
                                                    {selectedBook.price?.toLocaleString() || 'N/A'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <label className="text-dark-400 text-sm">Description</label>
                                            <p className="text-dark-300 mt-1">
                                                {selectedBook.description || 'Aucune description'}
                                            </p>
                                        </div>

                                        {/* Keywords */}
                                        {selectedBook.keywords && selectedBook.keywords.length > 0 && (
                                            <div>
                                                <label className="text-dark-400 text-sm">Mots-clés</label>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {selectedBook.keywords.map((keyword: string, index: number) => (
                                                        <span key={index} className="px-2 py-1 bg-dark-700 text-dark-300 text-sm rounded">
                                                            {keyword}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="sticky bottom-0 bg-dark-800 border-t border-dark-700 p-6 -mx-6 -mb-6">
                                <div className="flex items-center justify-end gap-3">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setShowBookDetailModal(false)}
                                    >
                                        Fermer
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={() => {
                                            setShowBookDetailModal(false);
                                            openBookModal(selectedBook);
                                        }}
                                    >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Modifier
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Confirm Delete Bottom Sheet Modal */}
                {showConfirmModal && confirmAction && (
                    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            className="bg-dark-800 rounded-t-2xl w-full max-w-2xl max-h-[60vh] overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-dark-800 border-b border-dark-700 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-heading font-semibold text-dark-50">
                                            Confirmer la suppression
                                        </h3>
                                        <p className="text-dark-400 text-sm mt-1">
                                            Cette action est irréversible
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowConfirmModal(false)}
                                        className="text-dark-400 hover:text-dark-200"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Trash2 className="w-8 h-8 text-red-400" />
                                    </div>
                                    <h4 className="text-lg font-semibold text-dark-50 mb-2">
                                        Êtes-vous sûr de vouloir supprimer ?
                                    </h4>
                                    <p className="text-dark-300 mb-2">
                                        {confirmAction.type === 'deleteBook' ? 'Ce livre' : 'Cette catégorie'} sera supprimé(e) définitivement
                                    </p>
                                    <p className="text-dark-400 text-sm">
                                        <strong>{confirmAction.title}</strong>
                                    </p>
                                    <p className="text-red-400 text-sm mt-3">
                                        ⚠️ Cette action est irréversible !
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="sticky bottom-0 bg-dark-800 border-t border-dark-700 p-6 -mx-6 -mb-6">
                                <div className="flex items-center justify-end gap-3">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setShowConfirmModal(false)}
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={executeDelete}
                                        className="bg-red-500 hover:bg-red-600"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Supprimer
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookManagement;
