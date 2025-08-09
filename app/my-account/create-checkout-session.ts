// // pages/api/create-checkout-session.ts
// import { NextApiRequest, NextApiResponse } from 'next';
// import Stripe from 'stripe';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
 
// });

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

//   const { plan, email } = req.body;

//   const priceId = plan === 'monthly'
//     ? process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY
//     : process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY;

//   try {
//     const session = await stripe.checkout.sessions.create({
//       mode: 'subscription',
//       payment_method_types: ['card'],
//       customer_email: email,
//       line_items: [{ price: priceId!, quantity: 1 }],
//       success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success`,
//       cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
//       ...(plan === 'yearly' && { subscription_data: { trial_period_days: 7 } }),
//     });

//     res.status(200).json({ url: session.url });
//   } catch (err: any) {
//     res.status(500).json({ error: err.message });
//   }
// }
