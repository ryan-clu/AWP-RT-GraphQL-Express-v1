const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} = require("graphql");

const app = express();

// Data
const authors = [
  { id: 1, name: "J. K. Rowling" },
  { id: 2, name: "J. R. R. Tolkien" },
  { id: 3, name: "Brent Weeks" },
];

const books = [
  { id: 1, name: "Harry Potter and the Chamber of Secrets", authorId: 1 },
  { id: 2, name: "Harry Potter and the Prisoner of Azkaban", authorId: 1 },
  { id: 3, name: "Harry Potter and the Goblet of Fire", authorId: 1 },
  { id: 4, name: "Lord of The Rings: The Fellowship of the Ring", authorId: 2 },
  { id: 5, name: "Lord of The Rings: The Two Towers", authorId: 2 },
  { id: 6, name: "Lord of The Rings: The Return of the King", authorId: 2 },
  { id: 7, name: "The Way of Shadows", authorId: 3 },
  { id: 8, name: "Beyond the Shadows", authorId: 3 },
];

// Types
const BookType = new GraphQLObjectType({
  name: "Book",
  description: "This represents a book written by an author.",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    authorId: { type: GraphQLNonNull(GraphQLInt) },
    author: {
      type: AuthorType,
      resolve: (book, args) => {
        return authors.find(author => author.id === book.authorId)
      }
    }
  })
});

const AuthorType = new GraphQLObjectType({
  name: 'Author',
  description: 'This represents a author of a book',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    books: {
      type: new GraphQLList(BookType),
      resolve: (author, args) => {
        return books.filter(book => book.authorId === author.id)
      }
    }
  })
})

// Queries
const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    book: {
      type: BookType,
      description: 'A single book.',
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (parent, args) => books.find(book => book.id === args.id)
    },
    books: {
      type: new GraphQLList(BookType),
      description: "List of all books.",
      resolve: (parent, args) => books,
    },
    author: {
      type: AuthorType,
      description: 'A single author.',
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (parent, args) => authors.find(author => author.id === args.id)
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: "List of all authors.",
      resolve: (parent, args) => authors,
    },
  }),
});

// Mutations 
const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root mutation.',
  fields: () => ({
    addBook: {
      type: BookType,
      description: 'Add a new book.',
      args: {
        name: {type: GraphQLNonNull(GraphQLString)},
        authorId: {type: GraphQLNonNull(GraphQLInt)},
      },
      resolve: (parent, args) => {
        const book = { id: books.length+1, name: args.name, authorId: args.authorId};
        books.push(book);
        return book;
      }
    },
    addAuthor: {
      type: AuthorType,
      description: 'Add a new author.',
      args: {
        name: {type: GraphQLNonNull(GraphQLString)},
      },
      resolve: (parent, args) => {
        const author = { id: authors.length+1, name: args.name};
        authors.push(author);
        return author;
      }
    }
  })
})

// Schema
const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

app.use("/graphql", graphqlHTTP({
    schema: schema,
    graphiql: true,
  }));

let PORT = 1337;
app.listen(PORT, () => console.log(`*** Server is running on port ${PORT} ***`));

// Ryan's notes below...

/*

Simple test example.

const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'HelloWorld',
        fields: () => ({
            message: { 
              type: GraphQLString,
              resolve: (parent, args) => 'Hello World!'
            }
        })
    })
})

*/
