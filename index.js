import express from 'express'
import cors from 'cors'
import blog from './routes/blog.js'
import category from './routes/categoty.js'
import tags from './routes/tags.js'


const app=express()
const port=3000

app.use(cors())
app.use('/blog',blog)
app.use('/category',category)
app.use('/tags',tags)


// gm('./JavaScript.pdf[0]').toBuffer('PNG',async function (err, buffer) {
//     if (err) return handle(err);
//     await uploadBookCoverBuffer('hhh.png',buffer)
//     console.log('done!');
// })



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})