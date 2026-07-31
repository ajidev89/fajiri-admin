"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { announcementService } from "@/services/announcements";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AnnouncementModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AnnouncementModal({ isOpen, onClose }: AnnouncementModalProps) {
    const queryClient = useQueryClient();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [targetAudience, setTargetAudience] = useState<string[]>(['all']);

    const AUDIENCE_OPTIONS = [
        { id: 'all', label: 'All Users (Default)' },
        { id: 'admin', label: 'Admins' },
        { id: 'user', label: 'Users' },
        { id: 'fundraiser', label: 'Fundraisers' },
        { id: 'membership-manager', label: 'Membership Managers' },
        { id: 'donation-manager', label: 'Donation Managers' },
        { id: 'campaign-manager', label: 'Campaign Managers' },
        { id: 'poll-manager', label: 'Poll Managers' },
        { id: 'financial-officer', label: 'Financial Officers' },
        { id: 'system-administrator', label: 'System Administrators' },
        { id: 'fim', label: 'FIM (Identified Membership)' },
        { id: 'fpm', label: 'FPM (Program Membership)' },
        { id: 'fcm', label: 'FCM (Corporate Membership)' },
        { id: 'active_users', label: 'Active Users' },
        { id: 'non_active_users', label: 'Non-active Users' },
    ];

    const toggleAudience = (id: string) => {
        if (id === 'all') {
            setTargetAudience(['all']);
            return;
        }
        
        let newAudience = targetAudience.filter(t => t !== 'all');
        if (newAudience.includes(id)) {
            newAudience = newAudience.filter(t => t !== id);
        } else {
            newAudience.push(id);
        }
        
        if (newAudience.length === 0) {
            newAudience = ['all'];
        }
        setTargetAudience(newAudience);
    };

    const mutation = useMutation({
        mutationFn: () =>
            announcementService.createAnnouncement({
                title,
                content,
                image_url: imageUrl || undefined,
                target_audience: targetAudience.includes('all') ? [] : targetAudience,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["announcements"] });
            toast.success("Announcement successfully sent to all users!");
            onClose();
            setTitle("");
            setContent("");
            setImageUrl("");
            setTargetAudience(['all']);
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to send announcement");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Send Announcement</DialogTitle>
                    <DialogDescription>
                        This will send a push notification to selected users.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            placeholder="Announcement title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="content">Message</Label>
                        <Textarea
                            id="content"
                            placeholder="Type your message here..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                        <Input
                            id="imageUrl"
                            type="url"
                            placeholder="https://example.com/image.png"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                        />
                    </div>

                    <div className="space-y-3">
                        <Label>Target Audience</Label>
                        <div className="max-h-[160px] overflow-y-auto border border-[#EAECF0] rounded-md p-3 space-y-3">
                            {AUDIENCE_OPTIONS.map(option => (
                                <div key={option.id} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`audience-${option.id}`} 
                                        checked={targetAudience.includes(option.id)}
                                        onCheckedChange={() => toggleAudience(option.id)}
                                    />
                                    <label
                                        htmlFor={`audience-${option.id}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        {option.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-[#667085]">
                            If "All Users" is selected, the message will be sent to everyone, ignoring other selections.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Send Announcement
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
