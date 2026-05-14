Deno.serve(async () => {
  return Response.json(
    {
      error: 'Rooted 21 family subscriptions have been removed as part of the nonprofit transition. Donations are handled through createDonationCheckout.'
    },
    { status: 410 }
  );
});