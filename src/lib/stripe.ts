import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with the publishable key
// We use a singleton pattern to only load the script once
let stripePromise: Promise<any> | null = null;

export const getStripe = () => {
    if (!stripePromise) {
        const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
        if (key) {
            stripePromise = loadStripe(key);
        }
    }
    return stripePromise;
};
