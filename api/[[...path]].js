import 'dotenv/config'
import app from '../server/app.js'
import { connectDB } from '../server/config/db.js'

export default async function handler(req, res) {
  await connectDB()
  app(req, res)
}
