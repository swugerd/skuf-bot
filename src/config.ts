import dotenv from 'dotenv';

dotenv.config();

const { BOT_TOKEN, CLIENT_ID } = process.env;

if (!BOT_TOKEN || !CLIENT_ID) {
  throw new Error('Missing environment variables');
}

export const config = {
  BOT_TOKEN,
  CLIENT_ID,
};
