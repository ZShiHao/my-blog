const express=require('express')
const cors=require('cors')
const blog=require('./routes/blog')
const category=require('./routes/categoty')

const app=express()
const port=3000
app.use(cors())
app.use('/blog',blog)
app.use('/category',category)




app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})