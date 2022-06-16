import express, { Express, Request, Response } from "express"
import dotenv from "dotenv"
import cors from "cors"
import bodyParser from "body-parser"

dotenv.config()

const app: Express = express()
const port = process.env.PORT

app.use(cors())
app.use(bodyParser.json())

app.get('/', (req: Request, res: Response) => {
  console.log(req.body)
  res.send('Express + TypeScript Server')
})

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
})