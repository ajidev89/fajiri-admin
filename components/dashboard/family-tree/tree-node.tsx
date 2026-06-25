"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FamilyTreeNode as NodeType } from "@/services/family-tree";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface TreeNodeProps {
    node: NodeType;
    isRoot?: boolean;
}

export function FamilyTreeNode({ node, isRoot = false }: TreeNodeProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className="flex flex-col items-center">
            {/* The Node Card */}
            <div className={cn(
                "relative flex flex-col items-center bg-white border rounded-xl p-4 shadow-sm w-48 transition-all hover:shadow-md",
                !isRoot && "mt-8",
                node.is_alive ? "border-[#E9EEF2]" : "border-gray-300 opacity-80 bg-gray-50"
            )}>
                {/* Connecting line to parent */}
                {!isRoot && (
                    <div className="absolute -top-8 left-1/2 w-px h-8 bg-[#E9EEF2] -translate-x-1/2" />
                )}

                <Avatar className="h-16 w-16 mb-3 border-2 border-primary/10">
                    <AvatarImage src={node.photo || ""} className="object-cover" />
                    <AvatarFallback className="bg-primary/5 text-primary text-xl">
                        {node.full_name?.charAt(0) || "F"}
                    </AvatarFallback>
                </Avatar>
                
                <h3 className="font-semibold text-sm text-[#101828] text-center truncate w-full">
                    {node.full_name}
                </h3>
                <p className="text-xs text-[#667085] truncate w-full text-center capitalize mt-0.5">
                    {node.relationship}
                </p>
                
                <div className="mt-3 px-3 py-1 bg-primary/5 rounded-full flex flex-col items-center">
                    <span className="text-[10px] font-medium text-primary uppercase tracking-wider">
                        {node.gender}
                    </span>
                </div>
                
                {!node.is_alive && (
                    <div className="absolute top-2 right-2 flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-gray-400" title="Deceased"></span>
                    </div>
                )}

                {hasChildren && (
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white border border-[#E9EEF2] rounded-full p-1 text-[#667085] hover:text-primary hover:border-primary/30 transition-colors z-10"
                    >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                )}
            </div>

            {/* Children Container */}
            {hasChildren && isExpanded && (
                <div className="relative flex justify-center mt-8 gap-6 pt-4">
                    {/* Horizontal connecting line for children */}
                    <div className="absolute top-0 left-0 w-full h-px bg-transparent">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] h-px bg-[#E9EEF2]" />
                    </div>
                    {/* Vertical line from parent to horizontal line */}
                    <div className="absolute -top-8 left-1/2 w-px h-8 bg-[#E9EEF2] -translate-x-1/2" />
                    
                    {node.children!.map((child) => (
                        <div key={child.id} className="relative">
                            {/* Vertical line from horizontal line to child */}
                            <div className="absolute -top-4 left-1/2 w-px h-4 bg-[#E9EEF2] -translate-x-1/2" />
                            <FamilyTreeNode node={child} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
