"use client";

import * as React from "react";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OtpInput } from "@/components/ui/otp-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { 
    CheckCircle2, 
    XCircle, 
    Clock, 
    ShieldCheck, 
    FileText, 
    Building2, 
    User, 
    SendHorizontal, 
    ArrowLeft, 
    ArrowRight, 
    UploadCloud, 
    AlertCircle, 
    Copy, 
    Check, 
    Lock, 
    CreditCard, 
    Wallet, 
    Globe, 
    HelpCircle, 
    CheckCircle,
    Receipt
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
    Disbursement, 
    disbursementService, 
    CampaignFinancials, 
    ComplianceEvaluation, 
    FeeCalculation 
} from "@/services/disbursements";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { campaignService } from "@/services/campaigns";

interface DisbursementModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    campaignId?: string;
}

const RECIPIENT_TYPES = [
    { value: "campaign_owner", label: "Campaign Owner", desc: "Disburse directly to the campaign creator" },
    { value: "individual_beneficiary", label: "Individual Beneficiary", desc: "Third-party patient, student, or individual in need" },
    { value: "organization", label: "Organization / NGO", desc: "Registered charity, hospital, or educational institution" },
    { value: "vendor_service_provider", label: "Vendor / Service Provider", desc: "Direct payment for medical supplies, equipment, or services" },
    { value: "multiple_beneficiaries", label: "Multiple Beneficiaries", desc: "Disburse to multi-party aid recipients" },
];

const PAYOUT_METHODS = [
    { value: "local_bank_transfer", label: "Local Bank Transfer", icon: Building2, desc: "Direct domestic clearing / NIP" },
    { value: "sepa", label: "SEPA Transfer (EUR)", icon: Globe, desc: "European single payment area" },
    { value: "ach", label: "ACH Transfer (USD)", icon: Building2, desc: "US Automated Clearing House" },
    { value: "swift", label: "SWIFT Wire Transfer", icon: Globe, desc: "International cross-border wire" },
    { value: "mobile_money", label: "Mobile Money", icon: CreditCard, desc: "M-Pesa, MTN MoMo, Airtel" },
    { value: "platform_wallet", label: "Platform Wallet", icon: Wallet, desc: "Instant internal user wallet" },
];

const PURPOSES = [
    "Medical Treatment / Surgery",
    "Hospital Bill Clearance",
    "Prescription Medication & Supplies",
    "Tuition & Educational Fees",
    "Disaster Relief & Emergency Food/Shelter",
    "Equipment / Borehole Installation",
    "Operational & Logistics Expense",
    "Other Charitable Purpose",
];

