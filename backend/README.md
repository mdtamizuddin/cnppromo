# ⚙️ CNP-PROMO Backend Server

Node.js + Express + Socket.IO REST API and WebSocket server for CNP-PROMO.

## Environment Variables
Configure the following in `backend/.env`:
```env
PORT=4000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/database?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=ap-south-1
AWS_BUCKET_NAME=cnppromo-files
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_ADDRESS=your_email_address
EMAIL_PASSWORD=your_email_password
ROOT_BYPASS_KEY=optional_root_secret_key
```

## Running Locally
```bash
pnpm dev:backend
```
