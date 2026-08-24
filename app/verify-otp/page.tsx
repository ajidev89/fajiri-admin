import { OTPVerificationForm } from "@/components/verify-otp/form";
import AuthLayout from "@/layout/auth";
import { Suspense } from "react";

export default function VerifyOTPPage() {
    return (
        <AuthLayout>
            <Suspense fallback={<div>Loading...</div>}>
                <OTPVerificationForm />
            </Suspense>
        </AuthLayout>
    );
}