export function DisbursementModal({
    isOpen,
    onOpenChange,
    campaignId: propCampaignId,
}: DisbursementModalProps) {
    const queryClient = useQueryClient();

    // Active Step (1 to 9)
    const [step, setStep] = React.useState(1);

    // Selected Campaign
    const [selectedCampaignId, setSelectedCampaignId] = React.useState<string>(propCampaignId || "");

    // Form Data
    const [formData, setFormData] = React.useState({
        recipient_type: "individual_beneficiary",
        beneficiary_name: "",
        recipient_country: "NG",
        recipient_email: "",
        recipient_phone: "",
        payout_method: "local_bank_transfer",
        account_name: "",
        account_number: "",
        bank_name: "",
        bank_code: "",
        routing_number: "",
        swift_bic: "",
        iban: "",
        amount: "",
        currency: "USD",
        target_currency: "USD",
        fee_bearer: "campaign" as "campaign" | "recipient",
        purpose: "Medical Treatment / Surgery",
        purpose_description: "",
        documents: [] as string[],
        otp: "",
        password: "",
    });

    // Verification & Compliance State
    const [complianceResult, setComplianceResult] = React.useState<ComplianceEvaluation | null>(null);
    const [feeCalculation, setFeeCalculation] = React.useState<FeeCalculation | null>(null);
    const [submittedDisbursement, setSubmittedDisbursement] = React.useState<Disbursement | null>(null);
    const [otpTimer, setOtpTimer] = React.useState(60);
    const [isOtpSending, setIsOtpSending] = React.useState(false);
    const [maskedEmail, setMaskedEmail] = React.useState("");
    const [copied, setCopied] = React.useState(false);

    // Query campaigns list if not pre-provided
    const { data: campaignsRes } = useQuery({
        queryKey: ["active-campaigns-list"],
        queryFn: () => campaignService.listCampaigns({ status: "active" }),
        enabled: isOpen && !propCampaignId,
    });

    const campaigns = campaignsRes?.data || [];
    const activeCampaignId = propCampaignId || selectedCampaignId || (campaigns[0]?.id as string) || "";

    // Query campaign financials
    const { data: financialsRes, isLoading: isLoadingFinancials } = useQuery({
        queryKey: ["campaign-financials", activeCampaignId],
        queryFn: () => disbursementService.getCampaignFinancials(activeCampaignId),
        enabled: isOpen && !!activeCampaignId,
    });

    const financials: CampaignFinancials | undefined = financialsRes?.data;

    // Reset when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setStep(1);
            setSubmittedDisbursement(null);
            setComplianceResult(null);
            setFeeCalculation(null);
            if (propCampaignId) setSelectedCampaignId(propCampaignId);
        }
    }, [isOpen, propCampaignId]);

    // Timer for OTP countdown
    React.useEffect(() => {
        let interval: NodeJS.Timeout;
        if (step === 8 && otpTimer > 0) {
            interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [step, otpTimer]);

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Step 6: Validate Compliance
    const validateMutation = useMutation({
        mutationFn: async () => {
            const res = await disbursementService.validateDisbursement(activeCampaignId, {
                ...formData,
                amount: Number(formData.amount),
            });
            return res.data;
        },
        onSuccess: (data) => {
            setComplianceResult(data.compliance);
            setFeeCalculation(data.fee_calculation);
            setStep(6);
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to validate compliance checks");
        },
    });

    // Step 8: Send OTP
    const sendOtpMutation = useMutation({
        mutationFn: async () => {
            const res = await disbursementService.sendOtp(activeCampaignId);
            return res.data;
        },
        onSuccess: (data) => {
            setMaskedEmail(data.email_masked);
            setOtpTimer(60);
            toast.success("Security verification code sent to your registered email");
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to dispatch verification code");
        },
    });

    // Step 9: Final Submission
    const submitMutation = useMutation({
        mutationFn: async () => {
            const res = await disbursementService.submitCampaignDisbursement(activeCampaignId, {
                ...formData,
                amount: Number(formData.amount),
            });
            return res.data;
        },
        onSuccess: (data) => {
            setSubmittedDisbursement(data);
            queryClient.invalidateQueries({ queryKey: ["campaign-financials", activeCampaignId] });
            queryClient.invalidateQueries({ queryKey: ["campaign-disbursements", activeCampaignId] });
            queryClient.invalidateQueries({ queryKey: ["disbursements"] });
            setStep(9);
            toast.success("Disbursement request successfully processed");
        },
        onError: (err: any) => {
            toast.error(err.message || "Disbursement submission failed");
        },
    });

    // Navigation handlers
    const handleNext = () => {
        if (step === 1) {
            if (!formData.beneficiary_name.trim()) {
                toast.error("Please enter the beneficiary name");
                return;
            }
            setStep(2);
        } else if (step === 2) {
            if (!formData.bank_name.trim() || !formData.account_number.trim()) {
                toast.error("Please complete bank and account number details");
                return;
            }
            setStep(3);
        } else if (step === 3) {
            const num = Number(formData.amount);
            if (!num || num <= 0) {
                toast.error("Please enter a valid disbursement amount");
                return;
            }
            if (financials && num > financials.available_balance) {
                toast.error(`Amount exceeds available balance of ${financials.currency} ${financials.available_balance}`);
                return;
            }
            setStep(4);
        } else if (step === 4) {
            if (!formData.purpose.trim()) {
                toast.error("Please select a purpose");
                return;
            }
            setStep(5);
        } else if (step === 5) {
            // Trigger Compliance evaluation
            validateMutation.mutate();
        } else if (step === 6) {
            if (!complianceResult?.passed) {
                toast.error("Compliance checks have flagged issues. Please review before proceeding.");
            }
            setStep(7);
        } else if (step === 7) {
            // Dispatch OTP & move to authentication
            sendOtpMutation.mutate();
            setStep(8);
        } else if (step === 8) {
            if (!formData.otp && !formData.password) {
                toast.error("Please enter the verification code");
                return;
            }
            submitMutation.mutate();
        }
    };

    const handleBack = () => {
        if (step > 1 && step < 9) setStep((s) => s - 1);
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        toast.success("Tracking code copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0 border-none rounded-3xl bg-white shadow-2xl">
                {/* Header Banner with Step Progress */}
                <div className="bg-gradient-to-r from-[#0E3B5D] to-[#164e78] text-white p-6 sm:p-7 rounded-t-3xl space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-sm">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Global Disbursement Gateway</span>
                        </div>
                        <span className="text-xs font-bold text-slate-300">
                            {step < 9 ? `Step ${step} of 8` : "Completed"}
                        </span>
                    </div>

                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                            {step === 1 && "Step 1 — Recipient Identity"}
                            {step === 2 && "Step 2 — Payout Destination Rail"}
                            {step === 3 && "Step 3 — Amount & Fee Breakdown"}
                            {step === 4 && "Step 4 — Purpose & Audit Reason"}
                            {step === 5 && "Step 5 — Supporting Documentation"}
                            {step === 6 && "Step 6 — Automated Compliance Screening"}
                            {step === 7 && "Step 7 — Review & Confirmation"}
                            {step === 8 && "Step 8 — Strong Step-Up Authentication"}
                            {step === 9 && "Disbursement Executed"}
                        </h2>
                        <p className="text-xs text-slate-300 mt-1">
                            {step === 1 && "Select beneficiary type and provide verified identity details."}
                            {step === 2 && "Choose country-adaptive bank clearing, SEPA, ACH, or mobile wallet."}
                            {step === 3 && "Configure disbursement amount, currency, and fee bearer."}
                            {step === 4 && "Provide charitable justification and audit classification."}
                            {step === 5 && "Attach hospital bills, invoices, receipts, or contracts."}
                            {step === 6 && "Real-time AML, sanctions, velocity, and treasury balance checks."}
                            {step === 7 && "Verify all recipient and financial metrics before authentication."}
                            {step === 8 && "Confirm with 2FA/OTP code sent to your authorized account."}
                            {step === 9 && "Your payout reference has been generated and ledger updated."}
                        </p>
                    </div>

                    {/* Step Progress Bar */}
                    {step < 9 && (
                        <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                            <div 
                                className="bg-emerald-400 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${(step / 8) * 100}%` }}
                            />
                        </div>
                    )}
                </div>

                {/* Body Content */}
                <div className="p-6 sm:p-7 space-y-6">
                    {/* STEP 1: RECIPIENT */}
                    {step === 1 && (
                        <div className="space-y-4">
                            {!propCampaignId && (
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-700">Select Campaign</Label>
                                    <Select 
                                        value={activeCampaignId} 
                                        onValueChange={(val) => setSelectedCampaignId(val)}
                                    >
                                        <SelectTrigger className="h-11 rounded-xl border-[#EAECF0]">
                                            <SelectValue placeholder="Choose a campaign" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {campaigns.map((c) => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-700">Recipient Classification</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {RECIPIENT_TYPES.map((rt) => (
                                        <div
                                            key={rt.value}
                                            onClick={() => handleInputChange("recipient_type", rt.value)}
                                            className={cn(
                                                "p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between",
                                                formData.recipient_type === rt.value
                                                    ? "border-blue-600 bg-blue-50/50 shadow-sm"
                                                    : "border-slate-200 hover:border-slate-300 bg-white"
                                            )}
                                        >
                                            <span className="text-xs font-bold text-slate-900">{rt.label}</span>
                                            <span className="text-[11px] text-slate-500 mt-1">{rt.desc}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label className="text-xs font-bold text-slate-700">Beneficiary / Organization Full Name</Label>
                                    <Input
                                        placeholder="e.g. John Doe or Lagos State University Teaching Hospital"
                                        value={formData.beneficiary_name}
                                        onChange={(e) => handleInputChange("beneficiary_name", e.target.value)}
                                        className="h-11 rounded-xl border-[#EAECF0]"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-700">Recipient Country Rail</Label>
                                    <Select 
                                        value={formData.recipient_country} 
                                        onValueChange={(val) => handleInputChange("recipient_country", val)}
                                    >
                                        <SelectTrigger className="h-11 rounded-xl border-[#EAECF0]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="NG">Nigeria (NGN)</SelectItem>
                                            <SelectItem value="US">United States (USD)</SelectItem>
                                            <SelectItem value="GB">United Kingdom (GBP)</SelectItem>
                                            <SelectItem value="EU">European Union (EUR)</SelectItem>
                                            <SelectItem value="KE">Kenya (KES)</SelectItem>
                                            <SelectItem value="GH">Ghana (GHS)</SelectItem>
                                            <SelectItem value="ZA">South Africa (ZAR)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-700">Recipient Email (Optional)</Label>
                                    <Input
                                        placeholder="beneficiary@example.com"
                                        type="email"
                                        value={formData.recipient_email}
                                        onChange={(e) => handleInputChange("recipient_email", e.target.value)}
                                        className="h-11 rounded-xl border-[#EAECF0]"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: PAYOUT METHOD */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-700">Payment Rail & Method</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {PAYOUT_METHODS.map((pm) => {
                                        const Icon = pm.icon;
                                        return (
                                            <div
                                                key={pm.value}
                                                onClick={() => handleInputChange("payout_method", pm.value)}
                                                className={cn(
                                                    "p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3",
                                                    formData.payout_method === pm.value
                                                        ? "border-blue-600 bg-blue-50/50 shadow-sm"
                                                        : "border-slate-200 hover:border-slate-300 bg-white"
                                                )}
                                            >
                                                <div className="p-2 rounded-lg bg-white border border-slate-200 text-blue-600 shrink-0">
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <span className="text-xs font-bold text-slate-900">{pm.label}</span>
                                                    <p className="text-[11px] text-slate-500">{pm.desc}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-700">Bank / Institution Name</Label>
                                    <Input
                                        placeholder="e.g. Access Bank, Chase, Barclays"
                                        value={formData.bank_name}
                                        onChange={(e) => handleInputChange("bank_name", e.target.value)}
                                        className="h-11 rounded-xl border-[#EAECF0]"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-700">Account / IBAN Number</Label>
                                    <Input
                                        placeholder="e.g. 0123456789 or GB29X..."
                                        value={formData.account_number}
                                        onChange={(e) => handleInputChange("account_number", e.target.value)}
                                        className="h-11 rounded-xl border-[#EAECF0] font-mono"
                                    />
                                </div>

                                {(formData.payout_method === "swift" || formData.recipient_country !== "NG") && (
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-slate-700">SWIFT / BIC Code</Label>
                                        <Input
                                            placeholder="e.g. CHASUS33"
                                            value={formData.swift_bic}
                                            onChange={(e) => handleInputChange("swift_bic", e.target.value)}
                                            className="h-11 rounded-xl border-[#EAECF0] font-mono uppercase"
                                        />
                                    </div>
                                )}

                                {(formData.payout_method === "ach" || formData.recipient_country === "US") && (
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-slate-700">Routing Number (ABA)</Label>
                                        <Input
                                            placeholder="9-digit routing"
                                            value={formData.routing_number}
                                            onChange={(e) => handleInputChange("routing_number", e.target.value)}
                                            className="h-11 rounded-xl border-[#EAECF0] font-mono"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STEP 3: AMOUNT & FEES */}
                    {step === 3 && (
                        <div className="space-y-5">
                            {/* Available Balance Header */}
                            {financials && (
                                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 flex items-center justify-between">
                                    <div>
                                        <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                                            Available Treasury Balance
                                        </span>
                                        <p className="text-xl font-black text-emerald-900">
                                            {financials.currency} {Number(financials.available_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleInputChange("amount", String(financials.available_balance))}
                                        className="text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        Max Balance
                                    </button>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-700">Disbursement Amount</Label>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={(e) => handleInputChange("amount", e.target.value)}
                                        className="h-12 rounded-xl border-[#EAECF0] text-lg font-bold"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-700">Source Currency</Label>
                                    <Select 
                                        value={formData.currency} 
                                        onValueChange={(val) => handleInputChange("currency", val)}
                                    >
                                        <SelectTrigger className="h-12 rounded-xl border-[#EAECF0] font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USD">USD ($)</SelectItem>
                                            <SelectItem value="NGN">NGN (₦)</SelectItem>
                                            <SelectItem value="EUR">EUR (€)</SelectItem>
                                            <SelectItem value="GBP">GBP (£)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Fee Bearer Selection */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-700">Processing Fee Allocation</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div
                                        onClick={() => handleInputChange("fee_bearer", "campaign")}
                                        className={cn(
                                            "p-3 rounded-xl border cursor-pointer text-center transition-all",
                                            formData.fee_bearer === "campaign"
                                                ? "border-blue-600 bg-blue-50/50 text-blue-900 font-bold"
                                                : "border-slate-200 text-slate-600 bg-white"
                                        )}
                                    >
                                        <span className="text-xs">Campaign Bears Fee</span>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Recipient receives full requested amount</p>
                                    </div>
                                    <div
                                        onClick={() => handleInputChange("fee_bearer", "recipient")}
                                        className={cn(
                                            "p-3 rounded-xl border cursor-pointer text-center transition-all",
                                            formData.fee_bearer === "recipient"
                                                ? "border-blue-600 bg-blue-50/50 text-blue-900 font-bold"
                                                : "border-slate-200 text-slate-600 bg-white"
                                        )}
                                    >
                                        <span className="text-xs">Recipient Bears Fee</span>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Fee deducted from payout total</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: PURPOSE */}
                    {step === 4 && (
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700">Disbursement Purpose</Label>
                                <Select 
                                    value={formData.purpose} 
                                    onValueChange={(val) => handleInputChange("purpose", val)}
                                >
                                    <SelectTrigger className="h-11 rounded-xl border-[#EAECF0]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PURPOSES.map((p) => (
                                            <SelectItem key={p} value={p}>
                                                {p}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700">Detailed Description & Audit Justification</Label>
                                <Textarea
                                    placeholder="Describe specifically how these funds will be applied, vendor quote references, or hospital invoice numbers..."
                                    value={formData.purpose_description}
                                    onChange={(e) => handleInputChange("purpose_description", e.target.value)}
                                    className="min-h-[120px] rounded-xl border-[#EAECF0] resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* STEP 5: SUPPORTING DOCUMENTS */}
                    {step === 5 && (
                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-50 transition-colors cursor-pointer">
                                <UploadCloud className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                                <h4 className="text-sm font-bold text-slate-800">Attach Verified Invoices / Receipts</h4>
                                <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG up to 10MB each</p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        // Mock add document for demonstration
                                        const mockDoc = `https://res.cloudinary.com/fajiri/doc_${Date.now()}.pdf`;
                                        setFormData((prev) => ({ ...prev, documents: [...prev.documents, mockDoc] }));
                                        toast.success("Document attached");
                                    }}
                                    className="mt-4 rounded-xl border-slate-300 text-xs font-semibold"
                                >
                                    + Add Verification Document
                                </Button>
                            </div>

                            {formData.documents.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-700">Attached Documents ({formData.documents.length})</Label>
                                    <div className="space-y-1.5">
                                        {formData.documents.map((doc, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-blue-600" />
                                                    <span className="font-medium text-slate-700 truncate max-w-[280px]">
                                                        Verified_Invoice_{idx + 1}.pdf
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData((prev) => ({ ...prev, documents: prev.documents.filter((_, i) => i !== idx) }))}
                                                    className="text-rose-500 hover:underline font-semibold"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 6: AUTOMATED COMPLIANCE CHECKS */}
                    {step === 6 && complianceResult && (
                        <div className="space-y-4">
                            <div className={cn(
                                "p-4 rounded-2xl border flex items-center justify-between",
                                complianceResult.passed ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
                            )}>
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "h-10 w-10 rounded-xl flex items-center justify-center font-bold",
                                        complianceResult.passed ? "bg-emerald-200 text-emerald-800" : "bg-amber-200 text-amber-800"
                                    )}>
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900">
                                            {complianceResult.passed ? "Compliance Verification Passed" : "Compliance Review Recommended"}
                                        </h4>
                                        <p className="text-xs text-slate-600">
                                            Risk Level: <span className="capitalize font-bold">{complianceResult.risk_level}</span> (Score: {complianceResult.risk_score}/100)
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Automated Verification Checklist</Label>
                                {Object.entries(complianceResult.checks).map(([key, check]) => (
                                    <div key={key} className="flex items-center justify-between py-1.5 border-b border-slate-200/60 last:border-0">
                                        <span className="text-slate-700 capitalize">{key.replace(/_/g, " ")}</span>
                                        <div className="flex items-center gap-1.5">
                                            {check.passed ? (
                                                <span className="text-emerald-600 font-bold flex items-center gap-1">
                                                    <CheckCircle2 className="h-3.5 w-3.5" /> Passed
                                                </span>
                                            ) : (
                                                <span className="text-rose-600 font-bold flex items-center gap-1">
                                                    <XCircle className="h-3.5 w-3.5" /> Flagged
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 7: REVIEW & SUMMARY */}
                    {step === 7 && (
                        <div className="space-y-4">
                            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-slate-500">Beneficiary:</span>
                                    <span className="font-bold text-slate-900">{formData.beneficiary_name}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-slate-500">Destination Account:</span>
                                    <span className="font-mono font-bold text-slate-900">
                                        {formData.bank_name} •••• {formData.account_number.slice(-4)}
                                    </span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-slate-500">Requested Payout:</span>
                                    <span className="font-bold text-slate-900">
                                        {formData.currency} {Number(formData.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-slate-500">Processing Fee ({formData.fee_bearer} bearer):</span>
                                    <span className="font-bold text-slate-900">
                                        {formData.currency} {Number(feeCalculation?.fee_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex justify-between pt-1 text-sm font-black">
                                    <span className="text-slate-800">Estimated Recipient Receives:</span>
                                    <span className="text-emerald-700">
                                        {formData.target_currency} {Number(feeCalculation?.recipient_receives || formData.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 8: STRONG AUTHENTICATION (OTP) */}
                    {step === 8 && (
                        <div className="space-y-4 text-center py-4">
                            <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                                <Lock className="h-7 w-7" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Enter Code</h3>
                                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                                    We sent a 6-digit confirmation code to {maskedEmail || "your registered email"}.
                                </p>
                            </div>

                            <div className="max-w-xs mx-auto space-y-4">
                                <OtpInput
                                    value={formData.otp}
                                    onChange={(val) => handleInputChange("otp", val)}
                                />

                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span>Code expires in {otpTimer}s</span>
                                    <button
                                        type="button"
                                        disabled={otpTimer > 0 || sendOtpMutation.isPending}
                                        onClick={() => sendOtpMutation.mutate()}
                                        className="text-blue-600 hover:underline font-bold disabled:text-slate-400"
                                    >
                                        Resend Code
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 9: SUCCESS & RECEIPT */}
                    {step === 9 && submittedDisbursement && (
                        <div className="space-y-5 text-center py-4">
                            <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                                <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Disbursement Initiated Successfully</h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    Your payout has been submitted and is currently being processed by the treasury engine.
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto space-y-2">
                                <span className="text-[11px] font-bold text-slate-500 uppercase">Tracking Code</span>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="font-mono text-xl font-black text-[#0E3B5D]">
                                        {submittedDisbursement.disbursement_code || `DSB-${submittedDisbursement.id.substring(0, 8).toUpperCase()}`}
                                    </span>
                                    <button
                                        onClick={() => copyCode(submittedDisbursement.disbursement_code || submittedDisbursement.id)}
                                        className="p-1 rounded bg-white border text-slate-600 hover:text-slate-900"
                                    >
                                        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Navigation Buttons */}
                <DialogFooter className="p-5 sm:p-6 bg-slate-50 rounded-b-3xl border-t border-slate-100 flex items-center justify-between gap-3">
                    {step > 1 && step < 9 ? (
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            className="rounded-xl border-[#EAECF0] h-11 font-semibold gap-1"
                        >
                            <ArrowLeft className="h-4 w-4" /> Back
                        </Button>
                    ) : (
                        <div />
                    )}

                    {step < 9 ? (
                        <Button
                            onClick={handleNext}
                            disabled={validateMutation.isPending || submitMutation.isPending}
                            className="bg-[#0E3B5D] hover:bg-[#0E3B5D]/90 text-white rounded-xl h-11 px-6 font-semibold gap-1 shadow-sm"
                        >
                            {validateMutation.isPending || submitMutation.isPending ? (
                                "Processing..."
                            ) : step === 7 ? (
                                <>Proceed to 2FA <ArrowRight className="h-4 w-4" /></>
                            ) : step === 8 ? (
                                <>Authorize Payout <CheckCircle className="h-4 w-4" /></>
                            ) : (
                                <>Next <ArrowRight className="h-4 w-4" /></>
                            )}
                        </Button>
                    ) : (
                        <Button
                            onClick={() => onOpenChange(false)}
                            className="bg-[#0E3B5D] hover:bg-[#0E3B5D]/90 text-white rounded-xl h-11 px-8 font-semibold"
                        >
                            Done
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
