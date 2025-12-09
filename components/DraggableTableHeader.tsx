import React from "react";
import { Header, flexRender } from "@tanstack/react-table";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    ChevronDown,
    ChevronUp,
    ChevronsUpDown,
    GripHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Asset } from "./data";

export const DraggableTableHeader = ({
    header,
}: {
    header: Header<Asset, unknown>;
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({
            id: header.column.id,
        });

    const style: React.CSSProperties = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging ? 1 : 0,
        position: "relative",
    };

    return (
        <th
            ref={setNodeRef}
            style={style}
            className={cn(
                "px-4 py-3 text-left text-sm font-semibold text-gray-600 bg-gray-50 border-b border-gray-200 select-none group relative",
                isDragging && "bg-gray-100 shadow-md"
            )}
        >
            <div className="flex items-center gap-2">
                {/* Drag Handle */}
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <GripHorizontal size={14} />
                </button>

                {/* Sort Button */}
                <div
                    onClick={header.column.getToggleSortingHandler()}
                    className={cn(
                        "flex items-center gap-1 cursor-pointer flex-1",
                        header.column.getCanSort() ? "hover:text-gray-900" : ""
                    )}
                >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                        asc: <ChevronUp size={14} />,
                        desc: <ChevronDown size={14} />,
                    }[header.column.getIsSorted() as string] ?? (
                            <ChevronsUpDown size={14} className="text-gray-300" />
                        )}
                </div>
            </div>
            {/* Filter Input */}
            {
                header.column.getCanFilter() && (
                    <div className="mt-2">
                        <input
                            type="text"
                            value={(header.column.getFilterValue() ?? "") as string}
                            onChange={(e) => header.column.setFilterValue(e.target.value)}
                            placeholder={`Filter...`}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-orange-500 font-normal"
                            onClick={(e) => e.stopPropagation()} // Prevent sort/drag
                            onMouseDown={(e) => e.stopPropagation()} // Prevent drag start
                        />
                    </div>
                )
            }
        </th >
    );
};
