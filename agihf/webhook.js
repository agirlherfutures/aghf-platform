// api/webhook.js
// Handles Stripe webhook events - activates user subscription in Supabase

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const { createClient } = require('@supabase/supabase-js');

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  const session = event.data.object;
  const userId = session.metadata?.supabase_user_id;

  switch (event.type) {
    case 'checkout.session.completed': {
      if (!userId) break;
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      await supabase.from('subscriptions').upsert({
        user_id: userId,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        status: 'active',
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      }, { onConflict: 'user_id' });
      break;
    }
    case 'invoice.payment_succeeded': {
      const sub = await stripe.subscriptions.retrieve(session.subscription);
      const uid = sub.metadata?.supabase_user_id || userId;
      if (!uid) break;
      await supabase.from('subscriptions').update({
        status: 'active',
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      }).eq('stripe_subscription_id', session.subscription);
      break;
    }
    case 'customer.subscription.deleted': {
      await supabase.from('subscriptions').update({
        status: 'cancelled',
      }).eq('stripe_subscription_id', session.id);
      break;
    }
  }

  res.status(200).json({ received: true });
}

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

export const config = { api: { bodyParser: false } };
