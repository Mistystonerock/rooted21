import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@16.12.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { successUrl, cancelUrl } = await req.json();

    // Check for existing subscription
    const existing = await base44.entities.Subscription.filter(
      { user_email: user.email },
      '-created_date',
      1
    );

    let customerId = existing[0]?.stripe_customer_id;

    // Create or retrieve Stripe customer
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name,
        metadata: {
          base44_user_email: user.email
        }
      });
      customerId = customer.id;
      
      // Save the customer ID
      if (existing[0]) {
        await base44.entities.Subscription.update(existing[0].id, {
          stripe_customer_id: customerId
        });
      } else {
        await base44.entities.Subscription.create({
          user_email: user.email,
          account_type: 'private',
          status: 'trial',
          stripe_customer_id: customerId,
          trial_start_date: new Date().toISOString(),
          trial_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Rooted 21 Private Membership',
              description: '7-day free trial, then $14.99/month. Cancel anytime.'
            },
            unit_amount: 1499,
            recurring: {
              interval: 'month',
              interval_count: 1
            }
          },
          quantity: 1
        }
      ],
      subscription_data: {
        trial_period_days: 7
      },
      success_url: successUrl || 'https://rooted21.app/billing?success=true',
      cancel_url: cancelUrl || 'https://rooted21.app/billing?canceled=true'
    });

    return Response.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});