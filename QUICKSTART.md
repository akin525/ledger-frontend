# Quick Start Guide - Bills Ledger Frontend

Get up and running with the Bills Ledger frontend in 5 minutes!

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Bills Ledger Backend API running (default: http://localhost:3000)

## Installation

### Step 1: Install Dependencies

```bash
cd bills-frontend
npm install
```

### Step 2: Configure Environment

Create a `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_WS_URL=http://localhost:3000
```

### Step 3: Start Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:3001**

## First Time Setup

### 1. Create an Account

1. Navigate to http://localhost:3001
2. Click "Sign up" 
3. Fill in the registration form:
   - Full Name
   - Username (unique)
   - Email
   - Phone Number (optional)
   - Password
4. Click "Create Account"

### 2. Explore the Dashboard

After registration, you'll be redirected to the dashboard where you can see:
- Financial summary cards
- Recent bills
- Recent transactions
- Quick action buttons

### 3. Add Friends

1. Click "Friends" in the sidebar
2. Use the search bar to find users
3. Click "Add Friend" to send a request
4. Wait for them to accept

### 4. Create Your First Bill

1. Click "Create Bill" button on dashboard
2. Fill in the bill details:
   - Title (e.g., "Dinner at Restaurant")
   - Description (optional)
   - Total Amount
   - Currency
   - Due Date (optional)
3. Add participants from your friends list
4. Choose split option:
   - Click "Split Equally" for equal distribution
   - Or enter custom amounts for each participant
5. Click "Create Bill"

### 5. Manage Bills

**View Bills:**
- Click "Bills" in sidebar
- Use filters to find specific bills
- Click on a bill to view details

**Pay a Bill:**
- Open bill details
- Click "Mark as Paid" button
- Confirm the payment

**Delete a Bill (Creator Only):**
- Open bill details
- Click "Delete Bill" button
- Confirm deletion

## Common Tasks

### Update Your Profile

1. Click your avatar in the sidebar
2. Click "Settings"
3. Update your information
4. Click "Save Changes"

### View Transactions

1. Click "Transactions" in sidebar
2. Use filters to find specific transactions
3. View transaction statistics at the top

### Check Notifications

1. Click the bell icon in the top bar
2. View unread notifications
3. Click "Mark as Read" or "Mark All as Read"

## Keyboard Shortcuts

- `Ctrl/Cmd + K` - Quick search (planned)
- `Esc` - Close dialogs
- `Tab` - Navigate between fields

## Tips & Tricks

### Bill Management
- Use descriptive titles for easy identification
- Add due dates to track payment deadlines
- Split equally for simple group expenses
- Use custom amounts for unequal splits

### Friends
- Add friends before creating bills
- Search by username, name, or email
- Accept friend requests promptly

### Dashboard
- Check your net balance regularly
- Review recent activity for updates
- Use quick actions for common tasks

### Filters
- Combine search and filters for precise results
- Use status filters to track bill progress
- Filter transactions by type and status

## Troubleshooting

### Can't Login?
- Check your email and password
- Ensure backend API is running
- Clear browser cache and try again

### Bills Not Loading?
- Check internet connection
- Verify API URL in `.env.local`
- Check browser console for errors

### Friends Not Appearing?
- Ensure friend requests are accepted
- Refresh the page
- Check if backend is running

### WebSocket Issues?
- Verify WS_URL in `.env.local`
- Check firewall settings
- Ensure backend WebSocket is enabled

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Project Structure

```
bills-frontend/
├── app/                    # Next.js pages
│   ├── dashboard/         # Dashboard pages
│   ├── login/            # Login page
│   └── register/         # Registration page
├── components/            # React components
│   └── ui/               # UI components
├── lib/                  # Utilities
│   ├── api.ts           # API client
│   ├── socket.ts        # WebSocket client
│   └── utils.ts         # Helper functions
└── types/               # TypeScript types
```

## API Endpoints Used

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user
- `GET /bills` - Get bills
- `POST /bills` - Create bill
- `GET /friends` - Get friends
- `GET /transactions` - Get transactions

## Next Steps

1. **Invite Friends**: Share the app with friends to split bills
2. **Create Bills**: Start tracking shared expenses
3. **Explore Features**: Try all the features
4. **Customize Profile**: Update your profile information
5. **Stay Updated**: Check notifications regularly

## Getting Help

- **Documentation**: Check README.md for detailed info
- **Features**: See FEATURES.md for complete feature list
- **Deployment**: See DEPLOYMENT.md for deployment guide
- **API Docs**: Check backend API documentation

## Useful Links

- Frontend: http://localhost:3001
- Backend API: http://localhost:3000/api
- API Docs: Check backend documentation

---

Happy bill splitting! 🎉