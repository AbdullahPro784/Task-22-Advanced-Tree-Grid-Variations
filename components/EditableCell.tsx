import React, { useState, useEffect } from "react";

export const EditableCell = ({
    getValue,
    row,
    column,
    table,
}: {
    getValue: () => any;
    row: any;
    column: any;
    table: any;
}) => {
    const initialValue = getValue();
    const [value, setValue] = useState(initialValue);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const onBlur = () => {
        setIsEditing(false);
        table.options.meta?.updateData(row.index, column.id, value);
    };

    if (isEditing) {
        return (
            <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={onBlur}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        onBlur();
                    }
                }}
                autoFocus
                className="w-full px-2 py-1 border border-orange-500 rounded focus:outline-none"
            />
        );
    }

    return (
        <div onDoubleClick={() => setIsEditing(true)} className="cursor-text w-full h-full">
            {value}
        </div>
    );
};
