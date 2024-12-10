# Files Manager Project

## Project Overview
A backend project focused on building a simple file management platform that combines various concepts:
- Authentication
- NodeJS
- MongoDB
- Redis
- Background Processing
- File Operations

## Core Technologies
- **Backend**: NodeJS/Express
- **Databases**: 
  - MongoDB (permanent storage)
  - Redis (caching/temporary storage)
- **Authentication**: Token-based
- **Processing**: Bull for background jobs

## Key Components

### 1. Redis Client (utils/redis.js)
- Connection management
- Basic operations (get, set, del)
- Health check functionality

### 2. MongoDB Client (utils/db.js)
- Database connection handling
- Collections: users, files
- Basic statistics functions

### 3. User Management
- Authentication endpoints:
  - User creation
  - Login/token generation
  - User profile retrieval
  - Session management

### 4. File Operations
Core functionalities:
- File upload (multiple types)
- File listing and retrieval
- Permission management
- File publishing/unpublishing
- File data access
- Thumbnail generation for images

### 5. API Endpoints

#### Authentication
- POST `/users` - Create new user
- GET `/connect` - User login
- GET `/disconnect` - User logout
- GET `/users/me` - Get user profile

#### File Management
- POST `/files` - Upload file
- GET `/files/:id` - Get file info
- GET `/files` - List files
- PUT `/files/:id/publish` - Make file public
- PUT `/files/:id/unpublish` - Make file private
- GET `/files/:id/data` - Get file content

#### System
- GET `/status` - Service health check
- GET `/stats` - System statistics

### 6. Advanced Features
- Image thumbnail generation
- Email notifications
- Pagination support
- Parent-child file relationships
- File type validation

## Project Requirements
- Ubuntu 18.04 LTS
- Node.js 12.x
- ESLint for code quality
- Environment variables support
- Error handling and validation

## Testing
Comprehensive test suite covering:
- Redis client functionality
- MongoDB client operations
- API endpoint validation
- Authentication flows
- File operations
- Error scenarios

## Development Setup
```bash
# Install dependencies
npm install

# Start server
npm run start-server

# Start worker (for background jobs)
npm run start-worker

# Run tests
npm test
```