#!/bin/bash
set -e

# Load FTP credentials from .env
if [ -f .env ]; then
  export $(grep -E '^FTP_' .env | xargs)
fi

: "${FTP_HOST:?FTP_HOST not set in .env}"
: "${FTP_USER:?FTP_USER not set in .env}"
: "${FTP_PASS:?FTP_PASS not set in .env}"
: "${FTP_REMOTE_DIR:?FTP_REMOTE_DIR not set in .env}"

if ! command -v lftp &> /dev/null; then
  echo "lftp not found. Install it with: brew install lftp"
  exit 1
fi

echo "Building..."
npm run build

echo "Deploying to $FTP_HOST$FTP_REMOTE_DIR..."
lftp -u "$FTP_USER","$FTP_PASS" "$FTP_HOST" <<EOF
set ftp:ssl-allow no
glob -a rm -rf $FTP_REMOTE_DIR*
mirror --reverse --parallel=5 --verbose dist/ $FTP_REMOTE_DIR
bye
EOF

echo "Done."
