# PrepTrack - Company-Specific Mock Test Platform

A React-based mock test platform that generates company-specific tests (TCS, Infosys, Accenture, Wipro, etc.) dynamically based on test patterns.

**Features:**
- ✅ Company-specific test patterns stored as JSON
- ✅ Dynamic test generation from pattern-based question pools
- ✅ Section-wise test structure (Aptitude, Coding, Verbal as per company)
- ✅ Per-section difficulty and tag-based question filtering
- ✅ Fallback strategy for question shortage
- ✅ Unique questions across test sections
- ✅ Real-time timer and test submission
- ✅ Score calculation and result display

## Documentation

- **[PATTERN_SYSTEM.md](./PATTERN_SYSTEM.md)** - Complete guide to the pattern-based test generation system
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - What's been built and next steps
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick API reference and commands

## Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Docker)
- npm

### 1. Start MongoDB (if using Docker)
```bash
npm run docker:dev
# or
docker-compose up -d
```

### 2. Seed Database
```bash
npm run seed:company
```

### 3. Start Backend Server
```bash
node server/index.js
# Server will listen on http://localhost:4000
```

### 4. Start Frontend (in new terminal)
```bash
PORT=3001 npm start
# Frontend will run on http://localhost:3001
```

### 5. Test the API
```bash
# Get all patterns
curl http://localhost:4000/api/patterns

# Start a TCS test
curl -X POST http://localhost:4000/api/patterns/tcs-2025/start \
  -H 'Content-Type: application/json' \
  -d '{"userId":"student-001"}'
```

## Available Scripts

### Frontend Commands

In the project directory, you can run:

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

## Development — local setup & seeding (PrepTrack additions)

This project includes a sample question dataset and a small script to seed a MongoDB database for local testing.

Files added for seeding:

- `seed/questions_seed.json` — sample question bank (Aptitude, Coding, Verbal).
- `scripts/seed.js` — node script that inserts the sample questions into a `questions` collection.
- `.env.example` — example environment variables for the seed script.

How to seed (local dev):

1. Install the `mongodb` driver for the seed script (dev dependency):

```bash
npm install mongodb --save-dev
```

2. Copy `.env.example` to `.env` and set your MongoDB connection. Example for a local DB:

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=preptrack
```

3. Run the seed script:

```bash
node scripts/seed.js
```

Notes:
- The seed script will clear the `questions` collection before inserting the sample documents. Use with caution if you have production data.
- The frontend is currently decoupled from the backend (the repo contains the React app). To test full flows, implement the backend APIs (Auth, Tests, Attempts) to consume the seeded data.

If you want, I can add a small Express backend scaffold and example endpoints to serve randomized tests and accept submissions — tell me and I'll create it next.

### Docker-based local development (recommended)

If you have Docker installed, you can run a local MongoDB instance and seed it in one step. This is reproducible and avoids installing MongoDB locally.

1. Start MongoDB and seed the database (this will run docker-compose and the seed script):

```bash
npm run docker:dev
```

2. Start the backend server (in another terminal):

```bash
npm run start:server
```

3. Start the frontend (in another terminal):

```bash
npm start
```

To stop and remove the container:

```bash
npm run docker:down
```

If you want, I can also add a `docker-compose` service for the server and a `docker-compose.dev.yml` to run the entire stack together.
