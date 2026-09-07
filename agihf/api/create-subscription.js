// api/create-subscription.js
// Creates a Stripe subscription using Elements (card entered on your page)

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, userId, name } = req.body;
  if (!email || !userId) return res.status(400).json({ error: 'Email and userId required' });

  try {
    // Get or create Stripe customer
    const existing = await stripe.customers.list({ email, limit: 1 });
    let customer;
    if (existing.data.length > 0) {
      customer = existing.data[0];
    } else {
      customer = await stripe.customers.create({
        email,
        name: name || email,
        metadata: { supabase_user_id: userId }
      });
    }

    // Get or create price for $14.99/mo
    let price;
    const prices = await stripe.prices.list({ active: true, limit: 10 });
    price = prices.data.find(p => p.unit_amount === 1499 && p.recurring?.interval === 'month');

    if (!price) {
      const product = await stripe.products.create({
        name: 'A Girl & Her Futures™ Trading Academy',
        description: '8 phases, 50+ lessons, all games, GP system, leaderboard & community',
      });
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: 1499,
        currency: 'usd',
        recurring: { interval: 'month' },
      });
    }

    // Create subscription with payment_behavior = default_incomplete
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price.id }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: { supabase_user_id: userId },
    });

    const clientSecret = subscription.latest_invoice.payment_intent.client_secret;

    // Store pending subscription in Supabase
    await supabase.from('subscriptions').upsert({
      user_id: userId,
      stripe_customer_id: customer.id,
      stripe_subscription_id: subscription.id,
      status: 'pending',
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    }, { onConflict: 'user_id' });

    res.status(200).json({ clientSecret, customerId: customer.id });
  } catch (err) {
    console.error('Create subscription error:', err);
    res.status(500).json({ error: err.message });
  }
}
