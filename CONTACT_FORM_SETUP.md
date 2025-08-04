# Contact Form Setup Guide

## Overview
The contact form system uses Supabase for data storage and Resend for email delivery. When someone submits the contact form, it:
1. Saves the request to Supabase `contact_requests` table
2. Sends a confirmation email to the user
3. Sends a notification email to cralluxmaster@protonmail.com

## Setup Steps

### 1. Database Migration
Run the migration to create the contact_requests table:
```bash
npx supabase db push
```

### 2. Supabase Edge Function
Deploy the email function:
```bash
npx supabase functions deploy send-contact-email
```

### 3. Environment Variables
Set up the following environment variables in your Supabase project:

#### In Supabase Dashboard > Settings > Edge Functions:
- `RESEND_API_KEY`: Your Resend API key

#### To get a Resend API key:
1. Sign up at [resend.com](https://resend.com)
2. Create an API key in the dashboard
3. Add it to your Supabase Edge Function secrets

### 4. Email Domain Setup
For production, you'll want to:
1. Set up a custom domain in Resend (e.g., noreply@crallux.com)
2. Update the `from` email addresses in the Edge Function

## How It Works

### Contact Form Flow:
1. User fills out the form on the Socials page
2. Form data is sent to `submitContactRequest()` function
3. Data is saved to Supabase `contact_requests` table
4. Supabase Edge Function is called to send emails
5. User receives confirmation email
6. Admin receives notification email

### Email Templates:
- **User Email**: Confirmation with their message quoted
- **Admin Email**: Notification with full details and request ID

### Database Schema:
```sql
contact_requests (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## Testing
1. Fill out the contact form on the Socials page
2. Check your email for the confirmation
3. Check cralluxmaster@protonmail.com for the notification
4. Check Supabase dashboard to see the saved request

## Troubleshooting
- Check Supabase Edge Function logs for email errors
- Verify Resend API key is correct
- Ensure email addresses are valid
- Check CORS settings if getting network errors 