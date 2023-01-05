import express from 'express'
import cors from 'cors'
import blog from './routes/blog/blog.js'
import category from './routes/blog/categoty.js'
import tags from './routes/blog/tags.js'
import bookCategory from "./routes/book/bookCategory.js";


const app=express()
const port=3000

app.use(cors())
app.use('/blog',blog)
app.use('/category',category)
app.use('/tags',tags)
app.use('/books/category',bookCategory)


// gm('./JavaScript.pdf[0]').toBuffer('PNG',async function (err, buffer) {
//     if (err) return handle(err);
//     await uploadBookCoverBuffer('hhh.png',buffer)
//     console.log('done!');
// })



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})