import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMail = async (to, from, subject, html) => {
	try {
		const sendMailObj = {
			to,
			from,
			subject,
			html,
		};
		await sgMail.send(sendMailObj);
	} catch (error) {
		if (error.response) {
			return error.response.body;
		}
	}
};

export default sendMail;
