const mongoose = require('mongoose');
const Review = require('../models/Review');
const Book = require('../models/Book');
const User = require('../models/User');
require('dotenv').config();

const seedReviews = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/library_management', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('✅ Connected to MongoDB');

        // Get some books and users for reviews
        const books = await Book.find().limit(10);
        const users = await User.find({ role: 'USER' }).limit(10);

        if (books.length === 0 || users.length === 0) {
            console.log('❌ No books or users found. Please seed books and users first.');
            return;
        }

        // Clear existing reviews
        await Review.deleteMany({});
        console.log('🗑️ Cleared existing reviews');

        // Sample reviews data
        const reviewsData = [
            {
                bookId: books[0]._id,
                userId: users[0]._id,
                rating: 5,
                comment: 'Très bon livre et très utile ! J\'ai beaucoup appris. L\'auteur a un style d\'écriture très clair et pratique.',
                status: 'ACTIVE',
                helpful: 12,
                reportCount: 0
            },
            {
                bookId: books[1]._id,
                userId: users[1]._id,
                rating: 4,
                comment: 'Bon contenu, facile à comprendre. Convient aux débutants.',
                status: 'ACTIVE',
                helpful: 8,
                reportCount: 0
            },
            {
                bookId: books[2]._id,
                userId: users[2]._id,
                rating: 5,
                comment: 'Philosophie profonde, mérite d\'être lu. Ce livre a changé ma vision de la vie.',
                status: 'ACTIVE',
                helpful: 15,
                reportCount: 0
            },
            {
                bookId: books[3]._id,
                userId: users[3]._id,
                rating: 3,
                comment: 'Bon livre mais un peu long. Certaines parties pourraient être plus courtes.',
                status: 'HIDDEN',
                helpful: 3,
                reportCount: 1
            },
            {
                bookId: books[4]._id,
                userId: users[4]._id,
                rating: 2,
                comment: 'Ne me convient pas. Le contenu est trop difficile à comprendre.',
                status: 'HIDDEN',
                helpful: 1,
                reportCount: 2
            },
            {
                bookId: books[0]._id,
                userId: users[5]._id,
                rating: 4,
                comment: 'Ce livre est très utile pour développer des compétences en leadership.',
                status: 'ACTIVE',
                helpful: 6,
                reportCount: 0
            },
            {
                bookId: books[1]._id,
                userId: users[6]._id,
                rating: 5,
                comment: 'Excellent ! J\'ai pu appliquer beaucoup de connaissances de ce livre.',
                status: 'ACTIVE',
                helpful: 10,
                reportCount: 0
            },
            {
                bookId: books[2]._id,
                userId: users[7]._id,
                rating: 3,
                comment: 'Bon contenu mais un peu difficile pour les débutants.',
                status: 'ACTIVE',
                helpful: 2,
                reportCount: 0
            },
            {
                bookId: books[3]._id,
                userId: users[8]._id,
                rating: 4,
                comment: 'Un livre à lire, beaucoup de leçons précieuses.',
                status: 'ACTIVE',
                helpful: 7,
                reportCount: 0
            },
            {
                bookId: books[4]._id,
                userId: users[9]._id,
                rating: 1,
                comment: 'Je n\'ai pas aimé ce livre, le contenu ne me convient pas.',
                status: 'HIDDEN',
                helpful: 0,
                reportCount: 3
            }
        ];

        // Create reviews
        const reviews = await Review.insertMany(reviewsData);
        console.log(`✅ Created ${reviews.length} reviews`);

        console.log('🎉 Reviews seeding completed successfully!');
    } catch (error) {
        console.error('❌ Error seeding reviews:', error);
    } finally {
        await mongoose.disconnect();
        console.log('📤 Disconnected from MongoDB');
    }
};

// Run the seeding function
seedReviews();
