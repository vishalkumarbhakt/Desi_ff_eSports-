# Desi FF eSports - Tournament Management Tool

🎮 **Esports Entry Fee & Prize Distribution Management Tool** for "Desi FF eSports" WhatsApp Community

## Overview

A lightweight web-based tool for managing Free Fire tournament entry fees, participant tracking, and automated prize distribution. Perfect for WhatsApp community organizers who run regular paid scrims and tournaments.

## Features

### ✅ Admin Panel
- Create tournaments with customizable settings (Solo/Duo/Squad)
- Set entry fees and slot limits
- Configure organizer commission
- Choose from multiple prize distribution templates

### 💰 Payment Tracking
- Track participant payment status (Paid/Pending)
- Store WhatsApp numbers and in-game IDs
- Easy payment status updates
- Participant management (add/delete)

### 🧮 Auto Calculations
- Total collection = Filled slots × Entry fee
- Organizer commission (configurable %)
- Net prize pool = Total collection - Commission
- Position-wise payout based on selected template

### 🏆 Results Management
- Enter tournament winners
- Auto-calculate prize amounts
- Track position-wise payouts

### 📱 WhatsApp Integration
- Generate formatted summaries
- Copy-paste ready text for WhatsApp groups
- Mobile-friendly interface

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla JS)
- **Backend**: Node.js + Express
- **Database**: SQLite3
- **Authentication**: Express-session + bcryptjs

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/vishalkumarbhakt/Desi_ff_eSports-.git
cd Desi_ff_eSports-
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open browser and go to:
```
http://localhost:3000
```

5. Login with default credentials:
- **Username**: `admin`
- **Password**: `admin123`

## Prize Distribution Templates

The tool comes with 4 pre-configured prize templates:

1. **70-20-10**: 1st: 70%, 2nd: 20%, 3rd: 10%
2. **80-20**: 1st: 80%, 2nd: 20%
3. **50-30-20**: 1st: 50%, 2nd: 30%, 3rd: 20%
4. **Winner Takes All**: 1st: 100%

## Usage Guide

For detailed usage instructions, see [USAGE_GUIDE.md](USAGE_GUIDE.md)

### Quick Workflow

1. **Create Tournament** → Set name, mode, slots, entry fee, prize template
2. **Add Participants** → Enter team names, payment status
3. **Track Payments** → Mark as paid/pending
4. **Enter Results** → Select winners for each position
5. **Share Summary** → Copy formatted text to WhatsApp

## Mobile Compatibility

✅ Fully responsive design  
✅ Works on all mobile browsers  
✅ Touch-friendly interface  
✅ Optimized for phone screens

## Project Structure

```
Desi_ff_eSports-/
├── server.js              # Express server & API endpoints
├── package.json           # Dependencies
├── esports.db            # SQLite database (auto-created)
├── public/
│   ├── index.html        # Main UI
│   ├── styles.css        # Responsive styling
│   └── app.js            # Frontend logic
├── USAGE_GUIDE.md        # Detailed usage instructions
└── README.md             # This file
```

## API Endpoints

- `POST /api/login` - Admin authentication
- `POST /api/logout` - Logout
- `GET /api/auth-status` - Check auth status
- `GET /api/templates` - Get prize templates
- `POST /api/tournaments` - Create tournament
- `GET /api/tournaments` - List all tournaments
- `GET /api/tournaments/:id` - Get tournament details
- `POST /api/tournaments/:id/participants` - Add participant
- `PUT /api/participants/:id` - Update participant
- `DELETE /api/participants/:id` - Delete participant
- `POST /api/tournaments/:id/results` - Submit results
- `GET /api/tournaments/:id/summary` - Get WhatsApp summary

## Security

- Basic authentication for admin access
- Session-based authorization  
- Password hashing with bcryptjs
- No external data transmission

### Production Security Recommendations

⚠️ **IMPORTANT**: Before deploying to production:

1. **Change Default Password**: The default admin password is `admin123`. Change it immediately after first login or set `DEFAULT_ADMIN_PASSWORD` environment variable.

2. **Set Session Secret**: Use a strong random secret for sessions:
   ```bash
   # Generate a secure secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   # Set it in .env file
   SESSION_SECRET=your-generated-secret-here
   ```

3. **Use HTTPS**: Always use HTTPS in production to encrypt data in transit and secure session cookies.

4. **Environment Variables**: Copy `.env.example` to `.env` and configure all variables:
   ```bash
   cp .env.example .env
   # Edit .env with your production values
   ```

5. **Rate Limiting** (Optional): For production with high traffic, consider adding rate limiting middleware like `express-rate-limit` to prevent abuse.

6. **CSRF Protection** (Optional): For production deployment, consider adding CSRF protection using `csurf` middleware for form submissions.

## License

MIT License

## Support

For issues or questions, please open an issue on GitHub.

---

**Made with ❤️ for Desi FF eSports Community** 🎮
