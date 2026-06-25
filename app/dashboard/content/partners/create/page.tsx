"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/layout/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ChevronRight,
    Eye,
    X,
    UploadCloud,
    Globe,
    Target,
    Zap,
    Plus,
} from "lucide-react";
import { partnerService, countryService, type Country } from "@/services";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

const TagInput = ({ 
    label, 
    tags, 
    setTags, 
    placeholder 
}: { 
    label: string, 
    tags: string[], 
    setTags: (tags: string[]) => void, 
    placeholder: string 
}) => {
    const [input, setInput] = React.useState("");

    const addTag = () => {
        if (input.trim() && !tags.includes(input.trim())) {
            setTags([...tags, input.trim()]);
            setInput("");
        }
    };

    const removeTag = (index: number) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-3">
            <Label className="text-sm font-semibold text-[#344054]">{label}</Label>
            <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag, index) => (
                    <span 
                        key={index} 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F2F4F7] text-[#344054] text-sm font-medium border border-[#D0D5DD]"
                    >
                        {tag}
                        <button 
                            type="button" 
                            onClick={() => removeTag(index)}
                            className="text-[#98A2B3] hover:text-[#667085] transition-colors"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </span>
                ))}
            </div>
            <div className="flex gap-2">
                <Input
                    placeholder={placeholder}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            addTag();
                        }
                    }}
                    className="h-11 border-[#D0D5DD] shadow-none focus-visible:ring-primary/20"
                />
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addTag}
                    className="h-11 border-[#D0D5DD] text-[#344054]"
                >
                    Add
                </Button>
            </div>
        </div>
    );
};

export default function CreatePartnerPage() {
    const router = useRouter();

    const [name, setName] = React.useState("");
    const [about, setAbout] = React.useState("");
    const [website, setWebsite] = React.useState("");
    const [focusAreas, setFocusAreas] = React.useState<string[]>([]);
    const [impact, setImpact] = React.useState<string[]>([]);
    const [logo, setLogo] = React.useState<File | null>(null);
    const [logoPreview, setLogoPreview] = React.useState<string | null>(null);
    const [countries, setCountries] = React.useState<Country[]>([]);
    const [countryId, setCountryId] = React.useState<string>("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    React.useEffect(() => {
        const fetchCountries = async () => {
            try {
                const res = await countryService.getCountries();
                setCountries(res.data || []);
            } catch (error) {
                console.error("Failed to fetch countries", error);
            }
        };
        fetchCountries();
    }, []);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogo(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePublish = async () => {
        if (!name || !about) {
            toast.error("Please fill in all required fields (Name, About)");
            return;
        }

        setIsSubmitting(true);
        try {
            await partnerService.createPartner({
                name,
                about,
                website: website || undefined,
                focus_areas: focusAreas,
                impact: impact,
                logo: logo || undefined,
                country_id: countryId && countryId !== "none" ? countryId : undefined,
            });
            toast.success("Partner created successfully");
            router.push("/dashboard/content?tab=partners");
        } catch (error: any) {
            toast.error(error.message || "Failed to create partner");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
                {/* Header / Breadcrumbs */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm">
                        <Link
                            href="/dashboard/content?tab=partners"
                            className="text-[#667085] hover:text-primary transition-colors"
                        >
                            Back
                        </Link>
                        <ChevronRight className="h-4 w-4 text-[#D0D5DD]" />
                        <span className="font-semibold text-[#101828]">
                            Add New Partner
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            className="h-10 bg-primary hover:bg-primary/90 text-white font-semibold px-8"
                            onClick={handlePublish}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Adding..." : "Add Partner"}
                        </Button>
                        <button
                            className="text-sm font-semibold text-red-600 hover:text-red-700 ml-2"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
                    {/* Left Column - Main Details */}
                    <div className="bg-white rounded-3xl border border-[#EAECF0] shadow-sm p-8 space-y-8">
                        <div>
                            <h4 className="font-bold text-[#101828] mb-1">Partner Profile</h4>
                            <p className="text-sm text-[#475467]">Basic information and partnership details.</p>
                        </div>

                        {/* Name Field */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-[#344054]">
                                Partner Name
                            </Label>
                            <Input
                                placeholder="Enter organization name"
                                className="h-14 bg-white border-[#D0D5DD] text-lg font-medium shadow-none focus-visible:ring-primary/20 placeholder:text-[#98A2B3]"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        {/* About Editor */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-[#344054]">
                                About Partner
                            </Label>
                            <RichTextEditor
                                value={about}
                                onChange={setAbout}
                                placeholder="Tell us about this partner..."
                            />
                        </div>

                        {/* website */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-[#344054]">
                                Website URL
                            </Label>
                            <div className="relative">
                                <Input
                                    placeholder="https://example.com"
                                    className="h-12 pl-10 bg-white border-[#D0D5DD] shadow-none focus-visible:ring-primary/20"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                />
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085]" />
                            </div>
                        </div>

                        {/* Country Select */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-[#344054]">
                                Country (Optional)
                            </Label>
                            <Select
                                value={countryId}
                                onValueChange={setCountryId}
                            >
                                <SelectTrigger className="h-14 bg-white border-[#D0D5DD] shadow-none focus-visible:ring-primary/20">
                                    <SelectValue placeholder="Select Country" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {countries.map((c) => (
                                        <SelectItem
                                            key={c.id}
                                            value={c.id.toString()}
                                        >
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <TagInput 
                                label="Focus Areas"
                                placeholder="e.g. Education"
                                tags={focusAreas}
                                setTags={setFocusAreas}
                            />
                            <TagInput 
                                label="Key Impacts"
                                placeholder="e.g. 5000+ Students"
                                tags={impact}
                                setTags={setImpact}
                            />
                        </div>
                    </div>

                    {/* Right Column - Assets & Metadata */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl border border-[#EAECF0] shadow-sm overflow-hidden">
                            <div className="px-8 py-5 border-b border-[#EAECF0]">
                                <h4 className="font-bold text-[#101828]">
                                    Partner Logo
                                </h4>
                            </div>
                            <div className="p-8">
                                <div
                                    className="border-2 border-dashed border-[#D0D5DD] rounded-2xl p-6 flex flex-col items-center justify-center gap-3 bg-[#F9FAFB] group hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden aspect-square"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                >
                                    {logoPreview ? (
                                        <img
                                            src={logoPreview}
                                            alt="Preview"
                                            className="absolute inset-0 w-full h-full object-contain p-4"
                                        />
                                    ) : (
                                        <>
                                            <div className="h-12 w-12 rounded-full bg-white border border-[#EAECF0] shadow-sm flex items-center justify-center text-[#667085] group-hover:text-primary transition-colors">
                                                <UploadCloud className="h-6 w-6" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm text-[#475467]">
                                                    <span className="text-primary font-bold">Click to upload</span> logo
                                                </p>
                                                <p className="text-xs text-[#667085] mt-1">
                                                    PNG, JPG or SVG (Max. 2MB)
                                                </p>
                                            </div>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleLogoChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-primary/5 rounded-3xl border border-primary/10 p-8 space-y-4">
                            <div className="flex items-center gap-3 text-primary">
                                <Zap className="h-5 w-5" />
                                <h5 className="font-bold">Pro Tip</h5>
                            </div>
                            <p className="text-sm text-[#475467] leading-relaxed">
                                Highlight a partner's unique contributions by adding multiple **Impact** points. This helps donors see exactly where their support goes.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
