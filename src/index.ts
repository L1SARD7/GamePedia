import { app } from './app';
import { runDB } from './db/db';
import { config } from './config';

const PORT = config.PORT;
const StartAPI = async () => {
    runDB();
    app.listen(PORT, () => {
        console.log('Server started!');
    });
};

StartAPI();
