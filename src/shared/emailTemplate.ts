import { ICreateAccount, IResetPassword } from '../types/emailTemplate';

const createAccount = (values: ICreateAccount) => {
    const data = {
        to: values.email,
        subject: 'Verify your account',
        html: `
            <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
                <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
    
                    <!-- Logo -->
                    <img src="https://res.cloudinary.com/ddqovbzxy/image/upload/v1749793328/linkend-cart_xm5l7d.png" alt="Linked-Cart Logo" style="display: block; margin: 0 auto 20px; width:150px" />

                    <!-- Greeting -->
                    <h2 style="color: #0F665A; font-size: 24px; margin-bottom: 20px;">Hey, ${values.name}!</h2>

                    <!-- Verification Instructions -->
                    <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Thank you for signing up for Linked-Cart. Please verify your email address to activate your account.</p>

                    <!-- OTP Section -->
                    <div style="text-align: center;">
                        <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
                        <div style="background-color: #0F665A; width: 120px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
                        <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 3 minutes.</p>
                    </div>

                    <!-- Footer -->
                    <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">If you did not sign up for Linked-Cart, please ignore this email.</p>
                    <p style="color: #999; font-size: 12px; text-align: center;">&copy; 2024 Linked-Cart. All rights reserved.</p>

                </div>
            </body>
        `
    }

    return data;
}


const resetPassword = (values: IResetPassword) => {
    const data = {
        to: values.email,
        subject: 'Reset your password',
        html: `
            <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
                <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                    <img src="https://res.cloudinary.com/ddqovbzxy/image/upload/v1749793328/linkend-cart_xm5l7d.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
                    <div style="text-align: center;">
                        <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
                        <div style="background-color: #0F665A; width: 120px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
                        <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 3 minutes.</p>
                    </div>
                </div>
            </body>
        `,
    };
    return data;
};

const addDeliveryBoy = (values:{password:string,name:string,email:string}) => {
    const data = {
        to: values.email,
        subject: 'Verify your account',
        html: `
            <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
  <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">

    <!-- Logo -->
    <img src="https://res.cloudinary.com/ddqovbzxy/image/upload/v1749793328/linkend-cart_xm5l7d.png" alt="Linked-Cart Logo" style="display: block; margin: 0 auto 20px; width:150px" />

    <!-- Greeting -->
    <h2 style="color: #0F665A; font-size: 24px; margin-bottom: 20px;">Welcome to Linked-Cart, ${values.name}!</h2>

    <!-- Intro -->
    <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
      You've been added as a <strong>Delivery Personnel</strong> by an admin. Below are your login credentials to access the delivery dashboard:
    </p>

    <!-- Credentials -->
    <div style="background-color: #f1f1f1; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
      <p style="margin: 0; font-size: 16px;"><strong>Email:</strong> ${values.email}</p>
      <p style="margin: 0; font-size: 16px;"><strong>Password:</strong> ${values.password}</p>
    </div>


    <!-- Note -->
    <p style="color: #555; font-size: 15px; line-height: 1.5; margin-bottom: 20px;">
      For security, please change your password after logging in.
    </p>

    <!-- Footer -->
    <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">If you believe this was a mistake, please contact your administrator.</p>
    <p style="color: #999; font-size: 12px; text-align: center;">&copy; 2024 Linked-Cart. All rights reserved.</p>

  </div>
</body>`
    }
    return data;
}
export const emailTemplate = {
    createAccount,
    resetPassword,
    addDeliveryBoy
};