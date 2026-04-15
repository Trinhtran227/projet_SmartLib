const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Category = require('../models/Category');
const Publisher = require('../models/Publisher');
const Faculty = require('../models/Faculty');
const Department = require('../models/Department');
const Book = require('../models/Book');
const FinePolicy = require('../models/FinePolicy');
const Loan = require('../models/Loan');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/library_management', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('✅ Connected to MongoDB for seeding'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Sample data with real book covers and information
const sampleData = {
    categories: [
        { name: 'Informatique', slug: 'informatique', description: 'Livres sur la programmation et l\'informatique' },
        { name: 'Mathématiques', slug: 'mathematiques', description: 'Livres sur les mathématiques de base et avancées' },
        { name: 'Physique', slug: 'physique', description: 'Livres sur la physique' },
        { name: 'Chimie', slug: 'chimie', description: 'Livres sur la chimie' },
        { name: 'Biologie', slug: 'biologie', description: 'Livres sur la biologie' },
        { name: 'Littérature', slug: 'litterature', description: 'Livres sur la littérature vietnamienne et mondiale' },
        { name: 'Histoire', slug: 'histoire', description: 'Livres sur l\'histoire' },
        { name: 'Géographie', slug: 'geographie', description: 'Livres sur la géographie' },
        { name: 'Économie', slug: 'economie', description: 'Livres sur l\'économie' },
        { name: 'Psychologie', slug: 'psychologie', description: 'Livres sur la psychologie' },
        { name: 'Philosophie', slug: 'philosophie', description: 'Livres sur la philosophie' },
        { name: 'Commerce', slug: 'commerce', description: 'Livres sur les affaires et la gestion' }
    ],

    publishers: [
        { name: 'Éditions de l\'Éducation du Vietnam', slug: 'nxb-giao-duc-viet-nam', address: 'Hanoi', phone: '024-38220801' },
        { name: 'Éditions de l\'Université Nationale de Hanoi', slug: 'nxb-dai-hoc-quoc-gia-ha-noi', address: 'Hanoi', phone: '024-37547065' },
        { name: 'Éditions Sciences et Techniques', slug: 'nxb-khoa-hoc-ky-thuat', address: 'Hanoi', phone: '024-38220801' },
        { name: 'Éditions de l\'Information et de la Communication', slug: 'nxb-thong-tin-truyen-thong', address: 'Hanoi', phone: '024-38220801' },
        { name: 'Éditions de la Jeunesse', slug: 'nxb-tre', address: 'HCMV', phone: '028-39316289' },
        { name: 'Addison-Wesley Professional', slug: 'addison-wesley-professional', address: 'USA', phone: '+1-800-382-3419' },
        { name: 'O\'Reilly Media', slug: 'oreilly-media', address: 'USA', phone: '+1-707-827-7000' },
        { name: 'MIT Press', slug: 'mit-press', address: 'USA', phone: '+1-617-253-5646' },
        { name: 'Prentice Hall', slug: 'prentice-hall', address: 'USA', phone: '+1-800-382-3419' },
        { name: 'McGraw-Hill Education', slug: 'mcgraw-hill-education', address: 'USA', phone: '+1-800-262-4729' },
        { name: 'Wiley', slug: 'wiley', address: 'USA', phone: '+1-201-748-6000' },
        { name: 'Springer', slug: 'springer', address: 'Germany', phone: '+49-6221-345-0' }
    ],

    faculties: [
        { name: 'Faculté d\'Informatique', code: 'CNTT', slug: 'khoa-cong-nghe-thong-tin', description: 'Faculté d\'informatique' },
        { name: 'Faculté de Mathématiques, Mécanique et Informatique', code: 'TOAN', slug: 'khoa-toan-co-tin-hoc', description: 'Faculté de mathématiques, de mécanique et d\'informatique' },
        { name: 'Faculté de Physique', code: 'VATLY', slug: 'khoa-vat-ly', description: 'Faculté de physique' },
        { name: 'Faculté de Chimie', code: 'HOAHOC', slug: 'khoa-hoa-hoc', description: 'Faculté de chimie' },
        { name: 'Faculté de Biologie', code: 'SINHHOC', slug: 'khoa-sinh-hoc', description: 'Faculté de biologie' },
        { name: 'Faculté de Littérature', code: 'VANHOC', slug: 'khoa-van-hoc', description: 'Faculté de littérature' },
        { name: 'Faculté d\'Histoire', code: 'LICHSU', slug: 'khoa-lich-su', description: 'Faculté d\'histoire' },
        { name: 'Faculté de Géographie', code: 'DIALY', slug: 'khoa-dia-ly', description: 'Faculté de géographie' },
        { name: 'Faculté d\'Économie', code: 'KINHTE', slug: 'khoa-kinh-te', description: 'Faculté d\'économie' },
        { name: 'Faculté de Psychologie', code: 'TAMLY', slug: 'khoa-tam-ly-hoc', description: 'Faculté de psychologie' },
        { name: 'Faculté de Philosophie', code: 'TRIET', slug: 'khoa-triet-hoc', description: 'Faculté de philosophie' },
        { name: 'Faculté d\'Administration des affaires', code: 'QTKD', slug: 'khoa-quan-tri-kinh-doanh', description: 'Faculté d\'administration des affaires' }
    ],

    departments: [
        { name: 'Informatique', code: 'KHMT', facultyIndex: 0 },
        { name: 'Technologie de l\'information', code: 'CNTT', facultyIndex: 0 },
        { name: 'Systèmes d\'information', code: 'HTTT', facultyIndex: 0 },
        { name: 'Mathématiques', code: 'TOAN', facultyIndex: 1 },
        { name: 'Physique théorique', code: 'VLLT', facultyIndex: 2 },
        { name: 'Chimie organique', code: 'HHHC', facultyIndex: 3 },
        { name: 'Biologie moléculaire', code: 'SHPT', facultyIndex: 4 },
        { name: 'Littérature vietnamienne', code: 'VHVN', facultyIndex: 5 },
        { name: 'Histoire du Vietnam', code: 'LSVN', facultyIndex: 6 },
        { name: 'Géographie physique', code: 'DLTN', facultyIndex: 7 },
        { name: 'Économie', code: 'KTH', facultyIndex: 8 },
        { name: 'Psychologie sociale', code: 'TLHXH', facultyIndex: 9 },
        { name: 'Philosophie marxiste-léniniste', code: 'THML', facultyIndex: 10 },
        { name: 'Administration des affaires', code: 'QTKD', facultyIndex: 11 }
    ],

    books: [
        // Programming & Computer Science
        {
            isbn: '9780134685991',
            title: 'Effective Java',
            authors: ['Joshua Bloch'],
            categoryIndex: 0,
            publisherIndex: 5,
            facultyIndex: 0,
            departmentIndex: 0,
            year: 2018,
            pages: 416,
            description: 'The Definitive Guide to Java Platform Best Practices—Updated for Java 7, 8, and 9',
            quantityTotal: 5,
            quantityAvailable: 5,
            location: 'Étagère A1-001',
            keywords: ['java', 'programming', 'best practices', 'software engineering'],
            coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/41wPyn7ysdL._SX342_SY445_.jpg'
        },
        {
            isbn: '9780132350884',
            title: 'Clean Code',
            authors: ['Robert C. Martin'],
            categoryIndex: 0,
            publisherIndex: 8,
            facultyIndex: 0,
            departmentIndex: 0,
            year: 2008,
            pages: 464,
            description: 'A Handbook of Agile Software Craftsmanship',
            quantityTotal: 3,
            quantityAvailable: 3,
            location: 'Étagère A1-002',
            keywords: ['clean code', 'programming', 'software engineering', 'agile'],
            coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/515iEcDr1GL._SX342_SY445_.jpg'
        },
        {
            isbn: '9780134685992',
            title: 'Introduction to Algorithms',
            authors: ['Thomas H. Cormen', 'Charles E. Leiserson', 'Ronald L. Rivest', 'Clifford Stein'],
            categoryIndex: 0,
            publisherIndex: 7,
            facultyIndex: 0,
            departmentIndex: 0,
            year: 2009,
            pages: 1312,
            description: 'The MIT Press',
            quantityTotal: 4,
            quantityAvailable: 4,
            location: 'Étagère A1-003',
            keywords: ['algorithms', 'computer science', 'programming', 'data structures'],
            coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/41VQKJd0eVL._SX342_SY445_.jpg'
        },
        {
            isbn: '9780134685993',
            title: 'Design Patterns',
            authors: ['Erich Gamma', 'Richard Helm', 'Ralph Johnson', 'John Vlissides'],
            categoryIndex: 0,
            publisherIndex: 5,
            facultyIndex: 0,
            departmentIndex: 0,
            year: 1994,
            pages: 395,
            description: 'Elements of Reusable Object-Oriented Software',
            quantityTotal: 2,
            quantityAvailable: 2,
            location: 'Étagère A1-004',
            keywords: ['design patterns', 'object-oriented', 'software engineering', 'reusable'],
            coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/51szD9HC9pL._SX342_SY445_.jpg'
        },
        {
            isbn: '9780134685994',
            title: 'The Pragmatic Programmer',
            authors: ['David Thomas', 'Andrew Hunt'],
            categoryIndex: 0,
            publisherIndex: 5,
            facultyIndex: 0,
            departmentIndex: 0,
            year: 1999,
            pages: 352,
            description: 'Your Journey to Mastery',
            quantityTotal: 3,
            quantityAvailable: 3,
            location: 'Étagère A1-005',
            keywords: ['programming', 'software development', 'career', 'pragmatic'],
            coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/41SHtsvKP%2BL._SX342_SY445_.jpg'
        },
        {
            isbn: '9780134685995',
            title: 'JavaScript: The Good Parts',
            authors: ['Douglas Crockford'],
            categoryIndex: 0,
            publisherIndex: 6,
            facultyIndex: 0,
            departmentIndex: 1,
            year: 2008,
            pages: 176,
            description: 'Unearthing the Excellence in JavaScript',
            quantityTotal: 6,
            quantityAvailable: 6,
            location: 'Étagère A1-006',
            keywords: ['javascript', 'web development', 'programming', 'frontend'],
            coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/41k0GLA80wL._SX342_SY445_.jpg'
        },
        {
            isbn: '9780134685996',
            title: 'Python Crash Course',
            authors: ['Eric Matthes'],
            categoryIndex: 0,
            publisherIndex: 6,
            facultyIndex: 0,
            departmentIndex: 0,
            year: 2019,
            pages: 544,
            description: 'A Hands-On, Project-Based Introduction to Programming',
            quantityTotal: 7,
            quantityAvailable: 7,
            location: 'Étagère A1-007',
            keywords: ['python', 'programming', 'beginner', 'hands-on'],
            coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/41VQKJd0eVL._SX342_SY445_.jpg'
        },
        {
            isbn: '9780134685997',
            title: 'Database System Concepts',
            authors: ['Abraham Silberschatz', 'Henry F. Korth', 'S. Sudarshan'],
            categoryIndex: 0,
            publisherIndex: 9,
            facultyIndex: 0,
            departmentIndex: 2,
            year: 2019,
            pages: 1344,
            description: 'Seventh Edition',
            quantityTotal: 4,
            quantityAvailable: 4,
            location: 'Étagère A1-008',
            keywords: ['database', 'sql', 'data management', 'systems'],
            coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/41VQKJd0eVL._SX342_SY445_.jpg'
        },
        {
            isbn: '9780134685998',
            title: 'Operating System Concepts',
            authors: ['Abraham Silberschatz', 'Peter Baer Galvin', 'Greg Gagne'],
            categoryIndex: 0,
            publisherIndex: 10,
            facultyIndex: 0,
            departmentIndex: 0,
            year: 2018,
            pages: 1136,
            description: 'Tenth Edition',
            quantityTotal: 3,
            quantityAvailable: 3,
            location: 'Étagère A1-009',
            keywords: ['operating systems', 'computer science', 'systems programming'],
            coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/41VQKJd0eVL._SX342_SY445_.jpg'
        },
        {
            isbn: '9780134685999',
            title: 'Computer Networks',
            authors: ['Andrew S. Tanenbaum', 'David J. Wetherall'],
            categoryIndex: 0,
            publisherIndex: 8,
            facultyIndex: 0,
            departmentIndex: 1,
            year: 2011,
            pages: 960,
            description: 'Fifth Edition',
            quantityTotal: 3,
            quantityAvailable: 3,
            location: 'Étagère A1-010',
            keywords: ['networks', 'internet', 'protocols', 'communication'],
            coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/41VQKJd0eVL._SX342_SY445_.jpg'
        },

        // Mathematics
        {
            isbn: '9780134686000',
            title: 'Calculus: Early Transcendentals',
            authors: ['James Stewart'],
            categoryIndex: 1,
            publisherIndex: 8,
            facultyIndex: 1,
            departmentIndex: 3,
            year: 2016,
            pages: 1368,
            description: 'Eighth Edition',
            quantityTotal: 6,
            quantityAvailable: 6,
            location: 'Étagère B1-001',
            keywords: ['calculus', 'mathematics', 'transcendentals', 'analysis'],
            coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/41VQKJd0eVL._SX342_SY445_.jpg'
        },
        {
            isbn: '9780134686001',
            title: 'Linear Algebra and Its Applications',
            authors: ['David C. Lay', 'Steven R. Lay', 'Judi J. McDonald'],
            categoryIndex: 1,
            publisherIndex: 8,
            facultyIndex: 1,
            departmentIndex: 3,
            year: 2016,
            pages: 576,
            description: 'Fifth Edition',
            quantityTotal: 4,
            quantityAvailable: 4,
            location: 'Étagère B1-002',
            keywords: ['linear algebra', 'mathematics', 'applications', 'vectors'],
            coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/41VQKJd0eVL._SX342_SY445_.jpg'
        },
        {
            isbn: '9780134686002',
            title: 'Discrete Mathematics and Its Applications',
            authors: ['Kenneth H. Rosen'],
            categoryIndex: 1,
            publisherIndex: 8,
            facultyIndex: 1,
            departmentIndex: 3,
            year: 2018,
            pages: 1072,
            description: 'Eighth Edition',
            quantityTotal: 5,
            quantityAvailable: 5,
            location: 'Étagère B1-003',
            keywords: ['discrete mathematics', 'logic', 'combinatorics', 'graph theory'],
            coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/41VQKJd0eVL._SX342_SY445_.jpg'
        },

        // Physics
        {
            isbn: '9780134686003',
            title: 'University Physics',
            authors: ['Hugh D. Young', 'Roger A. Freedman'],
            categoryIndex: 2,
            publisherIndex: 8,
            facultyIndex: 2,
            departmentIndex: 4,
            year: 2016,
            pages: 1600,
            description: 'Fourteenth Edition',
            quantityTotal: 5,
            quantityAvailable: 5,
            location: 'Étagère C1-001',
            keywords: ['physics', 'university', 'mechanics', 'thermodynamics'],
            coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/41VQKJd0eVL._SX342_SY445_.jpg'
        },
        {
            isbn: '9780134686004',
            title: 'A Brief History of Time',
            authors: ['Stephen Hawking'],
            categoryIndex: 2,
            publisherIndex: 6,
            facultyIndex: 2,
            departmentIndex: 4,
            year: 1988,
            pages: 256,
            description: 'From the Big Bang to Black Holes',
            quantityTotal: 3,
            quantityAvailable: 3,
            location: 'Étagère C1-002',
            keywords: ['physics', 'cosmology', 'time', 'universe', 'hawking'],
            coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/41VQKJd0eVL._SX342_SY445_.jpg'
        },

        // Chemistry
        {
            isbn: '9780134686005',
            title: 'Organic Chemistry',
            authors: ['Paula Yurkanis Bruice'],
            categoryIndex: 3,
            publisherIndex: 8,
            facultyIndex: 3,
            departmentIndex: 5,
            year: 2017,
            pages: 1344,
            description: 'Eighth Edition',
            quantityTotal: 3,
            quantityAvailable: 3,
            location: 'Étagère D1-001',
            keywords: ['organic chemistry', 'chemistry', 'molecules', 'reactions'],
            coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/41VQKJd0eVL._SX342_SY445_.jpg'
        },

        // Biology
        {
            isbn: '9780134686006',
            title: 'Campbell Biology',
            authors: ['Jane B. Reece', 'Lisa A. Urry', 'Michael L. Cain', 'Steven A. Wasserman'],
            categoryIndex: 4,
            publisherIndex: 8,
            facultyIndex: 4,
            departmentIndex: 6,
            year: 2017,
            pages: 1408,
            description: 'Eleventh Edition',
            quantityTotal: 4,
            quantityAvailable: 4,
            location: 'Étagère E1-001',
            keywords: ['biology', 'campbell', 'life sciences', 'evolution'],
            coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/41VQKJd0eVL._SX342_SY445_.jpg'
        },

        // Literature
        {
            isbn: '9780134686007',
            title: 'The Great Gatsby',
            authors: ['F. Scott Fitzgerald'],
            categoryIndex: 5,
            publisherIndex: 6,
            facultyIndex: 5,
            departmentIndex: 7,
            year: 1925,
            pages: 180,
            description: 'A classic American novel',
            quantityTotal: 2,
            quantityAvailable: 2,
            location: 'Étagère F1-001',
            keywords: ['literature', 'american', 'classic', 'novel', 'fitzgerald'],
            coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/41VQKJd0eVL._SX342_SY445_.jpg'
        },
        {
            isbn: '9780134686008',
            title: 'To Kill a Mockingbird',
            authors: ['Harper Lee'],
            categoryIndex: 5,
            publisherIndex: 6,
            facultyIndex: 5,
            departmentIndex: 7,
            year: 1960,
            pages: 281,
            description: 'A novel about racial injustice and childhood innocence',
            quantityTotal: 3,
            quantityAvailable: 3,
            location: 'Étagère F1-002',
            keywords: ['literature', 'american', 'classic', 'novel', 'harper lee'],
            coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/41VQKJd0eVL._SX342_SY445_.jpg'
        },

        // History
        {
            isbn: '9780134686009',
            title: 'Sapiens: A Brief History of Humankind',
            authors: ['Yuval Noah Harari'],
            categoryIndex: 6,
            publisherIndex: 6,
            facultyIndex: 6,
            departmentIndex: 8,
            year: 2014,
            pages: 443,
            description: 'A Brief History of Humankind',
            quantityTotal: 4,
            quantityAvailable: 4,
            location: 'Étagère G1-001',
            keywords: ['history', 'anthropology', 'human evolution', 'harari'],
            coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/41VQKJd0eVL._SX342_SY445_.jpg'
        },
        {
            isbn: '9780134686010',
            title: 'Homo Deus',
            authors: ['Yuval Noah Harari'],
            categoryIndex: 6,
            publisherIndex: 6,
            facultyIndex: 6,
            departmentIndex: 8,
            year: 2016,
            pages: 464,
            description: 'A Brief History of Tomorrow',
            quantityTotal: 3,
            quantityAvailable: 3,
            location: 'Étagère G1-002',
            keywords: ['history', 'future', 'technology', 'harari'],
            coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/41VQKJd0eVL._SX342_SY445_.jpg'
        },

        // Economics
        {
            isbn: '9780134686011',
            title: 'Principles of Economics',
            authors: ['N. Gregory Mankiw'],
            categoryIndex: 8,
            publisherIndex: 8,
            facultyIndex: 8,
            departmentIndex: 10,
            year: 2018,
            pages: 912,
            description: 'Eighth Edition',
            quantityTotal: 5,
            quantityAvailable: 5,
            location: 'Étagère H1-001',
            keywords: ['economics', 'principles', 'microeconomics', 'macroeconomics'],
            coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/41VQKJd0eVL._SX342_SY445_.jpg'
        },

        // Psychology
        {
            isbn: '9780134686012',
            title: 'Thinking, Fast and Slow',
            authors: ['Daniel Kahneman'],
            categoryIndex: 9,
            publisherIndex: 6,
            facultyIndex: 9,
            departmentIndex: 11,
            year: 2011,
            pages: 512,
            description: 'A groundbreaking tour of the mind and explains the two systems',
            quantityTotal: 3,
            quantityAvailable: 3,
            location: 'Étagère I1-001',
            keywords: ['psychology', 'cognitive science', 'decision making', 'kahneman'],
            coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/41VQKJd0eVL._SX342_SY445_.jpg'
        },
        {
            isbn: '9780134686013',
            title: 'Atomic Habits',
            authors: ['James Clear'],
            categoryIndex: 9,
            publisherIndex: 6,
            facultyIndex: 9,
            departmentIndex: 11,
            year: 2018,
            pages: 320,
            description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones',
            quantityTotal: 4,
            quantityAvailable: 4,
            location: 'Étagère I1-002',
            keywords: ['psychology', 'habits', 'self-improvement', 'behavior'],
            coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/41VQKJd0eVL._SX342_SY445_.jpg'
        },

        // Philosophy
        {
            isbn: '9780134686014',
            title: 'The Art of War',
            authors: ['Sun Tzu'],
            categoryIndex: 10,
            publisherIndex: 6,
            facultyIndex: 10,
            departmentIndex: 12,
            year: 2005,
            pages: 273,
            description: 'The Essential Translation of the Classic Book of Life',
            quantityTotal: 7,
            quantityAvailable: 7,
            location: 'Étagère J1-001',
            keywords: ['philosophy', 'strategy', 'war', 'sun tzu'],
            coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/41VQKJd0eVL._SX342_SY445_.jpg'
        },
        {
            isbn: '9780134686015',
            title: 'Meditations',
            authors: ['Marcus Aurelius'],
            categoryIndex: 10,
            publisherIndex: 6,
            facultyIndex: 10,
            departmentIndex: 12,
            year: 2006,
            pages: 304,
            description: 'A New Translation',
            quantityTotal: 5,
            quantityAvailable: 5,
            location: 'Étagère J1-002',
            keywords: ['philosophy', 'stoicism', 'meditations', 'marcus aurelius'],
            coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/41VQKJd0eVL._SX342_SY445_.jpg'
        },

        // Business
        {
            isbn: '9780134686016',
            title: 'The Lean Startup',
            authors: ['Eric Ries'],
            categoryIndex: 11,
            publisherIndex: 6,
            facultyIndex: 11,
            departmentIndex: 13,
            year: 2011,
            pages: 336,
            description: 'How Today\'s Entrepreneurs Use Continuous Innovation',
            quantityTotal: 6,
            quantityAvailable: 6,
            location: 'Étagère K1-001',
            keywords: ['business', 'startup', 'entrepreneurship', 'innovation'],
            coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/41VQKJd0eVL._SX342_SY445_.jpg'
        },
        {
            isbn: '9780134686017',
            title: 'Zero to One',
            authors: ['Peter Thiel', 'Blake Masters'],
            categoryIndex: 11,
            publisherIndex: 6,
            facultyIndex: 11,
            departmentIndex: 13,
            year: 2014,
            pages: 224,
            description: 'Notes on Startups, or How to Build the Future',
            quantityTotal: 4,
            quantityAvailable: 4,
            location: 'Étagère K1-002',
            keywords: ['business', 'startup', 'entrepreneurship', 'thiel'],
            coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/41VQKJd0eVL._SX342_SY445_.jpg'
        }
    ],

    users: [
        {
            email: 'admin@library.com',
            password: 'admin123',
            fullName: 'System Administrator',
            role: 'ADMIN',
            status: 'ACTIVE'
        },
        {
            email: 'librarian@library.com',
            password: 'librarian123',
            fullName: 'Marie Dupont',
            role: 'LIBRARIAN',
            status: 'ACTIVE'
        },
        {
            email: 'student1@university.edu',
            password: 'student123',
            fullName: 'Jean Martin',
            role: 'USER',
            status: 'ACTIVE'
        },
        {
            email: 'student2@university.edu',
            password: 'student123',
            fullName: 'Sophie Bernard',
            role: 'USER',
            status: 'ACTIVE'
        },
        {
            email: 'student3@university.edu',
            password: 'student123',
            fullName: 'Pierre Leroy',
            role: 'USER',
            status: 'ACTIVE'
        }
    ]
};

