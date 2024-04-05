import express from 'express'
import multer from 'multer'
import convert from 'heic-convert'
import PDFDocument from 'pdfkit'
import fs from "fs"
import { AxiosError } from 'axios'
import { google } from 'googleapis'

const router = express.Router()
const upload = multer()

// [FEATURE] add an endpoint which returns the oauth url

router.get('/auth/google', async (req, res) => {
    const { code } = req.query
    try {
        const oauthClient = oauth2Client()
        const { tokens } = await oauthClient.getToken(code as string)
        oauthClient.setCredentials(tokens)
        
        res.json(tokens.access_token)
    } catch (e) {
        const error = e as AxiosError
        console.log(error)
        res.json(error.response)
    }
})

router.post('/convert', upload.single('image'), async (req, res) => {
    console.log(`${new Date().toLocaleTimeString()} - conversion started`)
    const { date, operation, amount } = req.query
    const accessToken = req.headers.authorization!.split(' ')[1]

    try {
        const oauthClient = oauth2Client()
        oauthClient.setCredentials({ access_token: accessToken })
        const drive = google.drive({
            version: 'v3',
            auth: oauthClient
        })
        const sheets = google.sheets({
            version: 'v4',
            auth: oauthClient
        })
        const spreadsheetId = '1WSNnSbKXdGDkEyqreXKdiK3aujJuDdyYLjzT-Fgd4ho'
        const financesSheetRes = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: 'Sheet1!B:B'
        })
        const balanceColumn = financesSheetRes.data!.values!
        const lastRowIndex = balanceColumn.length + 1
        const balance = Number(balanceColumn[balanceColumn.length - 1][0])

        if (operation === 'withdrawal') {
            // Convert .heic to .png format
            const jpgBuffer = await convert({
                buffer: req.file!.buffer, 
                format: 'JPEG',   
                quality: 1         
            }) 
            console.log(`${new Date().toLocaleTimeString()} - successful conversion`)

            // Write to PDF file
            const doc = new PDFDocument()
            const pdfPath = `server/tmp/${date}.pdf`
            const writeStream = fs.createWriteStream(pdfPath)

            doc.pipe(writeStream)
            doc.image(jpgBuffer, 0, 0, { width: 400 })
            doc.end()

            writeStream.on('finish', async () => {
                console.log(`${new Date().toLocaleTimeString()} - pdf ${date}.pdf has been created`)

                // Upload PDF to Google Drive
                const pdfFileRes = await drive.files.create({ 
                    requestBody: {
                        name: `${date}`,
                        mimeType: 'application/pdf',
                        parents: ['1zwCJkLRS3PYEmaZjULJlOlBDSoZ7YkIT']
                    },
                    media: {
                        mimeType: 'application/pdf',
                        body: fs.createReadStream(pdfPath)
                    },
                    fields: 'webViewLink'
                })
                console.log(`${new Date().toLocaleTimeString()} - file uploaded with link ${pdfFileRes.data.webViewLink}`)

                // Insert a withdrawal in Google sheet
                await sheets.spreadsheets.values.batchUpdate({
                    spreadsheetId: spreadsheetId,
                    requestBody: {
                        valueInputOption: 'RAW',
                        data: [
                            {
                                range: `Sheet1!A${(lastRowIndex).toString()}`,
                                values: [[ date ]]
                            },
                            {
                                range: `Sheet1!B${(lastRowIndex).toString()}`,
                                values: [[ balance - Number(amount) ]]
                            },
                            {
                                range: `Sheet1!D${(lastRowIndex).toString()}`,
                                values: [[ amount ]]
                            },
                            {
                                range: `Sheet1!E${(lastRowIndex).toString()}`,
                                values: [[ pdfFileRes.data.webViewLink ]]
                            }
                        ],
                        includeValuesInResponse: true
                    }
                })
                console.log(`${new Date().toLocaleTimeString()} - insertion in sheet performed [SUCCESSFUL CONVERSION]`)

                // Delete the temporary pdf
                fs.unlinkSync(pdfPath)

                res.status(200).json('The withdrawal was successfully performed!')
            })
        } else {
            // Insert a deposit in Google sheet
            await sheets.spreadsheets.values.batchUpdate({
                spreadsheetId: spreadsheetId,
                requestBody: {
                    valueInputOption: 'RAW',
                    data: [
                        {
                            range: `Sheet1!A${(lastRowIndex).toString()}`,
                            values: [[ date ]]
                        },
                        {
                            range: `Sheet1!B${(lastRowIndex).toString()}`,
                            values: [[ balance + Number(amount) ]]
                        },
                        {
                            range: `Sheet1!C${(lastRowIndex).toString()}`,
                            values: [[ amount ]]
                        }
                    ],
                    includeValuesInResponse: true
                }
            })

            res.status(200).json('The deposit was successfully inserted!')
        }
    } catch (e) {
        const error = e as AxiosError
        console.log(error.response)
        res.status(Number(error.code)).json({ message: error.message })
    }
})

const oauth2Client = () => {
    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    )
}

export default router
