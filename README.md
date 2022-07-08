# Node Koa.js

- Create a architecture using docker (The application should be built as a collection of two Docker containers)
- Create an end-points for user-management with error handling and logs using the 
  - Sign-up
    - endpoint: `/sign-up`
  - Login
    - endpoint: `/login`
  - User email verification, after registration
    - endpoint: `/user-verified-email`
  - User set password request after email verification
    - endpoint: `/user-activate`
  - User forgot password request when user forgot the password
    - endpoint: `/user-init-password-reset`
  - User reset password request when receive an email for set new password link
    - endpoint: `/user-complete-password-reset`
- Create a security, User can only able to register max 5 users per day from same ip address
# ENV vars
- SENDGRID_API_KEY
- PORT
- HOST
- SECRETKEY
- SENDGRID_EMAIL
- DATABASE_NAME
- CONNECTION_URL
- REDIS_HOST
- MAX_REGISTRATION_ALLOWED_PER_IP