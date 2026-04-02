import { app } from './app';
import { runDB } from './db/db';
import { config } from './config';

const PORT = config.PORT;
const StartAPI = async () => {
    try {
        await runDB();
        app.listen(PORT, () => {
            console.log('Server started!');
        });
    } catch (error) {
        console.error('Failed to start the application', error);
        process.exit(1);
    }
};

StartAPI();
