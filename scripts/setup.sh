#!/bin/bash
# Setup script for BP Tracker
# Run this after cloning: bash scripts/setup.sh

ENV_FILE=".env.local"

if [ -f "$ENV_FILE" ]; then
  echo "✅ $ENV_FILE already exists. Skipping."
  exit 0
fi

echo "Creating $ENV_FILE with Firebase config..."

cat > "$ENV_FILE" << 'EOF'
# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCmMNWoXUzy3Qerg23G1UdO1V3CEqOytMg
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=bptracker-ccb12.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=bptracker-ccb12
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=bptracker-ccb12.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=289690333025
NEXT_PUBLIC_FIREBASE_APP_ID=1:289690333025:web:0ac68a039733d4d96b1f20

# Resend (for email sharing)
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=BP Tracker <onboarding@resend.dev>
EOF

echo "✅ $ENV_FILE created successfully!"
echo ""
echo "Next steps:"
echo "  1. npm install"
echo "  2. npm run dev"
