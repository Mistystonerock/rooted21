Deno.serve(async () => {
  return Response.json(
    {
      error: 'Rooted 21 family subscriptions have been removed so families can access support for free. Donations are handled through createDonationCheckout.'
    },
    { status: 410 }
  );
});