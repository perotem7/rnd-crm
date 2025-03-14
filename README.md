# RNDCRM

A simple CRM application with Vue 3 frontend and Node.js backend.

## Project Structure

- `frontend/` - Vue 3 + Vite + Pinia frontend application
- `backend/` - Node.js + Express backend with Prisma ORM

## Running the Application

### Backend

```bash
cd backend
npm install
npm run dev
```

The backend server will run on http://localhost:3000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend development server will run on http://localhost:5173

## Testing the API Connection

1. Start both the backend and frontend servers
2. Open the frontend application in your browser
3. Click the "Fetch Data from Backend" button
4. You should see a message from the backend displayed on screen

## Features

- Vue 3 with Composition API
- Pinia for state management
- Express REST API
- SQLite database with Prisma ORM