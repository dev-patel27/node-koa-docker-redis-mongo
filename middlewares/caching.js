import { createClient } from 'redis';
import { userRepository } from '../repositories';

const caching = async (ctx, next) => {
	let { body } = ctx.request;
	const { email } = body;

	const checkExistingUser = await userRepository.userQuery({ email });
	if (checkExistingUser) {
		ctx.status = 400;
		ctx.body = {
			success: false,
			message: 'User Credentials Already In Use',
		};
		return true;
	}

	const redisClient = await createClient({
		enable_offline_queue: false,
		host: `${process.env.REDIS_HOST}`,
		port: 6379,
	});
	await redisClient.connect();

	redisClient.on('error', (err) => {
		console.error('Error::>', err);
	});

	redisClient.on('connect', () => {
		console.log('redis connected...');
	});

	async function isOverLimit(ip) {
		let res;
		try {
			res = await redisClient.incr(ip);
		} catch (err) {
			console.error('isOverLimit: could not increment key');
			throw err;
		}
		console.log(`Requested from same IP ${res} times`);
		if (res > (+process.env.MAX_REGISTRATION_ALLOWED_PER_IP || 5)) {
			return true;
		}
		redisClient.expire(ip, 86400);
	}

	// check rate limit
	let overLimit = await isOverLimit(ctx?.request?.ip);
	if (overLimit) {
		ctx.status = 429;
		ctx.body = {
			success: false,
			message: 'Too many requests - try again later',
		};
		return true;
	} else {
		console.log('Accessed the precious resources!');
		await next();
	}
};

export default caching;
