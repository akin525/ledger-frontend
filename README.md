# Bills Ledger Frontend

A modern, professional Next.js 14 frontend application for the Bills Ledger backend API. This application provides a comprehensive interface for managing bills, expenses, transactions, and social features.

## Features

### ✅ Completed Features

- **Authentication System**
  - User registration and login
  - JWT token management
  - Protected routes
  - Session persistence

- **Dashboard**
  - Financial overview with summary cards
  - Total owed/owing tracking
  - Net balance calculation
  - Recent bills and transactions
  - Quick action buttons

- **Bills Management**
  - Create bills with multiple participants
  - Split bills equally or custom amounts
  - View bill details
  - Mark bills as paid
  - Filter and search bills
  - Delete bills (creator only)

- **Friends System**
  - Search and add friends
  - Send/accept/reject friend requests
  - View friends list
  - Remove friends

- **Transactions**
  - View transaction history
  - Filter by type and status
  - Transaction statistics
  - Sent/received tracking

- **Responsive Design**
  - Mobile-friendly interface
  - Collapsible sidebar
  - Adaptive layouts
  - Touch-friendly controls

### 🚧 In Progress / Planned

- Real-time messaging with Socket.IO
- Organizations management
- Notifications system
- User profile editing
- Password reset flows
- Advanced analytics

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components inspired by shadcn/ui
- **State Management**: React Hooks
- **API Client**: Axios
- **Real-time**: Socket.IO Client
- **Notifications**: Sonner (Toast)
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Bills Ledger Backend API running

## Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd bills-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   NEXT_PUBLIC_WS_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3001](http://localhost:3001)

## Project Structure

```
bills-frontend/
├── app/                          # Next.js App Router
│   ├── dashboard/               # Dashboard pages
│   │   ├── bills/              # Bills management
│   │   ├── friends/            # Friends management
│   │   ├── transactions/       # Transaction history
│   │   ├── messages/           # Messaging (planned)
│   │   ├── organizations/      # Organizations (planned)
│   │   ├── notifications/      # Notifications (planned)
│   │   └── settings/           # User settings (planned)
│   ├── login/                  # Login page
│   ├── register/               # Registration page
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page (redirects to login)
│   └── globals.css             # Global styles
├── components/                  # React components
│   ├── ui/                     # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   └── label.tsx
│   └── dashboard-layout.tsx    # Main dashboard layout
├── lib/                        # Utility libraries
│   ├── api.ts                  # API client
│   ├── socket.ts               # WebSocket client
│   └── utils.ts                # Helper functions
├── types/                      # TypeScript type definitions
│   └── index.ts                # All type definitions
├── public/                     # Static assets
├── .env.local                  # Environment variables
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Key Features Explained

### Authentication Flow

1. Users register with email, username, full name, and password
2. JWT token is stored in localStorage
3. Token is automatically included in all API requests
4. Protected routes redirect to login if not authenticated

### Bills Management

- **Create Bill**: Add title, description, amount, and participants
- **Split Options**: Split equally or set custom amounts
- **Participant Selection**: Choose from your friends list
- **Payment Tracking**: Mark your portion as paid
- **Status Updates**: Track bill status (Pending, Paid, Overdue, etc.)

### Dashboard Overview

- **Summary Cards**: Quick view of financial status
- **Recent Activity**: Latest bills and transactions
- **Net Balance**: Overall financial position
- **Quick Actions**: Fast access to common tasks

### Friends System

- **Search Users**: Find users by username, name, or email
- **Friend Requests**: Send, accept, or reject requests
- **Friends List**: View all your connections
- **Integration**: Friends appear in bill participant selection

## API Integration

The frontend communicates with the backend API using Axios. All API calls are centralized in `lib/api.ts`:

```typescript
// Example API usage
import { api } from '@/lib/api'

// Login
await api.login(email, password)

// Get bills
const bills = await api.getBills()

// Create bill
await api.createBill(billData)
```

## WebSocket Integration

Real-time features use Socket.IO (implementation in progress):

```typescript
import { socketClient } from '@/lib/socket'

// Connect
socketClient.connect(token)

// Listen for events
socketClient.onNewMessage((message) => {
  // Handle new message
})
```

## Styling Guidelines

- Uses Tailwind CSS utility classes
- Custom color scheme defined in `globals.css`
- Responsive design with mobile-first approach
- Consistent spacing and typography
- Dark mode support (planned)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:3000/api` |
| `NEXT_PUBLIC_WS_URL` | WebSocket server URL | `http://localhost:3000` |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Follow the component naming conventions
4. Test on multiple screen sizes
5. Ensure accessibility standards

## Troubleshooting

### Common Issues

**Issue**: "Failed to fetch" errors
- **Solution**: Ensure backend API is running on the correct port

**Issue**: Authentication not persisting
- **Solution**: Check localStorage is enabled in browser

**Issue**: WebSocket connection fails
- **Solution**: Verify WebSocket URL in environment variables

**Issue**: Styles not loading
- **Solution**: Run `npm install` and restart dev server

## Future Enhancements

- [ ] Real-time messaging system
- [ ] Push notifications
- [ ] Advanced analytics and charts
- [ ] Export transactions to CSV/PDF
- [ ] Multi-currency support
- [ ] Recurring bills
- [ ] Bill reminders
- [ ] Dark mode
- [ ] Mobile app (React Native)

## License

MIT

## Support

For issues and questions, please refer to the backend API documentation or create an issue in the repository.

---

Built with ❤️ using Next.js 14 and TypeScript