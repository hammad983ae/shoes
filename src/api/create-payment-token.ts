import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { amount } = req.body;
    const response = await axios.post('https://api.chironapp.io/api/transactions/token/generate', {
      amount: amount,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_CHIRON_API_KEY'
      }
    });
    res.json({
      token: response.data.id,
      amount: amount
    });
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({ error: 'Failed to generate payment token' });
  }
} 