"use client";

import { useState, useRef, useEffect } from "react";
import { Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { authService, otpService } from "@/services";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import Cookies from "js-cookie";
import { encryptData } from "@/lib/crypto";

import { toast } from "sonner";

export function OTPVerificationForm() {
    const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
    const [timer, setTimer] = useState(59);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = useAuthStore((state) => state.loginEmail);
    const otpFlowFromStore = useAuthStore((state) => state.otpFlow);

    const flow = searchParams.get("flow") || otpFlowFromStore || "login";

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input
        if (element.value !== "" && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        index: number,
    ) => {
        if (e.key === "Backspace") {
            if (otp[index] === "" && index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        const data = e.clipboardData.getData("text").slice(0, 6);
        if (!/^\d+$/.test(data)) return;

        const newOtp = [...otp];
        data.split("").forEach((char, index) => {
            if (index < 6) {
                newOtp[index] = char;
            }
        });
        setOtp(newOtp);
        inputRefs.current[Math.min(data.length, 5)]?.focus();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const resendMutation = useMutation({
        mutationFn: () =>
            otpService.sendOtp({ channel: "email", identifier: email || "" }),
        onSuccess: () => {
            setTimer(59);
            setCanResend(false);
            toast.success("Verification code resent successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to resend verification code");
        },
    });

    const verifyMutation = useMutation({
        mutationFn: (code: string) => {
            if (flow === "reset-password") {
                return otpService.verifyOtp({
                    channel: "email",
                    identifier: email || "",
                    code,
                });
            } else {
                return authService.generateToken({
                    channel: "email",
                    identifier: email || "",
                    code,
                });
            }
        },
        onSuccess: (response: any) => {
            if (flow === "reset-password") {
                const token = response.data?.token;
                if (token) {
                    toast.success("OTP verified. Please enter your new password.");
                    router.push(
                        `/change-password?token=${encodeURIComponent(token)}`,
                    );
                } else {
                    toast.error("Failed to retrieve reset token");
                }
            } else {
                if (response.data?.token) {
                    // Save encrypted token in cookies for 24 hours
                    const encryptedToken = encryptData(response.data.token);
                    Cookies.set("fajiri_token", encryptedToken, {
                        expires: 1,
                    });
                    toast.success("Verification successful");
                    router.push("/dashboard");
                }
            }
        },
        onError: (error: any) => {
            toast.error(error.message || "Invalid or expired verification code");
        },
    });

    const handleResend = () => {
        if (canResend && !resendMutation.isPending) {
            resendMutation.mutate();
        }
    };

    const handleVerify = () => {
        const code = otp.join("");
        if (code.length === 6) {
            verifyMutation.mutate(code);
        }
    };

    if (!email) {
        // If no email is in store, redirect back to login
        useEffect(() => {
            router.push("/login");
        }, [email, router]);
        return null;
    }

    return (
        <div className="w-full max-w-md space-y-8 px-4 sm:px-0">
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-[#E9EEF2] p-4 rounded-full">
                    <Mail className="h-6 w-6 text-[#0E3B5D]" />
                </div>
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-[#101828]">
                        OTP Verification
                    </h1>
                    <p className="text-sm text-[#475467]">
                        We've sent a verification code to email address <br />
                        <span className="font-medium text-[#101828]">
                            {email}
                        </span>
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <div
                    className="flex justify-center gap-1.5 sm:gap-3 md:gap-4"
                    onPaste={handlePaste}
                >
                    {otp.map((data, index) => (
                        <input
                            key={index}
                            type="text"
                            maxLength={1}
                            ref={(el) => {
                                inputRefs.current[index] = el;
                            }}
                            value={data}
                            onChange={(e) => handleChange(e.target, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className={cn(
                                "w-10 h-12 sm:w-12 sm:h-14 md:w-14 md:h-14 text-center text-lg sm:text-xl font-bold border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0E3B5D] transition-all",
                                data
                                    ? "border-[#0E3B5D] bg-[#F0F5F9] text-[#0E3B5D]"
                                    : "border-[#D0D5DD] bg-white text-[#101828]",
                            )}
                            disabled={verifyMutation.isPending}
                        />
                    ))}
                </div>

                <Button
                    onClick={handleVerify}
                    className="w-full bg-[#0E3B5D] hover:bg-[#0E3B5D]/90 text-white py-6 text-base font-semibold rounded-lg shadow-sm"
                    disabled={
                        otp.some((v) => v === "") || verifyMutation.isPending
                    }
                >
                    {verifyMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        "Verify"
                    )}
                </Button>

                <div className="text-center">
                    <p className="text-sm text-[#475467]">
                        {resendMutation.isPending ? (
                            "Resending..."
                        ) : (
                            <>
                                Resend Code in{" "}
                                <span
                                    className={cn(
                                        "font-semibold transition-colors",
                                        canResend
                                            ? "text-primary cursor-pointer hover:underline"
                                            : "text-[#0E3B5D]",
                                    )}
                                    onClick={handleResend}
                                >
                                    {formatTime(timer)}
                                </span>
                            </>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}
