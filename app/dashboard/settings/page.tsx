"use client";

import * as React from "react";
import DashboardLayout from "@/layout/dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/auth-store";
import { userService } from "@/services/user";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Lock, Camera, Loader2, Save } from "lucide-react";

const profileSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    middle_name: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    dob: z.string().optional().nullable(),
    gender: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    occupation: z.string().optional().nullable(),
});

const passwordSchema = z.object({
    current_password: z.string().min(1, "Current password is required"),
    password: z.string().min(8, "New password must be at least 8 characters"),
    password_confirmation: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ["password_confirmation"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
    const { user, setUser } = useAuthStore();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            first_name: user?.profile?.first_name || "",
            last_name: user?.profile?.last_name || "",
            middle_name: user?.profile?.middle_name || "",
            phone: user?.phone || "",
            dob: user?.profile?.dob ? new Date(user.profile.dob).toISOString().split('T')[0] : "",
            gender: user?.profile?.gender || "",
            address: user?.profile?.address || "",
            occupation: user?.profile?.occupation || "",
        },
    });

    React.useEffect(() => {
        if (user) {
            profileForm.reset({
                first_name: user.profile?.first_name || "",
                last_name: user.profile?.last_name || "",
                middle_name: user.profile?.middle_name || "",
                phone: user.phone || "",
                dob: user.profile?.dob ? new Date(user.profile.dob).toISOString().split('T')[0] : "",
                gender: user.profile?.gender || "",
                address: user.profile?.address || "",
                occupation: user.profile?.occupation || "",
            });
        }
    }, [user, profileForm]);

    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            current_password: "",
            password: "",
            password_confirmation: "",
        },
    });

    const updateProfileMutation = useMutation({
        mutationFn: (data: ProfileFormValues) => userService.updateProfile(data),
        onSuccess: (res) => {
            setUser(res.data);
            toast.success("Profile updated successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update profile");
        },
    });

    const updatePasswordMutation = useMutation({
        mutationFn: (data: PasswordFormValues) => userService.changePassword(data),
        onSuccess: () => {
            toast.success("Password updated successfully");
            passwordForm.reset();
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update password");
        },
    });

    const updateAvatarMutation = useMutation({
        mutationFn: (file: File) => userService.updateAvatar(file),
        onSuccess: (res) => {
            if (user) {
                setUser({
                    ...user,
                    profile: {
                        ...user.profile,
                        avatar: res.data.avatar_url,
                    },
                });
            }
            toast.success("Avatar updated successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update avatar");
        },
    });

    const onProfileSubmit = (data: ProfileFormValues) => {
        updateProfileMutation.mutate(data);
    };

    const onPasswordSubmit = (data: PasswordFormValues) => {
        updatePasswordMutation.mutate(data);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            updateAvatarMutation.mutate(file);
        }
    };

    const initials = `${user?.profile?.first_name?.charAt(0) || ""}${user?.profile?.last_name?.charAt(0) || ""}`;

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8 pb-10">
                <div>
                    <h2 className="text-2xl font-bold text-[#101828]">Settings</h2>
                    <p className="text-sm text-[#475467]">Manage your profile and account preferences.</p>
                </div>

                <Tabs defaultValue="profile" className="w-full space-y-6">
                    <TabsList className="bg-[#F9FAFB] p-1 border border-[#EAECF0] rounded-xl h-11">
                        <TabsTrigger 
                            value="profile" 
                            className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                        >
                            Profile
                        </TabsTrigger>
                        <TabsTrigger 
                            value="password"
                            className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                        >
                            Security
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="space-y-6 animate-in fade-in duration-300">
                        <div className="bg-white rounded-3xl border border-[#EAECF0] shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-[#EAECF0] flex items-center justify-between">
                                <h3 className="font-bold text-[#101828]">Personal Information</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] bg-[#F2F4F7] px-2 py-1 rounded-md">
                                        ID: {user?.id.split('-')[0]}...
                                    </span>
                                </div>
                            </div>

                            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="p-8 space-y-8">
                                {/* Avatar Section */}
                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                    <div className="relative group">
                                        <Avatar className="h-24 w-24 ring-4 ring-[#F2F4F7]">
                                            <AvatarImage src={user?.profile?.avatar || ""} />
                                            <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={updateAvatarMutation.isPending}
                                            className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all scale-90 group-hover:scale-100 disabled:opacity-50"
                                        >
                                            {updateAvatarMutation.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Camera className="h-4 w-4" />
                                            )}
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                        />
                                    </div>
                                    <div className="text-center sm:text-left space-y-1">
                                        <h4 className="font-bold text-[#101828]">Profile Photo</h4>
                                        <p className="text-xs text-[#667085]">This will be displayed on your profile and interactions.</p>
                                        <div className="pt-2 flex gap-2 justify-center sm:justify-start">
                                            <Button 
                                                type="button"
                                                variant="outline" 
                                                size="sm" 
                                                className="h-8 text-xs bg-white border-[#D0D5DD] rounded-lg"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                Change
                                            </Button>
                                            {user?.profile?.avatar && (
                                                <Button type="button" variant="ghost" size="sm" className="h-8 text-xs text-red-600 hover:bg-red-50 rounded-lg">
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Form Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-[#344054]">First Name</Label>
                                        <Input 
                                            {...profileForm.register("first_name")} 
                                            className="h-11 rounded-xl bg-white border-[#D0D5DD] focus-visible:ring-primary/20"
                                            placeholder="First Name"
                                        />
                                        {profileForm.formState.errors.first_name && (
                                            <p className="text-xs text-red-500">{profileForm.formState.errors.first_name.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-[#344054]">Last Name</Label>
                                        <Input 
                                            {...profileForm.register("last_name")} 
                                            className="h-11 rounded-xl bg-white border-[#D0D5DD] focus-visible:ring-primary/20"
                                            placeholder="Last Name"
                                        />
                                        {profileForm.formState.errors.last_name && (
                                            <p className="text-xs text-red-500">{profileForm.formState.errors.last_name.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-[#344054]">Email Address</Label>
                                        <Input 
                                            value={user?.email || ""} 
                                            disabled 
                                            className="h-11 rounded-xl bg-[#F9FAFB] border-[#D0D5DD] opacity-70"
                                        />
                                        <p className="text-[10px] text-[#667085]">Email cannot be changed.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-[#344054]">Phone Number</Label>
                                        <Input 
                                            {...profileForm.register("phone")} 
                                            className="h-11 rounded-xl bg-white border-[#D0D5DD] focus-visible:ring-primary/20"
                                            placeholder="+234..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-[#344054]">Occupation</Label>
                                        <Input 
                                            {...profileForm.register("occupation")} 
                                            className="h-11 rounded-xl bg-white border-[#D0D5DD] focus-visible:ring-primary/20"
                                            placeholder="e.g. Software Engineer"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-[#344054]">Gender</Label>
                                        <select 
                                            {...profileForm.register("gender")}
                                            className="w-full h-11 rounded-xl bg-white border border-[#D0D5DD] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <Label className="text-sm font-semibold text-[#344054]">Address</Label>
                                        <textarea 
                                            {...profileForm.register("address")}
                                            rows={3}
                                            className="w-full rounded-xl bg-white border border-[#D0D5DD] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px]"
                                            placeholder="Your residential address"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-[#EAECF0] flex justify-end">
                                    <Button 
                                        type="submit" 
                                        disabled={updateProfileMutation.isPending}
                                        className="h-11 px-8 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold transition-all shadow-md shadow-primary/10 flex gap-2"
                                    >
                                        {updateProfileMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </TabsContent>

                    <TabsContent value="password" id="password-tab" className="space-y-6 animate-in fade-in duration-300">
                        <div className="bg-white rounded-3xl border border-[#EAECF0] shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-[#EAECF0]">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-50 rounded-lg">
                                        <Lock className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <h3 className="font-bold text-[#101828]">Security & Password</h3>
                                </div>
                            </div>

                            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="p-8 max-w-2xl space-y-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-[#344054]">Current Password</Label>
                                        <Input 
                                            type="password"
                                            {...passwordForm.register("current_password")}
                                            className="h-12 rounded-xl bg-white border-[#D0D5DD] focus-visible:ring-primary/20"
                                            placeholder="••••••••"
                                        />
                                        {passwordForm.formState.errors.current_password && (
                                            <p className="text-xs text-red-500">{passwordForm.formState.errors.current_password.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-[#344054]">New Password</Label>
                                        <Input 
                                            type="password"
                                            {...passwordForm.register("password")}
                                            className="h-12 rounded-xl bg-white border-[#D0D5DD] focus-visible:ring-primary/20"
                                            placeholder="••••••••"
                                        />
                                        {passwordForm.formState.errors.password && (
                                            <p className="text-xs text-red-500">{passwordForm.formState.errors.password.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-[#344054]">Confirm New Password</Label>
                                        <Input 
                                            type="password"
                                            {...passwordForm.register("password_confirmation")}
                                            className="h-12 rounded-xl bg-white border-[#D0D5DD] focus-visible:ring-primary/20"
                                            placeholder="••••••••"
                                        />
                                        {passwordForm.formState.errors.password_confirmation && (
                                            <p className="text-xs text-red-500">{passwordForm.formState.errors.password_confirmation.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-[#EAECF0] flex flex-col sm:flex-row gap-4 items-center justify-between">
                                    <p className="text-xs text-[#667085] max-w-xs">
                                        Password must be at least 8 characters long and include a mix of letters, numbers and symbols.
                                    </p>
                                    <Button 
                                        type="submit" 
                                        disabled={updatePasswordMutation.isPending}
                                        className="h-12 px-10 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold transition-all w-full sm:w-auto"
                                    >
                                        {updatePasswordMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : "Update Password"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
