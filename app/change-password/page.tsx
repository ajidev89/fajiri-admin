import AuthLayout from "@/layout/auth";
import { ChangePasswordForm } from "@/components/change-password/form";
import { Suspense } from "react";

export default function ChangePasswordPage() {
    return (
        <AuthLayout>
            <Suspense fallback={<div>Loading...</div>}>
                <ChangePasswordForm />
            </Suspense>
        </AuthLayout>
    );
}
