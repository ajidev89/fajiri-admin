import AuthLayout from "@/layout/auth";
import { ChangePasswordForm } from "@/components/change-password/form";

export default function ChangePasswordPage() {
    return (
        <AuthLayout>
            <ChangePasswordForm />
        </AuthLayout>
    );
}
