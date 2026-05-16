import Stripe from 'npm:stripe@16.12.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const {
      amount,
      donorEmail,
      donorFirstName,
      donorLastName,
      honorMemory,
      donationType = 'one_time',
      successUrl,
      cancelUrl
    } = await req.json();
    const amountInCents = Math.round(Number(amount || 0) * 100);
    const isMonthly = donationType === 'monthly';

    if (!amountInCents || amountInCents < 100) {
      return Response.json({ error: 'Donation amount must be at least $1.' }, { status: 400 });
    }

    const donationMetadata = {
      purpose: 'Rooted 21 mission donation',
      organization: 'Rooted 21 Parenting Network LLC',
      tax_note: 'Donations are not currently tax deductible because Rooted 21 Parenting Network LLC is an LLC.',
      donation_type: donationType,
      donor_first_name: donorFirstName || '',
      donor_last_name: donorLastName || '',
      donor_email: donorEmail || '',
      in_honor_or_memory_of: honorMemory || '',
    };

    const session = await stripe.checkout.sessions.create({
      mode: isMonthly ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      customer_email: donorEmail || undefined,
      customer_creation: isMonthly ? undefined : 'always',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: isMonthly ? 'Rooted 21 Monthly Giving' : 'Rooted 21 Mission Donation',
              description: 'Helping families feel less alone while navigating foster care, adoption, kinship care, court, CPS, trauma, and healing.'
            },
            unit_amount: amountInCents,
            ...(isMonthly ? { recurring: { interval: 'month' } } : {}),
          },
          quantity: 1,
        },
      ],
      metadata: donationMetadata,
      ...(isMonthly
        ? { subscription_data: { metadata: donationMetadata } }
        : { payment_intent_data: { receipt_email: donorEmail || undefined, metadata: donationMetadata } }),
      success_url: successUrl || 'https://rooted21parenting.org/donate?donation=success',
      cancel_url: cancelUrl || 'https://rooted21parenting.org/donate?donation=cancelled',
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Donation checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});