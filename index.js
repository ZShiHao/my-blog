import express from 'express'
import cors from 'cors'
import blog from './routes/blog/blog.js'
import book from "./routes/book/book.js";
import category from './routes/blog/categoty.js'
import tags from './routes/blog/tags.js'
import bookCategory from "./routes/book/bookCategory.js";


const app=express()
const port=3000

app.use(cors())
app.use('/blog',blog)
app.use('/books',book)
app.use('/category',category)
app.use('/tags',tags)
app.use('/book_category',bookCategory)





app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})