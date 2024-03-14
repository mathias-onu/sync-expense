import express from "express"
import dotenv from 'dotenv'
import router from "./server/routes/routes.js"
import cors, { CorsOptions } from "cors"

const app = express()
const corsOptions: CorsOptions = {
  origin: "http://localhost:5173",
  optionsSuccessStatus: 200,
}

dotenv.config()

app.use(express.json())
app.use(cors(corsOptions))
app.use("/api", router)

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`)
})
