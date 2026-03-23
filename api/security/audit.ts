export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { event, details } = req.body;
  console.log(`[SECURITY AUDIT] ${event}:`, details);
  res.json({ success: true });
}
