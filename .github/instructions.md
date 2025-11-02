# Hospital Management System - AI Agent Instructions

## Project Overview
This is a hospital management system with a Node.js backend. The system will handle patient records, appointments, medical staff management, and other hospital administrative tasks.

## Architecture & Structure

### Backend (Node.js)
- Expected structure:
  ```
  backend/
  ├── src/
  │   ├── config/         # Environment & app configuration
  │   ├── models/         # Database models (MongoDB/Mongoose)
  │   ├── routes/         # API route handlers
  │   ├── controllers/    # Business logic
  │   ├── middleware/     # Auth & request processing
  │   ├── utils/          # Helper functions
  │   └── app.js         # Main application file
  ```

### Key Conventions

1. **API Structure**
   - RESTful endpoints under `/api/v1`
   - Resource-based routing (e.g., `/api/v1/patients`, `/api/v1/appointments`)
   - Controllers handle business logic, routes handle request/response

2. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control (Admin, Doctor, Nurse, Patient)
   - Protected routes require valid JWT token

3. **Error Handling**
   - Consistent error response format:
     ```json
     {
       "success": false,
       "message": "Error description",
       "error": {} // Optional error details
     }
     ```

4. **Data Models**
   - Use Mongoose schemas with proper validation
   - Implement soft delete where applicable
   - Maintain audit fields (createdAt, updatedAt)

## Development Workflow

1. **Environment Setup**
   ```bash
   npm install          # Install dependencies
   npm run dev         # Run development server
   ```

2. **Testing**
   - Write unit tests for utilities and controllers
   - Integration tests for API endpoints
   - Run tests: `npm test`

## Common Tasks

1. **Adding New API Endpoints**
   - Create route in appropriate file under `routes/`
   - Implement controller logic in `controllers/`
   - Add validation middleware if needed
   - Update API documentation

2. **Database Operations**
   - Use Mongoose models for database operations
   - Implement proper error handling and validation
   - Follow the repository pattern for data access

## Integration Points
- MongoDB for data persistence
- JWT for authentication
- External services integration points to be added

## Notes
- Project is in initial setup phase
- Follow Node.js best practices and ES6+ conventions
- Maintain proper documentation for API endpoints