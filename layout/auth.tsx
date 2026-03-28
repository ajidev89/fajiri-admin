import Image from "next/image";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <main className="flex min-h-screen bg-white">
            {/* Left Side: Image */}
            <div className="hidden lg:flex lg:w-1/2 relative">
                <Image
                    src="/assets/auth-img.png"
                    alt="Family smiling"
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#F8F7FC]">
                {children}
            </div>
        </main>
    );
};

export default AuthLayout;
