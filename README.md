# Family Planner 📅

A simple, intuitive weekly planning app for families. Organize tasks, assign responsibilities, and stay on track together.

![Family Planner](https://img.shields.io/badge/Next.js-15-black?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square)

## Features

- 📆 **Weekly View** - Organize tasks by day with an intuitive calendar interface
- 👥 **Family Collaboration** - Assign tasks to family members and share responsibilities
- 🔔 **Push Notifications** - Get reminders for upcoming tasks on any device
- 🔄 **Recurring Tasks** - Set up weekly routines that repeat automatically
- 📱 **PWA Support** - Install on your phone's home screen for quick access
- 📊 **History & Progress** - Track completion rates and review past weeks

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Hosting**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A Supabase account (free tier works great)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd family-planner
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the schema in `supabase-schema.sql`
3. Go to **Settings > API** and copy your project URL and anon key

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add your environment variables in the Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set these in your Vercel project settings:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Database Schema

The app uses the following tables:

- **families** - Family groups with invite codes
- **users** - User profiles linked to Supabase Auth
- **categories** - Task categories (customizable)
- **tasks** - Individual tasks with assignments
- **recurring_templates** - Templates for recurring tasks

See `supabase-schema.sql` for the complete schema with RLS policies.

## PWA Setup

The app is PWA-ready. To enable push notifications:

1. Generate VAPID keys:
   ```bash
   npx web-push generate-vapid-keys
   ```

2. Add to your environment:
   ```env
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key
   VAPID_PRIVATE_KEY=your-private-key
   ```

### Creating App Icons

The app includes an SVG icon at `/public/icons/icon.svg`. To generate all required PNG sizes, you can use a tool like [realfavicongenerator.net](https://realfavicongenerator.net/) or run:

```bash
# Using ImageMagick
for size in 72 96 128 144 152 192 384 512; do
  convert public/icons/icon.svg -resize ${size}x${size} public/icons/icon-${size}x${size}.png
done
```

## Project Structure

```
family-planner/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Landing page
│   │   ├── login/             # Login page
│   │   ├── signup/            # Signup page
│   │   ├── onboarding/        # Family setup
│   │   ├── dashboard/         # Main weekly view
│   │   ├── history/           # Past weeks
│   │   └── settings/          # User & category settings
│   ├── components/            # React components
│   ├── lib/                   # Utilities & Supabase clients
│   └── types/                 # TypeScript types
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   └── icons/                 # App icons
└── supabase-schema.sql        # Database schema
```

## Usage Guide

### Creating a Family

1. Sign up with your email
2. Choose "Create a new family"
3. Name your family (e.g., "The Smiths")
4. Share the invite code with your partner

### Joining a Family

1. Sign up with your email
2. Choose "Join existing family"
3. Enter the 8-character invite code

### Managing Tasks

- Click **+** on any day to add a task
- Assign tasks to yourself or your partner
- Set categories for organization
- Enable "Recurring" for weekly repeating tasks
- Click the checkbox to mark tasks complete

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this for your own family planning needs!
