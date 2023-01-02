const express=require('express')
const cors=require('cors')
const blog=require('./routes/blog')
const category=require('./routes/categoty')
const tags=require('./routes/tags')
const gm=require('gm').subClass({ imageMagick: '7+' });
const {uploadBookCoverBuffer}=require('./config/oss')


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