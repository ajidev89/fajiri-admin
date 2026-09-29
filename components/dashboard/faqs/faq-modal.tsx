"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FAQ_TYPES, Faq, FaqType, faqService } from "@/services/faqs";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface FaqModalProps {
    isOpen: boolean;
    onClose: () => void;
    faq?: Faq | null;
}

export function FaqModal({ isOpen, onClose, faq }: FaqModalProps) {
    const queryClient = useQueryClient();
    const isEdit = Boolean(faq);
    const [type, setType] = useState<FaqType>("general");
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [sortOrder, setSortOrder] = useState("0");

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        setType(faq?.type ?? "general");
        setQuestion(faq?.question ?? "");
        setAnswer(faq?.answer ?? "");
        setSortOrder(String(faq?.sort_order ?? 0));
    }, [faq, isOpen]);

    const mutation = useMutation({
        mutationFn: () => {
            const payload = {
                type,
                question,
                answer,
                sort_order: Number(sortOrder) || 0,
            };

            return isEdit && faq
                ? faqService.updateFaq(faq.id, payload)
                : faqService.createFaq(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["faqs"] });
            toast.success(isEdit ? "FAQ updated" : "FAQ added");
            onClose();
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to save FAQ");
        },
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        mutation.mutate();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
                    <DialogDescription>
                        Questions are grouped by type on the public FAQ page.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="faq-type">Type</Label>
                        <Select value={type} onValueChange={(value) => setType(value as FaqType)}>
                            <SelectTrigger id="faq-type">
                                <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                            <SelectContent>
                                {FAQ_TYPES.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="faq-question">Question</Label>
                        <Input
                            id="faq-question"
                            placeholder="How can I donate?"
                            value={question}
                            onChange={(event) => setQuestion(event.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="faq-answer">Answer</Label>
                        <Textarea
                            id="faq-answer"
                            placeholder="Write the answer visitors will see"
                            value={answer}
                            onChange={(event) => setAnswer(event.target.value)}
                            required
                            className="min-h-[120px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="faq-order">Order</Label>
                        <Input
                            id="faq-order"
                            type="number"
                            min={0}
                            value={sortOrder}
                            onChange={(event) => setSortOrder(event.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {isEdit ? "Save changes" : "Add FAQ"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
