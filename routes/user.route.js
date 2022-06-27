import express from 'express';
import { userController } from '../controllers';

export default express
	.Router()
	.post(
		'/register',
		userController.signup,
	)
	.post(
		'/login',
		userController.login,
	)
	.get('/', authorize, userController.getAllUsers)
	.post(
		'/user-init-password-reset',
		userController.forgotPassword,
	)
	.post(
		'/user-complete-password-reset',
		authorize,
		userController.resetPassword,
	);
