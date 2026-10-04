# Karibu

Location-based matchmaking for people in Kenya. This repo is a Netlify-ready frontend. Accounts, likes, matches, and chats in this version are stored in the browser so you can demo the product before wiring a real backend.

## Stack

- Static HTML, CSS, and JavaScript
- Netlify publish directory: site root
- Planned backend: Supabase or Node + PostgreSQL, plus M-Pesa via a payment provider

## Demo

Open the site, create a profile, allow location (or pick a county), then like people nearby. A mutual like opens chat.

## Deploy

Netlify: import `gachiesamuel14/karibu-dating`, build command empty, publish directory `.`

## Next production steps

1. Auth (phone OTP is common in Kenya)
2. Postgres profiles + PostGIS distance queries
3. Photo storage
4. Realtime chat
5. Report/block moderation
6. M-Pesa STK push for premium
