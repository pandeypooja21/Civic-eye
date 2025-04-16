# Civic Eye Reporting System

A real-time civic issue reporting platform that allows citizens to report infrastructure problems and enables administrators to track and manage these issues efficiently.

## Features

- **Real-time Issue Reporting**: Citizens can report infrastructure issues with location, description, and photos
- **Interactive Map**: View reported issues on an interactive map powered by Mapbox
- **Admin Dashboard**: Administrators can track, filter, and manage reported issues
- **Real-time Updates**: Fluvio streaming for instant updates across all connected clients
- **Database Storage**: MongoDB for persistent storage of all reported issues
- **Mobile Responsive**: Works on all devices from smartphones to desktops

## Technology Stack

### Frontend
- React with TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- shadcn/ui for UI components
- Mapbox GL for interactive maps
- WebSockets for real-time updates

### Backend
- Node.js with Express
- MongoDB for database
- Fluvio for real-time streaming
- WebSockets for real-time communication

## Setup Instructions

### Prerequisites
- Node.js (v16+) and npm
- MongoDB (local or Atlas)
- Mapbox API key (for maps)
- Fluvio account (optional, for real-time streaming)

### Installation

1. Clone the repository
```sh
git clone <repository-url>
cd civic-eye-reporting
```

2. Install frontend dependencies
```sh
npm install
```

3. Install backend dependencies
```sh
cd server
npm install
cd ..
```

4. Configure environment variables
   - Create a `.env` file in the root directory with your Mapbox API key:
   ```
   VITE_API_URL=http://localhost:5000/api
   VITE_WS_URL=ws://localhost:5000
   VITE_MAPBOX_API_KEY=your_mapbox_api_key_here
   ```
   - Create a `.env` file in the `server` directory with your MongoDB and Fluvio credentials:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/civic-eye
   FLUVIO_ENABLED=false
   FLUVIO_TOPIC=civic-eye-issues
   ```

5. Start the development servers
```sh
npm run start-dev
```

This will start both the frontend and backend servers concurrently.

## Usage

### Citizen Interface
- Visit `http://localhost:8080` to access the citizen reporting interface
- Report issues by filling out the form and selecting a location on the map
- View previously reported issues

### Admin Dashboard
- Visit `http://localhost:8080/admin` to access the admin dashboard
- View all reported issues in list or map view
- Filter issues by type, status, and timeframe
- Update issue status (open, in-progress, resolved)

## API Endpoints

### Issues
- `GET /api/issues` - Get all issues
- `GET /api/issues/filter` - Get filtered issues
- `GET /api/issues/:id` - Get a specific issue
- `POST /api/issues` - Create a new issue
- `PATCH /api/issues/:id` - Update an issue
- `DELETE /api/issues/:id` - Delete an issue

## WebSocket Events

- `issue-created` - Triggered when a new issue is reported
- `issue-updated` - Triggered when an issue is updated
- `issue-deleted` - Triggered when an issue is deleted

## Deployment

This application can be deployed to any platform that supports Node.js applications:

1. Build the frontend:
```sh
npm run build
```

2. Deploy the backend and serve the static frontend files

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
