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

    const mutation = useMutation({
        mutationFn: () =>
            announcementService.createAnnouncement({
                title,
                content,
                image_url: imageUrl || undefined,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["announcements"] });
            toast.success("Announcement successfully sent to all users!");
            onClose();
            setTitle("");
            setContent("");
            setImageUrl("");
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
                        This will send a push notification to all registered users.
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
