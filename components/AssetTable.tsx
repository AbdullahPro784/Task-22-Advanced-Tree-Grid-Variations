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
} from "@tanstack/react-table";
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
} from "lucide-react";
import { Asset, AssetStatus } from "./data";
import { cn } from "@/lib/utils";
import { DraggableTableHeader } from "./DraggableTableHeader";
import { EditableCell } from "./EditableCell";

import AddItemModal from "./AddItemModal";

// --- Main Component ---
export default function AssetTable({ data: initialData }: { data: Asset[] }) {
    const [isMounted, setIsMounted] = useState(false);
    const [data, setData] = useState(initialData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isColumnsMenuOpen, setIsColumnsMenuOpen] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([
        "id",
        "serial",
        "category",
        "brand",
        "type",
        "vehicle",
        "status",
    ]);
    const [rowSelection, setRowSelection] = useState({});

    // Load column order from local storage
    useEffect(() => {
        const savedOrder = localStorage.getItem("assetTableColumnOrder");
        if (savedOrder) {
            try {
                setColumnOrder(JSON.parse(savedOrder));
            } catch (e) {
                console.error("Failed to parse column order", e);
            }
        }
    }, []);

    // Save column order to local storage
    useEffect(() => {
        localStorage.setItem("assetTableColumnOrder", JSON.stringify(columnOrder));
    }, [columnOrder]);

    const columns: ColumnDef<Asset>[] = [
        {
            accessorKey: "id",
            header: "Asset ID",
            cell: EditableCell,
        },
        {
            accessorKey: "serial",
            header: "Serial",
            cell: EditableCell,
        },
        {
            accessorKey: "category",
            header: "Category",
            cell: EditableCell,
        },
        {
            accessorKey: "brand",
            header: "Brand",
            cell: EditableCell,
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: EditableCell,
        },
        {
            accessorKey: "vehicle",
            header: "Vehicle",
            cell: EditableCell,
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: (info) => {
                const status = info.getValue() as AssetStatus;

                return (
                    <div className="flex items-center justify-end gap-2">
                        {status.state === "maintenance" && <Wrench className="text-orange-500" size={20} fill="currentColor" fillOpacity={0.2} />}
                        {status.state === "operational" && <CheckCircle className="text-orange-500" size={20} />}
                        {status.state === "repair" && <Settings className="text-orange-500" size={20} />}
                        {status.state === "inspection" && <HardHat className="text-orange-500" size={20} />}

                        {status.level && (
                            <span className="font-bold text-gray-700">{status.level}</span>
                        )}
                    </div>
                );
            },
        },
    ];

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnOrder,
            rowSelection,
            columnFilters,
            columnVisibility,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onColumnOrderChange: setColumnOrder,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        enableRowSelection: true,
        enableMultiRowSelection: false,
        meta: {
            updateData: (rowIndex: number, columnId: string, value: any) => {
                setData((old) =>
                    old.map((row, index) => {
                        if (index === rowIndex) {
                            return {
                                ...old[rowIndex],
                                [columnId]: value,
                            };
                        }
                        return row;
                    })
                );
            },
        },
    });

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
            <div className="mb-4 flex items-center justify-between">
                {/* Search bar placeholder to match image */}
                <div className="relative w-64">
                    <input type="text" placeholder="Search all assets" className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    <span className="absolute left-2.5 top-2.5 text-gray-400">🔍</span>
                </div>
                <div className="flex gap-2 relative">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-3 py-2 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600"
                    >
                        + Add Item
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setIsColumnsMenuOpen(!isColumnsMenuOpen)}
                            className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-colors"
                        >
                            Columns <ChevronDown size={14} />
                        </button>
                        {/* Column Selection Dropdown */}
                        {isColumnsMenuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsColumnsMenuOpen(false)}
                                />
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20 p-2">
                                    <div className="font-semibold text-xs text-gray-500 mb-2 px-1">Toggle Columns</div>
                                    {table.getAllLeafColumns().map((column) => {
                                        return (
                                            <div key={column.id} className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={column.getIsVisible()}
                                                    onChange={column.getToggleVisibilityHandler()}
                                                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                                                />
                                                <span className="text-sm text-gray-700 capitalize cursor-pointer" onClick={() => column.toggleVisibility(!column.getIsVisible())}>
                                                    {typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                    <div className="flex gap-1">
                        <button className="p-2 bg-orange-500 text-white rounded-md">☰</button>
                        <button className="p-2 border border-gray-300 rounded-md text-gray-500">🗺️</button>
                        <button className="p-2 border border-gray-300 rounded-md text-gray-500">📅</button>
                    </div>
                </div>
            </div>

            <AddItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={(newItem) => {
                    const formattedItem: Asset = {
                        id: newItem.id,
                        serial: newItem.serial,
                        category: newItem.category,
                        brand: newItem.brand,
                        type: newItem.type,
                        vehicle: newItem.vehicle,
                        status: {
                            state: newItem.statusState,
                            level: newItem.statusLevel ? Number(newItem.statusLevel) : undefined
                        }
                    };
                    setData((prev) => [formattedItem, ...prev]);
                }}
            />

            <DndContext
                collisionDetection={closestCenter}
                modifiers={[restrictToHorizontalAxis]}
                onDragEnd={handleDragEnd}
                sensors={sensors}
            >
                <div className="overflow-x-auto border border-gray-200 rounded-md">
                    <table className="w-full text-sm text-left">
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
                            {table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    onClick={() => row.toggleSelected()}
                                    className={cn(
                                        "border-b border-gray-100 cursor-pointer transition-colors",
                                        // Hover effect: light grey/light blue (using slate-50/blue-50 mix)
                                        "hover:bg-slate-50",
                                        // Selection effect: "ember" (amber/orange)
                                        row.getIsSelected() ? "bg-orange-100 hover:bg-orange-200" : ""
                                    )}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="px-4 py-3 text-gray-700">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </DndContext>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                <div>
                    Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, data.length)} of {data.length} records
                </div>
                <div className="flex items-center gap-2">
                    <button
                        className="p-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronsLeft size={16} />
                    </button>
                    <button
                        className="p-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="flex items-center gap-1">
                        <div>Page</div>
                        <strong>
                            {table.getState().pagination.pageIndex + 1} of{" "}
                            {table.getPageCount()}
                        </strong>
                    </span>
                    <button
                        className="p-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronRight size={16} />
                    </button>
                    <button
                        className="p-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronsRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
