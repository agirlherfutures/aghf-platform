// api/create-checkout.js
// Vercel serverless function - creates Stripe checkout session

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, userId } = req.body;

  if (!email || !userId) {
    return res.status(400).json({ error: 'Email and userId required' });
  }

  try {
    import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Check if customer already exists
    const existing = await stripe.customers.list({ email, limit: 1 });
    let customer;
    if (existing.data.length > 0) {
      customer = existing.data[0];
    } else {
      customer = await stripe.customers.create({
        email,
        metadata: { supabase_user_id: userId }
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'A Girl & Her Futures™ — Trading Academy',
            description: '8 phases, 50+ lessons, all games, GP system, leaderboard & community',
          },
          unit_amount: 1499, // $14.99 in cents
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aghf-platform.vercel.app'}/agihf/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aghf-platform.vercel.app'}/agihf/?cancelled=true`,
      metadata: { supabase_user_id: userId },
      allow_promotion_codes: true,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: err.message });
  }
}
