// api/create-subscription.js
// Creates a Stripe subscription using Elements (card entered on your page)

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Monthly plans. Both include the full Academy and Academy access in the Discord.
const PLANS = {
  academy: { amount: 4999, lookup: 'aghf_academy_monthly', name: 'A Girl & Her Futures Academy™', description: 'The full Academy, tools and Academy access in the Discord.' },
  indicator: { amount: 6499, lookup: 'aghf_academy_indicator_monthly', name: 'A Girl & Her Futures Academy™ + Dayli ICC Indicator', description: 'Everything in the Academy, plus access to the Dayli ICC Indicator.' },
};
const INDICATOR_SPOTS = 100;
const LIVE = new Set(['active', 'trialing', 'past_due', 'unpaid']);

// Finds the plan's Stripe price by lookup key, creating the product and price the first time.
async function getPrice(P) {
  const found = await stripe.prices.list({ lookup_keys: [P.lookup], active: true, limit: 1 });
  if (found.data.length) return found.data[0];
  const product = await stripe.products.create({ name: P.name, description: P.description });
  return stripe.prices.create({ product: product.id, unit_amount: P.amount, currency: 'usd', recurring: { interval: 'month' }, lookup_key: P.lookup });
}

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

    // The plan decides the price. The client only sends a plan id, never an amount.
    const plan = Object.hasOwn(PLANS, req.body.plan) ? req.body.plan : 'academy';
    const P = PLANS[plan];
    const price = await getPrice(P);

    // The indicator plan is capped at INDICATOR_SPOTS live subscriptions.
    if (plan === 'indicator') {
      let taken = 0;
      for await (const sub of stripe.subscriptions.list({ price: price.id, status: 'all', limit: 100 })) {
        if (LIVE.has(sub.status) && sub.customer !== customer.id) taken++;
        if (taken >= INDICATOR_SPOTS) break;
      }
      if (taken >= INDICATOR_SPOTS) return res.status(409).json({ error: 'indicator_sold_out' });
    }

    // Create subscription with payment_behavior = default_incomplete
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price.id }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: { supabase_user_id: userId, plan },
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