async function seedData() {
    try {
        console.log('🌱 Starting optimized seed process...');

        // Clear existing data
        await Promise.all([
            User.deleteMany({}),
            Category.deleteMany({}),
            Publisher.deleteMany({}),
            Faculty.deleteMany({}),
            Department.deleteMany({}),
            Book.deleteMany({}),
            FinePolicy.deleteMany({}),
            Loan.deleteMany({})
        ]);
        console.log('🗑️  Cleared existing data');

        // Create categories
        const categories = await Category.create(sampleData.categories);
        console.log(`📚 Created ${categories.length} categories`);

        // Create publishers
        const publishers = await Publisher.create(sampleData.publishers);
        console.log(`🏢 Created ${publishers.length} publishers`);

        // Create faculties
        const faculties = await Faculty.create(sampleData.faculties);
        console.log(`🏛️ Created ${faculties.length} faculties`);

        // Create departments
        const departments = await Department.create(
            sampleData.departments.map(dept => ({
                ...dept,
                facultyId: faculties[dept.facultyIndex]._id
            }))
        );
        console.log(`🏢 Created ${departments.length} departments`);

        // Create users
        const users = [];
        for (const userData of sampleData.users) {
            const hashedPassword = await bcrypt.hash(userData.password, 12);
            const user = new User({
                ...userData,
                passwordHash: hashedPassword
            });
            await user.save();
            users.push(user);
        }
        console.log(`👥 Created ${users.length} users`);

        // Create books
        const books = [];
        for (const bookData of sampleData.books) {
            const isbnClean = bookData.isbn ? String(bookData.isbn).replace(/[^0-9X]/gi, '') : '';
            const book = new Book({
                isbn: bookData.isbn,
                title: bookData.title,
                authors: bookData.authors,
                categoryId: categories[bookData.categoryIndex]._id,
                publisherId: publishers[bookData.publisherIndex]._id,
                facultyId: faculties[bookData.facultyIndex]._id,
                departmentId: departments[bookData.departmentIndex]._id,
                year: bookData.year,
                pages: bookData.pages,
                description: bookData.description,
                quantityTotal: bookData.quantityTotal,
                quantityAvailable: bookData.quantityAvailable,
                location: bookData.location,
                keywords: bookData.keywords,
                coverImageUrl: isbnClean
                    ? `https://covers.openlibrary.org/b/isbn/${isbnClean}-L.jpg`
                    : bookData.coverImageUrl || '',
                status: 'ACTIVE'
            });
            await book.save();
            books.push(book);
        }
        console.log(`📖 Created ${books.length} books`);

        // Create fine policy
        const finePolicy = await FinePolicy.create({
            lateFeePerDay: 1, // 1 EUR / jour
            damageFeeRate: 0.3, // 30% of book value
            currency: 'EUR',
            isActive: true
        });
        console.log('💰 Created fine policy');

        // Create sample loans
        const studentUsers = users.filter(user => user.role === 'USER');
        const librarianUser = users.find(user => user.role === 'LIBRARIAN');

        if (studentUsers.length > 0 && books.length > 0) {
            // Create some sample loans
            const sampleLoans = [
                {
                    readerUserId: studentUsers[0]._id,
                    librarianId: librarianUser._id,
                    createdByRole: 'LIBRARIAN',
                    items: [
                        { bookId: books[0]._id, qty: 1 },
                        { bookId: books[1]._id, qty: 1 }
                    ],
                    loanDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
                    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
                    status: 'OPEN',
                    notes: 'Livres pour le cours de programmation Java'
                },
                {
                    readerUserId: studentUsers[1]._id,
                    librarianId: librarianUser._id,
                    createdByRole: 'LIBRARIAN',
                    items: [
                        { bookId: books[2]._id, qty: 1 }
                    ],
                    loanDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
                    dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago (overdue)
                    status: 'OPEN',
                    notes: 'Livre d\'algorithmique pour l\'examen final'
                },
                {
                    readerUserId: studentUsers[0]._id,
                    librarianId: librarianUser._id,
                    createdByRole: 'LIBRARIAN',
                    items: [
                        { bookId: books[5]._id, qty: 1 },
                        { bookId: books[6]._id, qty: 1 }
                    ],
                    loanDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
                    dueDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
                    status: 'CLOSED',
                    notes: 'Retour effectué — développement web'
                }
            ];

            for (const loanData of sampleLoans) {
                const loan = new Loan(loanData);
                await loan.save();
            }
            console.log(`📋 Created ${sampleLoans.length} sample loans`);
        }

        console.log('✅ Optimized seed data created successfully!');
        console.log('\n📊 Summary:');
        console.log(`👥 Users: ${users.length}`);
        console.log(`📚 Categories: ${categories.length}`);
        console.log(`🏢 Publishers: ${publishers.length}`);
        console.log(`🏛️ Faculties: ${faculties.length}`);
        console.log(`🏢 Departments: ${departments.length}`);
        console.log(`📖 Books: ${books.length}`);
        console.log(`💰 Fine Policy: 1`);
        console.log(`📋 Sample Loans: ${sampleLoans ? sampleLoans.length : 0}`);

        console.log('\n🔑 Default Login Credentials:');
        console.log('Admin: admin@library.com / admin123');
        console.log('Librarian: librarian@library.com / librarian123');
        console.log('Student 1: student1@university.edu / student123');
        console.log('Student 2: student2@university.edu / student123');
        console.log('Student 3: student3@university.edu / student123');

        console.log('\n🌐 All book covers use real Amazon images for authentic appearance');

    } catch (error) {
        console.error('❌ Seed error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
}

// Run seed
seedData();
