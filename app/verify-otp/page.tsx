import { OTPVerificationForm } from "@/components/verify-otp/form";
import AuthLayout from "@/layout/auth";

export default function VerifyOTPPage() {
    return (
        <AuthLayout>
            <OTPVerificationForm />
        </AuthLayout>
    );
}
