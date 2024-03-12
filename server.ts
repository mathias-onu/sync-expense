import express from "express"
import dotenv from 'dotenv'
import router from "./server/routes/routes.js"

const app = express()

dotenv.config()

app.use(express.json())
app.use("/api", router)

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`)
})
