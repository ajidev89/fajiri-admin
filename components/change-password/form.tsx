"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const changePasswordSchema = z.object({
    password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters" }),
    password_confirmation: z
        .string()
        .min(6, { message: "Password must be equal to the password" }),
});

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export function ChangePasswordForm() {
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ChangePasswordFormValues>({
        resolver: zodResolver(changePasswordSchema),
    });

    const onSubmit = (data: ChangePasswordFormValues) => {
        console.log("Form submitted:", data);
    };

    return (
        <div className="w-full max-w-sm space-y-8">
            <div className="flex flex-col items-center text-center space-y-2">
                <div className="bg-slate-100 p-2 rounded-full">
                    <Lock className="h-6 w-6 text-slate-500" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    Create New Password
                </h1>
                <p className="text-sm text-muted-foreground">
                    Please enter a new password. It must be different from the
                    previous password
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2 text-left relative">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            placeholder="Enter password"
                            type={showPassword ? "text" : "password"}
                            {...register("password")}
                            className={errors.password ? "border-red-500" : ""}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-xs text-red-500">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2 text-left relative">
                    <Label htmlFor="password">Confirm password</Label>
                    <div className="relative">
                        <Input
                            id="password_confirmation"
                            placeholder="Enter password"
                            type={showPassword ? "text" : "password"}
                            {...register("password_confirmation")}
                            className={
                                errors.password_confirmation
                                    ? "border-red-500"
                                    : ""
                            }
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-xs text-red-500">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-white py-6"
                >
                    Change password
                </Button>
            </form>
        </div>
    );
}
