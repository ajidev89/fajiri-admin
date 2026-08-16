import Image from "next/image";
import Link from "next/link";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <main className="flex min-h-screen bg-[#F8F7FC] lg:bg-white selection:bg-[#0E3B5D]/10 selection:text-[#0E3B5D]">
            {/* Left Side: Brand Image (Desktop) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-[#0E3B5D] overflow-hidden">
                <Image
                    src="/assets/auth-img.png"
                    alt="Fajiri Community"
                    fill
                    className="object-cover"
                    priority
                />
                {/* Subtle dark gradient overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />
                
                {/* Top Brand Tag on Desktop image */}
                <div className="absolute top-8 left-8 z-10">
                    <Link
                        href="/login"
                        className="inline-flex items-center bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-sm hover:shadow-md transition-all hover:scale-[1.02]"
                    >
                        <Image
                            src="/logo.svg"
                            alt="Fajiri Logo"
                            width={110}
                            height={38}
                            className="h-7 w-auto object-contain"
                            priority
                        />
                    </Link>
                </div>
            </div>

            {/* Right Side: Responsive Auth Form & Top Mobile Logo */}
            <div className="w-full lg:w-1/2 flex flex-col justify-between min-h-screen bg-[#F8F7FC] px-4 py-6 sm:px-8 sm:py-10 md:px-12">
                {/* Top Logo - prominent on Mobile, subtle on Desktop */}
                <div className="w-full flex justify-center lg:justify-start pt-2 sm:pt-4">
                    <Link
                        href="/login"
                        className="inline-flex items-center p-2 rounded-2xl transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#0E3B5D]/20"
                    >
                        <Image
                            src="/logo.svg"
                            alt="Fajiri Logo"
                            width={140}
                            height={48}
                            className="h-10 sm:h-11 w-auto object-contain"
                            priority
                        />
                    </Link>
                </div>

                {/* Form Content Card */}
                <div className="w-full flex items-center justify-center my-auto py-6 sm:py-8">
                    <div className="w-full max-w-[420px] bg-white lg:bg-transparent p-6 sm:p-8 lg:p-0 rounded-3xl lg:rounded-none shadow-sm lg:shadow-none border border-slate-200/60 lg:border-none">
                        {children}
                    </div>
                </div>

                {/* Footer / Copyright */}
                <div className="w-full text-center text-xs text-slate-400 py-3">
                    &copy; {new Date().getFullYear()} Fajiri. All rights reserved.
                </div>
            </div>
        </main>
    );
};

export default AuthLayout;
