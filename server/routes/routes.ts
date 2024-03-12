import express from 'express'
import multer from 'multer'
import convert from 'heic-convert'
import PDFDocument from 'pdfkit'
import fs from "fs"
import axios, { AxiosError } from 'axios'

const router = express.Router()
const upload = multer()

// Auth URL sample: https://accounts.google.com/o/oauth2/v2/auth/auth?client_id=621637399988-gfrm4vi1lc1mae7f1s743p9277f27d8t.apps.googleusercontent.com&scope=https://www.googleapis.com/auth/drive%20https://www.googleapis.com/auth/spreadsheets&response_type=code&redirect_uri=http://localhost:8080/api/auth/google
router.get('/auth/google', async (req, res) => {
    const { code } = req.query

    try {
        const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            code: code,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            grant_type: 'authorization_code'
        })
        
        res.json(tokenResponse.data.access_token)
    } catch (e) {
        const error = e as AxiosError
        console.log(error.response)
        res.json(error)
    }
})

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