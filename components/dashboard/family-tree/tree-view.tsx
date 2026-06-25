"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { familyTreeService, FamilyTreeNode as NodeType } from "@/services/family-tree";
import { FamilyTreeNode as FamilyTreeNodeComponent } from "./tree-node";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

function TreeModalContent({ memberId }: { memberId: string }) {
    const { data: memberRes, isLoading } = useQuery({
        queryKey: ["family-tree-member", memberId],
        queryFn: () => familyTreeService.getFamilyTreeByMemberId(memberId),
        enabled: !!memberId,
    });

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <p className="text-[#667085]">Loading family tree...</p>
            </div>
        );
    }

    const node = memberRes?.data;
    if (!node) {
        return (
            <div className="flex h-64 items-center justify-center">
                <p className="text-[#667085]">Failed to load tree data.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-auto p-8 bg-[#F9FAFB] flex justify-center">
            <FamilyTreeNodeComponent node={node} isRoot={true} />
        </div>
    );
}

export function FamilyListView() {
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [selectedNodeName, setSelectedNodeName] = useState<string | null>(null);

    const { data: treeRes, isLoading } = useQuery({
        queryKey: ["family-tree-list"],
        queryFn: () => familyTreeService.getFamilyTree(),
    });

    const members = React.useMemo(() => {
        return treeRes?.data || [];
    }, [treeRes]);

    const columns: ColumnDef<NodeType>[] = [
        {
            accessorKey: "full_name",
            header: "Member",
            cell: ({ row }) => {
                const member = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={member.photo || ""} className="object-cover" />
                            <AvatarFallback>
                                {member.full_name?.charAt(0) || "F"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-medium text-[#101828]">
                                {member.full_name}
                            </span>
                            <span className="text-xs text-[#667085] capitalize">
                                {member.relationship}
                            </span>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "gender",
            header: "Gender",
            cell: ({ row }) => (
                <span className="capitalize text-[#667085]">{row.getValue("gender")}</span>
            ),
        },
        {
            accessorKey: "is_alive",
            header: "Status",
            cell: ({ row }) => {
                const isAlive = row.getValue("is_alive") as boolean;
                return (
                    <Badge variant={isAlive ? "success" : "secondary"}>
                        {isAlive ? "Alive" : "Deceased"}
                    </Badge>
                );
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const node = row.original;
                return (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                            setSelectedNodeId(node.id);
                            setSelectedNodeName(node.full_name);
                        }}
                        className="flex items-center gap-2 text-primary hover:text-primary/80"
                    >
                        <Eye className="h-4 w-4" />
                        View Tree
                    </Button>
                );
            },
        },
    ];

    return (
        <div className="space-y-6">
            <DataTable
                columns={columns}
                data={members}
                searchKey="full_name"
                title="Family Members"
                isLoading={isLoading}
            />

            <Dialog open={!!selectedNodeId} onOpenChange={(open) => {
                if (!open) {
                    setSelectedNodeId(null);
                    setSelectedNodeName(null);
                }
            }}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col p-0">
                    <DialogHeader className="p-6 border-b border-[#E9EEF2]">
                        <DialogTitle>Family Tree - {selectedNodeName}</DialogTitle>
                    </DialogHeader>
                    {selectedNodeId && <TreeModalContent memberId={selectedNodeId} />}
                </DialogContent>
            </Dialog>
        </div>
    );
}
