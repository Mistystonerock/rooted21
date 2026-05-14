import Stripe from 'npm:stripe@16.12.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const { amount, donorEmail, successUrl, cancelUrl } = await req.json();
    const amountInCents = Math.round(Number(amount || 0) * 100);

    if (!amountInCents || amountInCents < 100) {
      return Response.json({ error: 'Donation amount must be at least $1.' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: donorEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Rooted 21 Mission Donation',
              description: 'Helping families feel less alone while navigating foster care, adoption, kinship care, court, CPS, trauma, and healing.'
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        purpose: 'Rooted 21 mission donation',
      },
      success_url: successUrl || 'https://rooted21.app/?donation=success',
      cancel_url: cancelUrl || 'https://rooted21.app/?donation=cancelled',
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Donation checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});