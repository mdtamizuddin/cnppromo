const transporter = require('./transporter');

const EMAIL_FROM = process.env.EMAIL_FROM || process.env.EMAIL_ADDRESS || 'support@cnppromo.com';
const CLIENT_URL = process.env.CLIENT_URL || 'https://cnppromo.com';

const sendResetCode = async (email, code) => {
    if (!email) {
        throw new Error("No recipient email address specified");
    }
    try {
        const mail = await transporter.sendMail({
            from: `"CNP-PROMO Support" <${EMAIL_FROM}>`,
            to: email,
            subject: "Reset Password - CNP-PROMO",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                    <h2 style="color: #050C9C;">পাসওয়ার্ড রিসেট করুন</h2>
                    <p>আপনার CNP-PROMO অ্যাকাউন্টের পাসওয়ার্ড রিসেট করার জন্য নিচের লিংকে ক্লিক করুন:</p>
                    <p style="margin: 24px 0;">
                        <a href="${CLIENT_URL}/forgot-password?code=${code}" style="background-color: #050C9C; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                            পাসওয়ার্ড রিসেট লিংক
                        </a>
                    </p>
                    <p style="color: #666; font-size: 13px;">এই লিংকটি ১ ঘণ্টার জন্য কার্যকর থাকবে। আপনি যদি এই অনুরোধ না করে থাকেন, তবে এই ইমেইলটি উপেক্ষা করুন।</p>
                </div>
            `
        });
        return mail;
    } catch (error) {
        console.error("Mailer sendResetCode error:", error.message);
        throw new Error(error.message || "Failed to send reset email");
    }
};

const mailerService = {
    sendResetCode
};

module.exports = mailerService;