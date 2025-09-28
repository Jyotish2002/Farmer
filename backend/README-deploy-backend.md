Deploying the backend to Vercel (serverless)

This project contains serverless endpoints under `api/` and a cached Mongo helper (`utils/mongo.js`) suitable for Vercel deployments. Follow these steps to deploy the `backend` folder as a separate Vercel project.

1. Create a new Vercel project
- Go to https://vercel.com/dashboard and click "New Project" → "Import Git Repository".
- Select your repository and, in the import settings, set "Root Directory" to `backend`.

2. Environment variables
Add the following environment variables in Vercel for Production (and Preview if desired):

- MONGODB_URI: mongodb+srv://... (Your Atlas connection string)
- JWT_SECRET: a long random secret string
- GOOGLE_CLIENT_ID: from Google Cloud Console
- GOOGLE_CLIENT_SECRET: from Google Cloud Console
- GOOGLE_CALLBACK_URL: https://<your-backend-domain>/api/auth/google/callback
- FRONTEND_URL: https://<your-frontend-domain>
- GEMINI_API_KEY: <optional, only if chatbot is used>
- OPENWEATHER_API_KEY: <optional>

3. Google Cloud Console
- In Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs, add the authorized redirect URI:
  - https://<your-backend-domain>/api/auth/google/callback

4. Deploy
- Click Deploy in Vercel. The serverless functions in `api/` will be deployed.

5. Validate
- Test the OAuth redirect:
  curl -i https://<your-backend-domain>/api/auth/google
  Expected result: 302 redirect to accounts.google.com

6. Notes
- The current repository also contains an Express `server.js`. Vercel will not run that long-running server; instead, serverless functions under `api/` are used. Convert additional routes to serverless functions as needed.
- If you want to run the whole Express app without refactor, use Render/Railway instead.

If you want, I can generate the `vercel` CLI commands to add the environment variables automatically.
