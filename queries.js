const connectDB = require('./config/db');
const Book = require('./models/Books');

async function Queries() {
    await connectDB.connectDB();

    //FINDING BOOKS IN STOCK AND PUBLISHED AFTER 2010
    
    const inStockAfter2010 = await Book.find(
        { in_stock: true, published_year: { $gt: 2010}}
    );
    console.log("IN STOCK AFTER 2010: ", inStockAfter2010);



    // PROJECTION TO RETURN TITLE, AUTHOR AND PRICE OF THE 2ND BOOK IN THE COLLECTION
    const projection = await Book.find(
        {},
        { title: 2, author: 2, price: 2, _id: 1 }
    ); 
    console.log('projection of title, author, price: ', projection);


// SORTING PRICES IN ASCENDING AND DESCENDING ORDER

const SortACS = await Book.find().sort({ price: 1});
console.log('sorted in ascending price:', SortACS);


const SortDesc = await Book.find().sort({ price: -1});
console.log("sorted in desceding:", SortDesc);



// PAGING
const page1 = await Book.find().skip(0).limit(5);
const page2 = await Book.find().skip(5).limit(5)
console.log("page 1:", page1);
console.log("page 2:", page2);



// AGGREGATION PIPELINES

//AVERAGE PRICE BY GENRE
const avg = await Book.aggregate([
    { $group: {_id: "$genre", avg: { $avg: "$price" } } }
]);
console.log("Average price: ", avg);


// Author with the most books
const topAuthor = await Book.aggregate([
    { $group: { _id: "$author", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 }
]);
console.log("author with most books: ", topAuthor);


//grouping books by publish decade4
const byDecade = await Book.aggregate([
    {
        $group: {
            _id: { $floor: { $divide: ["$published_year", 10 ] } },
            count: { $sum: 1}
        }
    },
    {
        $project: {
            decade: { $mutiply: ["$_id", 10]},
            count: 1,
            _id: 0
        }
    },
    {$sort: { decade: 1}}
])
console.log("books grouped by decade: ", byDecade);

// indexing on title

await Book.collection.createIndex({ author: 1, published_year: -1 });
console.log("add index on author + published_year created");


// using explaini() to show performance

const explainResult = await Book.find({ title: "1984" }).explain("executionStats");
console.log("explain result: ", explainResult.executionStats);


process.exit();
}
Queries();