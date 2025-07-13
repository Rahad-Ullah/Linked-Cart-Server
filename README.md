# linked-cart-app-backend

## Setup Instructions

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/linked-cart-app-backend.git
   cd linked-cart-app-backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example` and update environment variables as needed.

4. Configure environment variables:

   - Copy the contents of `.env.example` to a new file named `.env` in the project root.
   - Update the values in `.env` as needed. For example:

   ```bash
   NODE_ENV=your_environment
   IP=your_ip_address
   PORT=your_port
   DATABASE_URL=your_database_url

   # Bcrypt
   BCRYPT_SALT_ROUNDS=your_bcrypt_salt_rounds

   # JWT
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE_IN=your_jwt_expiry

   JWT_REFRESH_SECRET=your_jwt_refresh_secret
   JWT_REFRESH_EXPIRES_IN=your_jwt_refresh_expiry

   # SMTP Node Mailer
   EMAIL_FROM=your_email_address
   EMAIL_USER=your_email_user
   EMAIL_PASS=your_email_password
   EMAIL_PORT=your_email_port
   EMAIL_HOST=your_email_host

   # Stripe
   STRIPE_API_SECRET=your_stripe_api_secret
   WEBHOOK_SECRET=your_webhook_secret
   SUCCESS_URL=your_success_url

   # Super admin credentials
   ADMIN_EMAIL=your_admin_email
   ADMIN_PASSWORD=your_admin_password

   # Google Map API
   GOOGLE_MAP_API_KEY=your_google_map_api_key
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. The backend should now be running locally.
