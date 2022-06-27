import { set, connect, connection } from 'mongoose';
require('dotenv').config({ path: 'src/config/.env' });
import { redBright, greenBright } from 'chalk';

// Database Name & URL
const DATABASE_NAME = process.env.DATABASE_NAME;
export const CONNECTION_URL = process.env.CONNECTION_URL + DATABASE_NAME;

const connectMongoDB = async () => {
	try {
		set('useCreateIndex', true);

		//for making use of findOneAndUpdate else it will not work
		set('useFindAndModify', false);

		//Connection establishment
		connect(CONNECTION_URL, {
			useNewUrlParser: true,
			useCreateIndex: true,
			useUnifiedTopology: true,
		});

		const db = connection;

		// Event Listener
		db.on('disconnected', (_err) => {
			console.error(redBright(`MongoDB-> disconnected: ${DATABASE_NAME}`));
			connectMongoDB();
		});

		db.on('reconnected', (_err) => {
			console.info(greenBright(`MongoDB-> reconnected: ${DATABASE_NAME}`));
		});

		db.on('error', (error) => {
			console.error(redBright('Error occured in db connection', error));
			throw new Error('Error occured in db connection');
		});

		db.on('open', () => {
			console.info(
				greenBright(
					`DB Connection with ${DATABASE_NAME} established successfully.`,
				),
			);
		});
	} catch (error) {
		console.error(redBright('Error occured in db connection', error));
		process.exit(-1);
	}
};

connectMongoDB();

export default connectMongoDB;
