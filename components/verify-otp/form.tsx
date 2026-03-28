"use client";

import { useState, useRef, useEffect } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OTPFormProps {
    email?: string;
}

export function OTPVerificationForm({ email = "belljerome34@gmail.com" }: OTPFormProps) {
    const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
    const [timer, setTimer] = useState(59);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
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

    const handleResend = () => {
        if (canResend) {
            setTimer(59);
            setCanResend(false);
            // Add resend logic here
            console.log("Resending OTP...");
        }
    };

    const handleVerify = () => {
        const code = otp.join("");
        console.log("Verifying code:", code);
        // Add verification logic here
    };

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
                        <span className="font-medium text-[#101828]">{email}</span>
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <div 
                    className="flex justify-between gap-2 sm:gap-4"
                    onPaste={handlePaste}
                >
                    {otp.map((data, index) => (
                        <input
                            key={index}
                            type="text"
                            maxLength={1}
                            ref={(el) => (inputRefs.current[index] = el)}
                            value={data}
                            onChange={(e) => handleChange(e.target, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className={cn(
                                "w-12 h-12 sm:w-14 sm:h-14 text-center text-lg font-semibold border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E3B5D] transition-all",
                                data ? "border-[#0E3B5D] bg-[#F0F5F9]" : "border-[#D0D5DD] bg-white"
                            )}
                        />
                    ))}
                </div>

                <Button
                    onClick={handleVerify}
                    className="w-full bg-[#0E3B5D] hover:bg-[#0E3B5D]/90 text-white py-6 text-base font-semibold rounded-lg shadow-sm"
                    disabled={otp.some(v => v === "")}
                >
                    Verify
                </Button>

                <div className="text-center">
                    <p className="text-sm text-[#475467]">
                        Resend Code in{" "}
                        <span 
                            className={cn(
                                "font-semibold transition-colors",
                                canResend ? "text-[#0E3B5D] cursor-pointer" : "text-[#0E3B5D]"
                            )}
                            onClick={handleResend}
                        >
                            {formatTime(timer)}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}
