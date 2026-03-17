import dotenv from 'dotenv'; 
dotenv.config()
import { app } from './app'
import { runDB } from './db/db'


let PORT = process.env.PORT || 1235
const StartAPI = async () => {
    runDB()
    app.listen(PORT, () => {
        console.log('Server started!')
    })
}

StartAPI()