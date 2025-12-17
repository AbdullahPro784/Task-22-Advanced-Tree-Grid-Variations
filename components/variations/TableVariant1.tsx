"use client";

import React, { useEffect, useState } from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    Header,
    ColumnOrderState,
    ColumnFiltersState,
    VisibilityState,
    getFilteredRowModel,
    ExpandedState,
    getExpandedRowModel,
} from "@tanstack/react-table";
import { StatusEditableCell } from "../StatusEditableCell";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    horizontalListSortingStrategy,
    useSortable,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
    ChevronDown,
    ChevronUp,
    ChevronsUpDown,
    Wrench,
    Settings,
    CheckCircle,
    HardHat,
    GripHorizontal,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    MoreHorizontal,
    Trash2,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Asset, AssetStatus, DATA } from "../data";
import { cn } from "@/lib/utils";
import { DraggableTableHeader } from "../DraggableTableHeader";
import { EditableCell } from "../EditableCell";

import AddItemModal from "../AddItemModal";
import Link from "next/link";

// --- Main Component ---
export default function TableVariant1({ data: initialData }: { data: Asset[] }) {
    const [isMounted, setIsMounted] = useState(false);

    // Extract unique categories from DATA for the dropdown
    const uniqueCategories = React.useMemo(() => {
        const categories = new Set(DATA.map(item => item.category));
        return Array.from(categories).sort();
    }, []);

    const [data, setData] = useState(initialData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isColumnsMenuOpen, setIsColumnsMenuOpen] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState(""); // Global filter state
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([
        "select",
        "id",
        "serial",
        "category",
        "brand",
        "type",
        "vehicle",
        "status",
    ]);
    const [rowSelection, setRowSelection] = useState({});
    const [expanded, setExpanded] = useState<ExpandedState>(true); // Default expand all for demo

    // Load column order from local storage
    useEffect(() => {
        const savedOrder = localStorage.getItem("assetTableColumnOrder_v1");
        if (savedOrder) {
            try {
                const parsedOrder = JSON.parse(savedOrder);
                if (!parsedOrder.includes("select")) {
                    parsedOrder.unshift("select");
                }
                setColumnOrder(parsedOrder);
            } catch (e) {
                console.error("Failed to parse column order", e);
            }
        }
    }, []);

    // Save column order to local storage
    useEffect(() => {
        localStorage.setItem("assetTableColumnOrder_v1", JSON.stringify(columnOrder));
    }, [columnOrder]);

    const columns = React.useMemo<ColumnDef<Asset>[]>(() => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <div className="px-4 py-3 h-full flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <div style={{ paddingLeft: `${row.depth * 20}px` }}> {/* Indentation built-in to first cell */}
                        <Checkbox
                            checked={row.getIsSelected()}
                            onCheckedChange={(value) => row.toggleSelected(!!value)}
                            aria-label="Select row"
                        />
                    </div>
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
            size: 50,
        },
        {
            accessorKey: "id",
            header: "Asset ID",
            cell: ({ row, getValue }) => (
                <div className="px-4 py-3 h-full flex items-center gap-2">
                    {/* Move expander here for better tree visualization */}
                    {row.getCanExpand() && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                row.toggleExpanded();
                            }}
                            className="p-1 hover:bg-gray-200 rounded cursor-pointer transition-transform"
                        >
                            {row.getIsExpanded() ? (
                                <ChevronDown size={16} className="text-gray-500" />
                            ) : (
                                <ChevronRight size={16} className="text-gray-500" />
                            )}
                        </button>
                    )}
                    {/* If strictly indenting this column, we could add padding here instead of the checkbox column, 
                        but usually tree views indent the whole row visually or the leading column. 
                        Let's keep indentation in the checkbox column or move checkbox after expander? 
                        The prompt asks for "image 1" style. Image 1 has:
                        [Expander] [Checkbox] [Content] or [Checkbox] [Expander] [Content]?
                        Actually Image 1 shows [Level 1 Item] -> [Level 2 Item] indented below it.
                    */}
                    {getValue() as string}
                </div>
            ),
            size: 100,
        },
        {
            accessorKey: "serial",
            header: "Serial",
            cell: EditableCell,
            size: 150,
        },
        {
            accessorKey: "category",
            header: "Category",
            cell: (props) => <EditableCell {...props} options={uniqueCategories} />,
            size: 140,
        },
        {
            accessorKey: "brand",
            header: "Brand",
            cell: EditableCell,
            size: 140,
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: EditableCell,
            size: 140,
        },
        {
            accessorKey: "vehicle",
            header: "Vehicle",
            size: 140,
            cell: ({ row, getValue, table }) => {
                const value = getValue() as string;
                return (
                    <div
                        className="flex items-center justify-between px-4 py-3 h-full group"
                        onContextMenu={(e) => {
                            e.preventDefault();
                            alert("Please click the three dots menu to see options.");
                        }}
                    >
                        <span className="truncate">{value}</span>
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                    alert("Option selected: Assign Driver");
                                }}>
                                    Assign Driver
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => alert("Option selected: Check History")}>
                                    Check History
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
        {
            accessorKey: "endDate",
            header: "End Date",
            cell: (props) => <EditableCell {...props} type="date" />,
            size: 140,
        },
        {
            accessorKey: "status",
            header: "Status",
            size: 180,
            cell: StatusEditableCell,
        },
    ], [uniqueCategories]);

    const table = useReactTable({
        data,
        columns,
        getRowId: (row) => row.id,
        state: {
            sorting,
            columnOrder,
            rowSelection,
            columnFilters,
            columnVisibility,
            globalFilter,
            expanded,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onColumnVisibilityChange: setColumnVisibility,
        onColumnOrderChange: setColumnOrder,
        onRowSelectionChange: setRowSelection,
        onExpandedChange: setExpanded,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getSubRows: (row) => row.subRows,
        getPaginationRowModel: getPaginationRowModel(),
        autoResetPageIndex: false,
        enableRowSelection: true,
        enableMultiRowSelection: true,
        meta: {
            updateData: async (itemId: string, columnId: string, value: any) => {
                // ... (Keep existing update logic)
                console.log("Mock update", itemId, columnId, value);
                setData((old) =>
                    old.map((item) => {
                        // Simple recursive update for demo
                        const updateRecursive = (items: Asset[]): Asset[] => {
                            return items.map(i => {
                                if (i.id === itemId) return { ...i, [columnId]: value };
                                if (i.subRows) return { ...i, subRows: updateRecursive(i.subRows) };
                                return i;
                            })
                        }
                        return updateRecursive([item])[0];
                    })
                );
            },
        },
    });

    const handleDeleteSelected = async () => {
        // ... (Keep existing delete logic mocked for now)
        const selectedRowIds = table.getFilteredSelectedRowModel().rows.map(row => row.original.id);
        alert(`Deleting: ${selectedRowIds.join(", ")}`);
        setRowSelection({});
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            setColumnOrder((order) => {
                const oldIndex = order.indexOf(active.id as string);
                const newIndex = order.indexOf(over.id as string);
                return arrayMove(order, oldIndex, newIndex);
            });
        }
    }

    if (!isMounted) {
        return null;
    }

    return (
        <div className="w-full max-w-6xl mx-auto p-4 bg-white rounded-lg shadow-sm border border-gray-200 font-sans">
            <div className="mb-4">
                <Link href="/" className="text-sm text-blue-500 hover:underline mb-2 block">← Back to Variations</Link>
                <h2 className="text-xl font-bold text-gray-800">Variation 1: Indented Tree</h2>
            </div>
            <div className="mb-4 flex items-center justify-between">
                <div className="flex gap-2 items-center">
                    <div className="relative w-64">
                        <input
                            type="text"
                            placeholder="Search all assets"
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <span className="absolute left-2.5 top-2.5 text-gray-400">🔍</span>
                    </div>
                </div>
            </div>

            <DndContext
                collisionDetection={closestCenter}
                modifiers={[restrictToHorizontalAxis]}
                onDragEnd={handleDragEnd}
                sensors={sensors}
            >
                <div className="overflow-x-auto border border-gray-200 rounded-md">
                    <table className="w-full text-sm text-left table-fixed">
                        <thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    <SortableContext
                                        items={columnOrder}
                                        strategy={horizontalListSortingStrategy}
                                    >
                                        {headerGroup.headers.map((header) => (
                                            <DraggableTableHeader key={header.id} header={header} />
                                        ))}
                                    </SortableContext>
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map((row) => {
                                return (
                                    <tr
                                        key={row.id}
                                        onClick={() => row.toggleSelected()}
                                        className={cn(
                                            "border-b border-gray-100 cursor-pointer transition-colors",
                                            "hover:bg-slate-50",
                                            row.getIsSelected() ? "bg-opacity-90 ring-1 ring-inset ring-orange-400" : "",
                                            "h-16"
                                        )}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className={cn("p-0 text-gray-700")}>
                                                {/* Apply padding to the FIRST cell in the row for indentation effect if we want full row indentation, 
                                                    OR rely on the cell renderer specific padding I added above to the 'select' column. 
                                                    Let's rely on the cell renderer logic.
                                                */}
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </DndContext>
        </div>
    );
}
