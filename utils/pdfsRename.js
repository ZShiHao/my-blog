import {readdir,readFile,rename,writeFile} from 'node:fs/promises'
import { PDFDocument } from 'pdf-lib'

const dirpath='C:\\Users\\Administrator\\Desktop\\ebook\\'

async function readDocumentMetadata(filepath) {
    const file=await readFile(filepath)
    const pdfDoc = await PDFDocument.load(file, {
        updateMetadata: false
    })


    return pdfDoc.getTitle()
}

async function setDocumentMetadata(filepath,title) {
    const file=await readFile(dirpath+filepath)
    const pdfDoc = await PDFDocument.load(file, {
        updateMetadata: true
    })


    pdfDoc.setTitle(title)

    const pdfBytes = await pdfDoc.save()
    await writeFile(dirpath+title+'.pdf',pdfBytes)
}

async function dir(){
    try {
        const files = await readdir(dirpath);
        for (const file of files){
            const oldPath=dirpath+file
            let  title=await readDocumentMetadata(oldPath)
            const newPath=title?dirpath+title.replaceAll(/[:：]/ig,'-')+'.pdf':oldPath
            await rename(oldPath,newPath)
        }
    } catch (err) {
        console.error(err);
    }
}

export {
    dir,
    setDocumentMetadata
}
