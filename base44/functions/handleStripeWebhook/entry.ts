import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@16.12.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();
    
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')
    );

    const base44 = createClientFromRequest(req);

    // Handle subscription events
    if (event.type === 'customer.subscription.created') {
      const subscription = event.data.object;
      const userEmail = subscription.metadata?.base44_user_email || 
                       (await stripe.customers.retrieve(subscription.customer))?.email;

      await base44.entities.Subscription.updateMany(
        { stripe_customer_id: subscription.customer },
        {
          status: 'active',
          stripe_subscription_id: subscription.id,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
        }
      );

      // Send confirmation email
      await base44.integrations.Core.SendEmail({
        to: userEmail,
        subject: 'Welcome to Rooted 21 - Subscription Confirmed',
        body: `Hi,\n\nYour 7-day free trial is now active! You'll be charged $19.99 on day 8.\n\nYou can manage your subscription anytime in your account settings.\n\nWelcome to the Rooted 21 community!\n\nMisty Stonerock\nROOTED 21`
      });
    }

    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object;
      
      await base44.entities.Subscription.updateMany(
        { stripe_customer_id: invoice.customer },
        {
          status: 'active',
          last_payment_status: 'succeeded',
          last_payment_date: new Date(invoice.created * 1000).toISOString()
        }
      );
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      const customer = await stripe.customers.retrieve(invoice.customer);
      
      await base44.entities.Subscription.updateMany(
        { stripe_customer_id: invoice.customer },
        {
          status: 'past_due',
          last_payment_status: 'failed'
        }
      );

      // Send payment failed email
      await base44.integrations.Core.SendEmail({
        to: customer.email,
        subject: 'Payment Failed - Rooted 21 Subscription',
        body: `Hi,\n\nWe were unable to process your subscription payment. Please update your payment method in your account settings.\n\nIf you have questions, contact support.\n\nRooted 21 Team`
      });
    }

    if (event.type === 'customer.subscription.deleted') {
      await base44.entities.Subscription.updateMany(
        { stripe_subscription_id: event.data.object.id },
        { status: 'canceled' }
      );
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 400 });
  }
});