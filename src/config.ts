import dotenv from 'dotenv';

dotenv.config();

const { BOT_TOKEN, CLIENT_ID, YOUTUBE_COOKIES } = process.env;

if (!BOT_TOKEN || !CLIENT_ID || !YOUTUBE_COOKIES) {
  throw new Error('Missing environment variables');
}

export const config = {
  BOT_TOKEN,
  CLIENT_ID,
  YOUTUBE_COOKIES,
};
