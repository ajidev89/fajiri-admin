import { LoginForm } from "@/components/login/form";
import AuthLayout from "@/layout/auth";

export default function LoginPage() {
    return (
        <AuthLayout>
            <LoginForm />
        </AuthLayout>
    );
}
