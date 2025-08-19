# StraySafe API Documentation

## Base URL
- Development: `http://localhost:3000`
- Production: TBD

## Authentication Endpoints

### 1. Register User
**POST** `/auth/register`

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "platform": "mobile", // optional, set to "mobile" for React Native apps
  "parent_id": "parent_user_id" // optional, to create user under another user
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user", // or "sub_user" if parent_id is provided
    "parent_id": "parent_user_id", // if created under another user
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### 2. Login User
**POST** `/auth/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123",
  "platform": "mobile", // optional, set to "mobile" for React Native app
  "rememberMe": true // optional
}
```

**Response:** Same as register

### 3. Logout User
**POST** `/auth/logout`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 4. Get Current User
**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isActive": true
    }
  }
}
```

### 5. Validate Token
**GET** `/auth/validate-token`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Token is valid",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### 6. Update Password
**PATCH** `/auth/updatePassword`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Body:**
```json
{
  "passwordCurrent": "current_password",
  "password": "new_password",
  "passwordConfirm": "new_password"
}
```

## General Endpoints

### Health Check
**GET** `/health`

**Response:**
```json
{
  "ok": true,
  "message": "StraySafe API is running",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "environment": "development"
}
```

### Database Status
**GET** `/db-status`

**Response:**
```json
{
  "database": "connected",
  "host": "localhost"
}
```

## User Management Endpoints

### 1. Get Managed Users
**GET** `/users/managed`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_id",
        "name": "User Name",
        "email": "user@example.com",
        "role": "user",
        "parent_id": null,
        "parent": null
      }
    ],
    "total": 1
  }
}
```

### 2. Get User Hierarchy
**GET** `/users/hierarchy/:userId?`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "Parent User",
      "email": "parent@example.com",
      "role": "user"
    },
    "children": [
      {
        "id": "child_id",
        "name": "Child User",
        "email": "child@example.com",
        "role": "sub_user",
        "parent_id": "user_id"
      }
    ],
    "totalDescendants": 2
  }
}
```

### 3. Add Sub-User
**POST** `/users/sub-user`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Body:**
```json
{
  "name": "Sub User Name",
  "email": "subuser@example.com",
  "password": "password123",
  "parentId": "parent_user_id" // optional, defaults to current user
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sub-user created successfully",
  "data": {
    "user": {
      "id": "new_user_id",
      "name": "Sub User Name",
      "email": "subuser@example.com",
      "role": "sub_user",
      "parent_id": "parent_user_id"
    }
  }
}
```

### 4. Move User
**PATCH** `/users/move/:userId`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Body:**
```json
{
  "newParentId": "new_parent_id" // null to make root user
}
```

**Response:**
```json
{
  "success": true,
  "message": "User moved successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "role": "sub_user",
      "parent_id": "new_parent_id"
    }
  }
}
```

### 5. Remove User
**DELETE** `/users/:userId`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Body (optional):**
```json
{
  "reassignTo": "new_parent_id" // optional, reassign children to another user
}
```

**Response:**
```json
{
  "success": true,
  "message": "User removed successfully",
  "data": {
    "childrenAffected": 2,
    "reassignedTo": "new_parent_id"
  }
}
```

## Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error message here",
  "details": ["Additional error details if applicable"]
}
```

## User Roles and Hierarchy

### User Roles
- **admin**: Can manage all users, create/edit/delete any user
- **user**: Regular user, can create sub-users under themselves
- **sub_user**: User created under another user, cannot have children

### Hierarchy Rules
1. **Admins** can manage all users regardless of hierarchy
2. **Regular users** can:
   - Create sub-users under themselves
   - Manage their direct children and descendants
   - View their own hierarchy
3. **Sub-users** cannot:
   - Create children
   - Be parents to other users
4. **Circular references** are prevented
5. **Self-referencing** is not allowed


## Authentication for React Native

When using this API with React Native:

1. Set `platform: "mobile"` in login/register requests to avoid cookie-based authentication
2. Store the JWT token securely (using AsyncStorage or SecureStore)
3. Include the token in the Authorization header for protected routes:
   ```
   Authorization: Bearer <jwt_token>
   ```

## Default Test Users

After running the seed script (`npm run seed`):

1. **Admin User:**
   - Email: `admin@example.com`
   - Password: `admin123`
   - Role: `admin`

2. **Test User:**
   - Email: `test@example.com`
   - Password: `test123`
   - Role: `user`
