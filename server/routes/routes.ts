import express from 'express'
import multer from 'multer'
import convert from 'heic-convert'
import PDFDocument from 'pdfkit'
import fs from "fs"

const router = express.Router()
const upload = multer()

router.post('/convert', upload.single('image'), async (req, res) => {
    try {
        // Convert .heic to .png format
        const pngBuffer = await convert({
            buffer: req.file!.buffer, 
            format: 'PNG',   
            quality: 1         
        })

        // Write to PDF file
        const doc = new PDFDocument();
        const pdfPath = 'server/tmp/output.pdf'
        doc.pipe(fs.createWriteStream(pdfPath))
        doc.image(pngBuffer, 0, 0, { width: 400 })
        doc.end()

        // Upload PDF to Google Drive: https://developers.google.com/drive/api/guides/manage-uploads
        // Delete the pdf (issue: cannot access the file due to the asynchronous nature of fs.createWriteStream())

        return res.status(200).json({ message: `Image ${req.file!.originalname} received successfully` })
    } catch (error) {
        res.status(400).json(error)
    }
})

export default router