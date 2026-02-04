# Reservo - Resource Booking & Management System

<img width="2834" height="1284" alt="Screenshot 2026-02-03 225436" src="https://github.com/user-attachments/assets/5986bd99-94af-4213-8b8a-b036ca77ef84" />

A comprehensive web-based resource booking and management platform built with Next.js, Firebase, and modern UI components. This system enables organizations to efficiently manage resource reservations with role-based access control.

 

##  Overview

**Reservo** is a full-stack booking management system designed for educational institutions, organizations, or any entity that needs to manage shared resources. The platform features separate interfaces for administrators and regular users, providing comprehensive booking management, real-time availability checking, and detailed analytics.

### What Can You Do?

- **Book Resources**: Reserve facilities, equipment, or rooms with an intuitive calendar interface
- **Real-Time Availability**: Check available time slots instantly before making a booking
- **Booking Management**: Track, modify, and cancel your reservations
- **Admin Dashboard**: Comprehensive administrative controls for managing all bookings and resources
- **Analytics & Statistics**: Visualize booking trends and resource utilization
- **Announcements**: System-wide notifications for users
- **Role-Based Access**: Separate dashboards for administrators and regular users

## Key Features

### For Users

<img width="2842" height="1493" alt="Screenshot 2026-02-03 225521" src="https://github.com/user-attachments/assets/f8385909-bb28-495e-87b6-65ecfc90b59a" />


####  **Interactive Scheduler**
- Visual calendar interface for booking resources
- Real-time availability checking
- Select time slots (9 AM - 5 PM in 1-hour intervals)
- Add purpose/notes to bookings
- Instant booking confirmation


####  **User Dashboard**
- View all your bookings in one place
- Track booking status (pending, accepted, rejected, cancelled)
- Cancel bookings when needed
- Filter between upcoming and past bookings
- Detailed booking information cards
- 
<img width="2855" height="1504" alt="Screenshot 2026-02-03 225546" src="https://github.com/user-attachments/assets/ca32a354-d6b3-46cc-b186-9264b6ae3a51" />


####  **Profile Management**
- Update personal information
- View account details
- Manage contact preferences

### For Administrators

<img width="2828" height="1506" alt="Screenshot 2026-02-03 225558" src="https://github.com/user-attachments/assets/d9477769-f6fe-4f3f-b94a-7c2b074d036e" />


####  **Admin Dashboard**
- Overview of all bookings with statistics
- Interactive charts showing booking trends
- Recent bookings at a glance
- Quick access to key metrics
- Real-time data visualization


#### **Booking Management**
- Approve or reject booking requests
- View detailed booking information
- Filter and search bookings
- Manage booking statuses
- Export booking data



#### **Resource Management**
- Add, edit, and remove resources
- Set resource availability
- Configure booking rules
- Manage resource categories


#### **User Management**
- View all registered users
- Assign and modify user roles
- Manage user permissions
- Track user activity


#### **Announcements**
- Create system-wide announcements
- Schedule announcement visibility
- Notify all users of important updates
- Manage announcement priorities

#### **Statistics & Analytics**
- Visual representation of booking data
- Resource utilization metrics
- Peak usage times analysis
- Booking trends over time
- Exportable reports


### General Features

- ** Authentication**: Secure Firebase authentication with email/password
- ** Modern UI**: Built with shadcn/ui components and Tailwind CSS
- ** Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- ** Dark Mode Support**: Eye-friendly interface options
- ** Real-Time Updates**: Instant synchronization with Firebase Firestore
- ** Toast Notifications**: User-friendly feedback for all actions
- ** Role-Based Access Control**: Separate admin and user interfaces

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Tabler Icons React](https://tabler.io/icons)
- **Charts**: [Recharts](https://recharts.org/)
- **Calendar**: [@schedule-x](https://schedule-x.dev/)
- **Tables**: [TanStack Table](https://tanstack.com/table)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)

### Backend
- **Database**: [Firebase Firestore](https://firebase.google.com/products/firestore)
- **Authentication**: [Firebase Auth](https://firebase.google.com/products/auth)
- **Storage**: Firebase Storage (optional)
- **API**: Next.js API Routes

### Development Tools
- **Package Manager**: npm
- **Build Tool**: Turbopack (Next.js)
- **Runtime**: Node.js

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Firebase Account** with a project created

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/reservo.git
   cd reservo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   
   Follow the detailed instructions in [SETUP.md](./SETUP.md) to configure Firebase credentials.

   Quick summary:
   - Download your Firebase service account JSON
   - Save it as `firebase/service_account.json`
   - Copy `.env.example` to `.env.local`
   - Update environment variables

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### First Time Setup

After starting the app:

1. Create an account via the signup page
2. Check the Firebase Console to assign yourself admin role
3. Or modify `lib/userRoles.ts` to add your email as an admin

## 📁 Project Structure

```
reservo/
├── app/                      # Next.js App Router pages
│   ├── admin/               # Admin-only pages
│   │   ├── announcements/   # Announcement management
│   │   ├── bookings/        # Booking approval/management
│   │   ├── dashboard/       # Admin dashboard
│   │   ├── resources/       # Resource management
│   │   ├── statistics/      # Analytics & reports
│   │   └── users/           # User management
│   ├── user/                # User pages
│   │   ├── dashboard/       # User bookings view
│   │   ├── scheduler/       # Booking interface
│   │   ├── profile/         # User profile
│   │   └── contact/         # Contact page
│   ├── api/                 # API routes
│   │   ├── bookings/        # Booking CRUD operations
│   │   ├── availability/    # Check slot availability
│   │   ├── resources/       # Resource management
│   │   └── users/           # User operations
│   ├── login/               # Authentication pages
│   └── signup/
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── app-sidebar.tsx      # Navigation sidebar
│   ├── calendar.tsx         # Calendar component
│   ├── data-table.tsx       # Reusable data table
│   └── ...
├── firebase/                # Firebase configuration
│   ├── config.js            # Firebase Admin SDK setup
│   └── service_account.json # (Not in git - see SETUP.md)
├── lib/                     # Utility functions
│   ├── firebase.ts          # Firebase helpers
│   ├── userRoles.ts         # Role management
│   └── utils.ts             # General utilities
└── public/                  # Static assets

```

## 👥 User Roles

The system supports two primary roles:

### Admin
- Full access to all features
- Can approve/reject bookings
- Manage resources and users
- View analytics and statistics
- Create announcements
- Access admin dashboard at `/admin/dashboard`

### User (Default)
- Create and manage own bookings
- View available resources
- Check real-time availability
- Cancel own bookings
- Access user dashboard at `/user/dashboard`

To configure roles, see [ROLE_BASED_AUTH.md](./ROLE_BASED_AUTH.md)

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push your code to GitHub** (without sensitive files)
   
2. **Import project in Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository

3. **Add environment variables**
   - In Vercel project settings → Environment Variables
   - Add `FIREBASE_SERVICE_ACCOUNT` with your service account JSON content

4. **Deploy!**
   ```bash
   vercel --prod
   ```

For detailed deployment instructions including other platforms, see [SETUP.md](./SETUP.md)

### Environment Variables for Production

```bash
# Required in production
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...",...}
```

##  Security

- Firebase Authentication for secure user management
- Role-based access control (RBAC)
- API route protection
- Environment variables for sensitive data
- `.gitignore` configured to exclude credentials
- Server-side validation for all operations

##  Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

##  License

This project is open source and available under the MIT License.

##  Support

For issues, questions, or suggestions:
- Create an issue in this repository
- Contact the development team

---

**Built with ❤️ using Next.js and Firebase**
