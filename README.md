# Virtual Lab Access Portal

A minimal, professional request-based system for managing access to virtual lab environments. This application provides a secure workflow where students request lab access, administrators manually review and approve requests, and approved students receive URLs to access their lab environments.

## Purpose

This system mirrors real-world secure lab platforms used in enterprise learning environments. It provides:

- **Student Request Flow**: Students submit requests for specific lab environments
- **Manual Approval Process**: Administrators review each request and provide lab access URLs
- **Secure Access Distribution**: Lab URLs are only visible to approved students
- **No Automated Provisioning**: Infrastructure provisioning is handled manually by administrators outside this system

## Key Features

- **Simple Request Process**: Students fill out a form with their name, email, and desired lab
- **Status Tracking**: Students can check their request status using their email address
- **Admin Dashboard**: Password-protected interface for reviewing and approving requests
- **Manual URL Assignment**: Admins paste pre-provisioned lab URLs when approving requests
- **Clean, Professional UI**: Enterprise-style interface with minimal design

## Important: Infrastructure Management

**This application does NOT provision or manage virtual infrastructure.**

Administrators are responsible for:

- Manually creating/provisioning lab environments using external tools
- Managing cloud resources or container orchestration
- Obtaining lab access URLs from their infrastructure
- Pasting those URLs into this system during the approval process

This separation ensures security and control, as infrastructure provisioning requires appropriate permissions and validation that are handled outside this lightweight approval system.

## Tech Stack

- **Backend**: Node.js with Express
- **Database**: JSON file storage (db.json)
- **Frontend**: Plain HTML, CSS, and vanilla JavaScript
- **Authentication**: Simple password protection for admin panel (environment variable)

## Project Structure

```
virtual-lab/
├── backend/
│   ├── server.js          # Express server with API endpoints
│   └── db.json            # JSON database for storing requests
├── frontend/
│   ├── index.html         # Student request page
│   ├── status.html        # Student status check page
│   ├── admin.html         # Admin dashboard
│   └── styles.css         # Minimal, professional styling
└── README.md
```

## Installation

1. **Clone or download this project**

2. **Install dependencies**

   ```bash
   cd virtual-lab
   npm install
   ```

3. **Set admin password (optional)**

   ```bash
   # Windows
   set ADMIN_PASSWORD=your_secure_password

   # Linux/Mac
   export ADMIN_PASSWORD=your_secure_password
   ```

   Default password is `admin123` if not set.

4. **Start the server**

   ```bash
   npm start
   ```

5. **Access the application**
   - Open browser to `http://localhost:3000`

## Usage Flow

### For Students

1. **Request Lab Access** (`/`)

   - Navigate to the homepage
   - Fill in your name, email, and select a lab (currently "Docker Basics")
   - Submit the request
   - Your request will be saved with "Pending" status

2. **Check Request Status** (`/status`)
   - Enter your email address
   - View your request status
   - If approved, you'll see the lab access URL as a clickable link

### For Administrators

1. **Access Admin Dashboard** (`/admin`)

   - Navigate to `/admin`
   - Enter the admin password
   - View all pending and approved requests

2. **Approve Requests**
   - For each pending request, you'll see an input field for the lab URL
   - Manually provision the lab environment using your infrastructure tools
   - Copy the lab access URL from your infrastructure
   - Paste the URL into the input field
   - Click "Approve"
   - The student can now access the URL via the status page

## API Endpoints

### Student Endpoints

- `POST /api/request`

  - Create a new lab access request
  - Body: `{ name, email, labName }`
  - Returns: Success message and request ID

- `GET /api/status?email=<email>`
  - Check request status for a given email
  - Returns: Request details including lab URL if approved

### Admin Endpoints

- `GET /api/admin/requests?password=<password>`

  - List all lab requests (requires admin password)
  - Returns: Array of all requests with details

- `POST /api/admin/approve/:id`
  - Approve a request and attach lab URL
  - Body: `{ password, labUrl }`
  - Returns: Success message

## Configuration

### Environment Variables

- `PORT` - Server port (default: 3000)
- `ADMIN_PASSWORD` - Admin dashboard password (default: admin123)

### Database

The application uses a simple JSON file (`backend/db.json`) to store requests. Each request contains:

```json
{
  "id": "unique-id",
  "name": "Student Name",
  "email": "student@example.com",
  "labName": "Docker Basics",
  "status": "pending|approved",
  "labUrl": "https://lab-url.com",
  "createdAt": "2025-12-30T...",
  "approvedAt": "2025-12-30T..."
}
```

## Security Considerations

- Admin panel is protected by password (use environment variable in production)
- Emails are stored in lowercase for case-insensitive lookups
- No student authentication system (requests are tracked by email only)
- Input validation prevents duplicate requests for the same email
- XSS protection through HTML escaping in admin dashboard

## Design Philosophy

This application follows enterprise internal tool design principles:

- **Minimal and functional**: No unnecessary visual elements
- **Clear hierarchy**: Typography and spacing guide the user
- **Neutral colors**: Professional gray/black/white palette
- **System fonts**: Readable and familiar interface
- **No animations**: Fast, predictable interactions
- **Responsive**: Works on desktop and mobile devices

## Future Enhancements

Potential additions (not included to maintain simplicity):

- Email notifications when requests are approved
- Multiple lab environment options
- Request history and audit logs
- Student authentication system
- Integration with LDAP/SSO
- Bulk approval operations
- Request expiration/cleanup

## License

This is a demonstration project for educational purposes.

## Support

For issues or questions, refer to the source code comments which explain each component's functionality.
