# User Data API

A high-performance Express.js API for serving user data, featuring in-memory LRU caching, rate limiting, and asynchronous processing.

## Features

- **High Performance**: Optimized with caching and async processing.
- **LRU Caching**: Custom in-memory Least Recently Used cache implementation.
- **Rate Limiting**: Protects the API from abuse using `express-rate-limit` (10 requests per minute per IP).
- **Async Processing**: Simulated database calls are handled with an async queue.

## Prerequisites

- Node.js (v14 or higher recommended)
- npm

## Installation

1.  Clone the repository (or extract the project files).
2.  Install dependencies:

    ```bash
    npm install
    ```

## Running the Application

### Development Mode

To run the application in development mode with hot-reloading (using `nodemon`):

```bash
npm run dev
```

The server will start on `http://localhost:3001`.

### Production Mode

To build and run the application in production mode:

1.  Build the TypeScript code:

    ```bash
    npm run build
    ```

2.  Start the server:

    ```bash
    npm start
    ```

## API Endpoints

The API runs on port `3001` by default.

### 1. Get User

Retrieves a user by their ID.

-   **URL**: `/users/:id`
-   **Method**: `GET`
-   **Response**:
    -   `200 OK`: Returns the user object.
    -   `404 Not Found`: User not found.
    -   `429 Too Many Requests`: Rate limit exceeded.

    ```json
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
    ```

### 2. Create User

Creates a new user.

-   **URL**: `/users`
-   **Method**: `POST`
-   **Headers**: `Content-Type: application/json`
-   **Body**:

    ```json
    {
      "name": "New User",
      "email": "newuser@example.com"
    }
    ```

-   **Response**:
    -   `201 Created`: Returns the created user object.
    -   `400 Bad Request`: Missing name or email.

### 3. Clear Cache

Clears the entire in-memory cache.

-   **URL**: `/cache`
-   **Method**: `DELETE`
-   **Response**:
    -   `200 OK`: Cache cleared successfully.

### 4. Get Cache Status

Retrieves statistics about the cache usage.

-   **URL**: `/cache-status`
-   **Method**: `GET`
-   **Response**:

    ```json
    {
      "size": 1,
      "maxSize": 60,
      "hits": 5,
      "misses": 2
    }
    ```

## Testing

You can test the API using tools like `curl`, Postman, or your browser.

**Example 1: Get a User**
```bash
curl http://localhost:3001/users/1
```

**Example 2: Create a User**
```bash
curl -X POST http://localhost:3001/users \
     -H "Content-Type: application/json" \
     -d "{\"name\": \"Test User\", \"email\": \"test@example.com\"}"
```

**Example 3: Check Cache Status**
```bash
curl http://localhost:3001/cache-status
```
