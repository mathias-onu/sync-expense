import express from "express"
import dotenv from 'dotenv'
import router from "./server/routes/routes.js"
import cors, { CorsOptions } from "cors"
import path from 'path'
import { fileURLToPath } from "url"

const app = express()
const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);
const corsOptions: CorsOptions = {
  origin: "http://localhost:5173",
  optionsSuccessStatus: 200,
}

dotenv.config()

app.use(express.json())
app.use(cors(corsOptions))
app.use("/api", router)

if (process.env.NODE_ENV === 'production') {
  const root = path.join(__dirname, '../client', 'dist')
  app.use(express.static(root));
  app.get("*", (req, res) => {
    res.sendFile('index.html', { root })
  })
}

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`)
})
