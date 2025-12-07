# Desi FF eSports - Usage Guide

## Quick Start

### Installation & Setup

1. **Install Node.js** (if not already installed)
   - Download from https://nodejs.org/
   - Recommended: Version 14 or higher

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Server**
   ```bash
   npm start
   ```

4. **Access the Application**
   - Open your web browser
   - Go to: `http://localhost:3000`
   - Default login credentials:
     - Username: `admin`
     - Password: `admin123`

## How to Use

### 1. Creating a New Tournament

1. **Login** with admin credentials
2. Click on **"Create New"** tab
3. Fill in tournament details:
   - **Tournament Name**: Example: "Friday Night Scrims"
   - **Mode**: Select Solo, Duo, or Squad
   - **Total Slots**: Number of teams/players allowed
   - **Entry Fee**: Amount in ₹ (e.g., 50)
   - **Prize Distribution Template**: Choose from available templates:
     - `70-20-10`: 1st gets 70%, 2nd gets 20%, 3rd gets 10%
     - `80-20`: 1st gets 80%, 2nd gets 20%
     - `50-30-20`: 1st gets 50%, 2nd gets 30%, 3rd gets 20%
     - `winner-takes-all`: 1st gets 100%
   - **Organizer Commission**: Percentage to deduct (e.g., 10%)
4. Click **"Create Tournament"**

### 2. Adding Participants

1. Go to **"Tournaments"** tab
2. Click on any tournament to open details
3. Click **"Add Participant"** button
4. Enter participant details:
   - **Team/Player Name**: Required
   - **WhatsApp Number**: Optional (for contact)
   - **In-Game ID**: Optional (Free Fire ID)
   - **Payment Status**: Select "Paid" or "Pending"
5. Click **"Add Participant"**

### 3. Managing Payments

- In tournament details, each participant has action buttons:
  - **Mark Paid**: Change status from Pending to Paid
  - **Mark Pending**: Change status from Paid to Pending
  - **Delete**: Remove participant (use carefully!)

### 4. Entering Tournament Results

1. Open tournament details
2. Click **"Enter Results"** button
3. Select the winning team/player for each position
4. Click **"Submit Results"**
5. The system will:
   - Calculate prize amounts automatically
   - Update participant records
   - Mark tournament as "completed"

### 5. Sharing Results on WhatsApp

1. Open tournament details
2. Click **"View Summary"** button
3. Review the formatted summary showing:
   - Tournament details
   - Total collection and commission
   - Net prize pool
   - Winners with prize amounts
4. Click **"Copy to Clipboard"**
5. Paste directly in WhatsApp group

**Example WhatsApp Summary:**
```
🏆 *Friday Night Scrims*
━━━━━━━━━━━━━━━━━
📊 Mode: squad
👥 Total Slots: 20
✅ Filled: 16
💰 Entry Fee: ₹50
━━━━━━━━━━━━━━━━━
💵 Total Collection: ₹800.00
📉 Organizer Commission (10%): ₹80.00
🎁 Net Prize Pool: ₹720.00
━━━━━━━━━━━━━━━━━
🏅 *WINNERS*
🥇 Team Alpha: ₹504.00
🥈 Team Beta: ₹144.00
🥉 Team Gamma: ₹72.00
━━━━━━━━━━━━━━━━━
Powered by Desi FF eSports 🎮
```

## Prize Distribution Templates

### Available Templates

1. **70-20-10**
   - 1st Place: 70% of prize pool
   - 2nd Place: 20% of prize pool
   - 3rd Place: 10% of prize pool

2. **80-20**
   - 1st Place: 80% of prize pool
   - 2nd Place: 20% of prize pool

3. **50-30-20**
   - 1st Place: 50% of prize pool
   - 2nd Place: 30% of prize pool
   - 3rd Place: 20% of prize pool

4. **Winner Takes All**
   - 1st Place: 100% of prize pool

### How Prize Calculation Works

**Example:**
- Entry Fee: ₹50
- Total Paid Participants: 20
- Organizer Commission: 10%
- Prize Template: 70-20-10

**Calculation:**
1. Total Collection = 20 × ₹50 = ₹1000
2. Commission = ₹1000 × 10% = ₹100
3. Net Prize Pool = ₹1000 - ₹100 = ₹900
4. Prizes:
   - 1st Place = ₹900 × 70% = ₹630
   - 2nd Place = ₹900 × 20% = ₹180
   - 3rd Place = ₹900 × 10% = ₹90

## Mobile Usage Tips

- ✅ App is fully responsive and works on mobile browsers
- ✅ Use landscape mode for better table viewing
- ✅ All features work on touch screens
- ✅ No app installation required

## Common Workflows

### Daily Scrim Workflow
1. Morning: Create tournament with entry details
2. Throughout day: Add participants as they register and pay
3. After match: Enter results
4. Share summary on WhatsApp

### Weekend Tournament Workflow
1. Create tournament in advance
2. Add all registered teams
3. Mark payments as they come in
4. After tournament: Enter top 3 positions
5. Share prize distribution

## Important Notes

- ⚠️ Only paid participants count toward prize pool
- ⚠️ Deleting participants cannot be undone
- ⚠️ Results can only be entered once per tournament
- ⚠️ Commission is deducted before prize distribution
- ⚠️ Keep track of participants' payment status accurately

## Troubleshooting

**Can't login?**
- Use default credentials: admin / admin123
- Make sure server is running

**Tournament not showing?**
- Refresh the page
- Check "Tournaments" tab

**Payment status not updating?**
- Check internet connection
- Refresh tournament details

**Summary not copying?**
- Try clicking "Copy to Clipboard" again
- Manually select and copy the text

## Data Management

- All data is stored in `esports.db` SQLite database
- Database file is created automatically on first run
- Backup the database file regularly for safety
- No data is sent to external servers

## Security

- Basic authentication protects admin access
- Session expires after 24 hours
- Change default password in production
- Keep the application behind a firewall if needed

## Support

For issues or feature requests, contact your administrator.

---

**Powered by Desi FF eSports** 🎮
