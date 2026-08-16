"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { decryptData } from "@/lib/crypto";

const changePasswordSchema = z
    .object({
        password: z
            .string()
            .min(6, { message: "Password must be at least 6 characters" }),
        password_confirmation: z
            .string()
            .min(6, { message: "Password confirmation must be at least 6 characters" }),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: "Passwords do not match",
        path: ["password_confirmation"],
    });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export function ChangePasswordForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ChangePasswordFormValues>({
        resolver: zodResolver(changePasswordSchema),
    });

    const changePasswordMutation = useMutation({
        mutationFn: (data: ChangePasswordFormValues) => {
            const token =
                searchParams.get("token") ||
                (() => {
                    const encrypted = Cookies.get("fajiri_token");
                    return encrypted ? decryptData(encrypted) : "";
                })();

            return authService.changePassword({
                token: token || "",
                password: data.password,
                password_confirmation: data.password_confirmation,
            });
        },
        onSuccess: () => {
            toast.success("Password changed successfully! Please log in.");
            router.push("/login");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to change password");
        },
    });

    const onSubmit = (data: ChangePasswordFormValues) => {
        changePasswordMutation.mutate(data);
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
                            disabled={changePasswordMutation.isPending}
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
                    <Label htmlFor="password_confirmation">Confirm password</Label>
                    <div className="relative">
                        <Input
                            id="password_confirmation"
                            placeholder="Confirm password"
                            type={showConfirmPassword ? "text" : "password"}
                            {...register("password_confirmation")}
                            className={
                                errors.password_confirmation
                                    ? "border-red-500"
                                    : ""
                            }
                            disabled={changePasswordMutation.isPending}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                    {errors.password_confirmation && (
                        <p className="text-xs text-red-500">
                            {errors.password_confirmation.message}
                        </p>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-white py-6"
                    disabled={changePasswordMutation.isPending}
                >
                    {changePasswordMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        "Change password"
                    )}
                </Button>
            </form>
        </div>
    );
}
