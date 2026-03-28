"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function ForgetPasswordForm() {
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = (data: LoginFormValues) => {
        console.log("Form submitted:", data);
    };

    return (
        <div className="w-full max-w-sm space-y-8">
            <div className="flex flex-col items-center text-center space-y-2">
                <div className="bg-slate-100 p-2 rounded-full">
                    <User className="h-6 w-6 text-slate-500" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    Forget Password
                </h1>
                <p className="text-sm text-muted-foreground">
                    Enter your email address and we’ll send you password reset
                    instructions
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2 text-left">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        id="email"
                        placeholder="Enter email address"
                        type="email"
                        {...register("email")}
                        className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                        <p className="text-xs text-red-500">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-white py-6"
                >

                    Send OTP
                </Button>
            </form>
        </div>
    );
}
