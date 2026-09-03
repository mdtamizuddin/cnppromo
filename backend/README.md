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

## S3 bucket setup — Task Marketplace proof media

The Task Marketplace uploads worker proof screenshots under the `task-proofs/`
prefix in `AWS_BUCKET_NAME` (see `backend/Routes/uploadFile.js`'s folder
whitelist). Two S3-side settings this app depends on but does not configure
itself:

1. **`DeleteObject`/`DeleteObjects` permission** on the bucket for the IAM
   user in `AWS_ACCESS_KEY_ID` — required for the active media purge in
   `backend/util/s3.js` (fires when a task completes/cancels and is
   dispute-free; see PROJECT_GUIDE.md §10.3).
2. **A Lifecycle Expiration rule scoped to the `task-proofs/` prefix only**,
   set to expire objects after **90 days**. This is a backstop, not the
   primary cleanup path — the app actively deletes a task's proofs once it is
   terminal and nothing about it is still contestable. The rule exists to
   catch two things the active purge structurally cannot reach: orphaned
   uploads from an abandoned submission form, and any task whose purge
   permanently failed. 90 days is chosen to sit well above
   `Setting.marketplace.reportWindowHours` (default 72h), so the rule can
   never delete evidence that is still disputable.

   **Do not** apply this rule bucket-wide — `images/` and `payment-proofs/`
   hold permanent assets (site logo, gateway icons, payment receipts) that
   must never expire.
