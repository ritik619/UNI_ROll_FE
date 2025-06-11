# University Enrollment System Documentation

## Overview
The University Enrollment System is a web application that manages the enrollment process for universities, courses, and students. It supports two main user roles: Admin and Agent, each with different permissions and capabilities.

## User Roles

### Admin
- Full system access
- Can manage all entities (Universities, Courses, Intakes, Students, Agents)
- Can view and manage earnings
- Can approve/reject enrollments
- Can manage payment associations

### Agent
- Limited access to their assigned students
- Can manage their students' enrollments
- Can view their earnings
- Cannot modify system-wide settings

## Core Features

### 1. Agent Management
#### CRUD Operations
- **Create**: Add new agents with contact information and commission rates
- **Read**: View agent details, performance metrics, and student list
- **Update**: Modify agent information and commission rates
- **Delete**: Remove agents from the system

#### APIs
```typescript
// Agent Creation
POST /api/agents
{
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  commissionRate: number;
}

// Agent Update
PATCH /api/agents/:id
{
  // Update fields
}

// Agent Deletion
DELETE /api/agents/:id
```

### 2. Student Management
#### CRUD Operations
- **Create**: Register new students with personal and academic information
- **Read**: View student profiles, enrollment status, and payment history
- **Update**: Modify student information and enrollment details
- **Delete**: Remove student records

#### Enrollment Flow
1. Student registration
2. Course selection
3. Intake selection
4. Payment processing
5. Enrollment confirmation

#### APIs
```typescript
// Student Creation
POST /api/students
{
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationality: string;
  // Additional fields
}

// Student Enrollment
PATCH /api/students/:id/enroll
{
  universityId: string;
  courseId: string;
  intakeId: string;
}

// Student Unenrollment
PATCH /api/students/:id/unenroll
```

### 3. University Management
#### CRUD Operations
- **Create**: Add new universities with location and contact details
- **Read**: View university profiles and course offerings
- **Update**: Modify university information and settings
- **Delete**: Remove universities from the system

#### APIs
```typescript
// University Creation
POST /api/universities
{
  name: string;
  location: string;
  contactInfo: object;
  // Additional fields
}

// University Update
PATCH /api/universities/:id
```

### 4. Course Management
#### CRUD Operations
- **Create**: Add new courses with details and requirements
- **Read**: View course information and enrollment statistics
- **Update**: Modify course details and requirements
- **Delete**: Remove courses from the system

#### APIs
```typescript
// Course Creation
POST /api/courses
{
  name: string;
  universityId: string;
  duration: string;
  requirements: string[];
  // Additional fields
}

// Course Update
PATCH /api/courses/:id
```

### 5. Intake Management
#### CRUD Operations
- **Create**: Add new intakes with dates and capacity
- **Read**: View intake details and enrollment status
- **Update**: Modify intake information
- **Delete**: Remove intakes from the system

#### APIs
```typescript
// Intake Creation
POST /api/intakes
{
  universityId: string;
  courseId: string;
  startDate: Date;
  endDate: Date;
  capacity: number;
}

// Intake Update
PATCH /api/intakes/:id
```

### 6. Course Associations
#### Management
- Links universities with courses
- Defines commission rates
- Manages course availability

#### APIs
```typescript
// Association Creation
POST /api/associations
{
  universityId: string;
  courseId: string;
  commissionRate: number;
  isActive: boolean;
}

// Association Update
PATCH /api/associations/:id
```

### 7. Earning Flow
#### Process
1. Student enrollment
2. Payment processing
3. Commission calculation
4. Payment to agents

#### APIs
```typescript
// Earning Creation
POST /api/earnings
{
  agentId: string;
  studentId: string;
  courseId: string;
  universityId: string;
  intakeId: string;
  amount: number;
}

// Payment Association
PATCH /api/earnings/:id/payments/:paymentId
{
  amount: number;
  status: 'Paid' | 'Pending' | 'Failed';
  description: string;
}
```

## UI Components

### 1. Dashboard
- Overview of key metrics
- Recent enrollments
- Pending actions
- Earnings summary

### 2. Student Management
- Student list view
- Quick enrollment form
- Payment management
- Status tracking

### 3. Agent Management
- Agent list view
- Performance metrics
- Commission tracking
- Student assignments

### 4. University/Course Management
- University list view
- Course catalog
- Intake management
- Association settings

## Security
- Role-based access control
- JWT authentication
- API endpoint protection
- Data validation

## Data Flow
1. User authentication
2. Role-based access verification
3. CRUD operations with API calls
4. Real-time updates
5. Data persistence

## Error Handling
- API error responses
- Form validation
- User feedback
- Error logging

## Best Practices
1. Always validate input data
2. Use proper error handling
3. Implement proper security measures
4. Follow the established workflow
5. Maintain data consistency

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Modern web browser

### Installation
1. Clone the repository
```bash
git clone [repository-url]
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
```bash
cp .env.example .env
```

4. Start the development server
```bash
npm run dev
# or
yarn dev
```

### Environment Variables
```env
NEXT_PUBLIC_API_URL=your_api_url
NEXT_PUBLIC_AUTH_TOKEN=your_auth_token
```

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details. 