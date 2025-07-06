import { StatusCodes } from 'http-status-codes';
import Stripe from 'stripe';
import ApiError from '../errors/ApiErrors';
import stripe from '../config/stripe';
import { User } from '../app/modules/user/user.model';

export const handleConnectedAccount = async (data: Stripe.Account) => {

    // Find the user by Stripe account ID
    const existingUser = await User.findOne({ email: data.email });

    if (!existingUser) {
        throw new ApiError(StatusCodes.NOT_FOUND, `User not found for account ID: ${data.id}`);
    }

    

    // Check if the onboarding is complete
    if (data.charges_enabled) {
        const loginLink = await stripe.accounts.createLoginLink(data.id);
        // console.log(loginLink);
        
        // Save Stripe account information to the user record
        await User.findByIdAndUpdate(existingUser?._id, {
            accountInformation:{
                stripeAccountId: data.id,
                accountUrl: loginLink.url,

            }
        });
    }

    return;
}