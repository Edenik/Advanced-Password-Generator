import { Dictionary } from "../services/Maker";
import { ScoreResult } from "../services/PasswordGenerator";

export type Order = 'asc' | 'desc';


export interface Data {
    id: string;
    password: string;
    message: string | string[];
    score: number | undefined;
    scoreResult: ScoreResult | undefined;
    length: number;
    success: boolean;
    values: {
        [x: string]: any;
    };
}

export interface Column {
    disablePadding: boolean;
    id: keyof Data;
    label: string;
    numeric: boolean;
    width?: string;
    canCopy?: boolean;
    renderer?: (row: Data) => JSX.Element | string
}

export function descendingComparator(a: Dictionary<any>, b: Dictionary<any>, orderBy: string) {
    if (getNestedPropertyValue(b, orderBy) < getNestedPropertyValue(a, orderBy)) {
        return -1;
    }
    if (getNestedPropertyValue(b, orderBy) > getNestedPropertyValue(a, orderBy)) {
        return 1;
    }
    return 0;
}

export function getComparator<Key extends keyof any>(
    order: Order,
    orderBy: Key,
): (
    a: { [key in Key]: number | string | boolean | undefined | { [x: string]: any; } },
    b: { [key in Key]: number | string | boolean | undefined | { [x: string]: any; } },
) => number {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy as string)
        : (a, b) => -descendingComparator(a, b, orderBy as string);
}

export function stableSort<T>(array: T[], comparator: (a: T, b: T) => number) {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) {
            return order;
        }
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

export function getNestedPropertyValue<T extends Record<string, any>, K extends keyof T>(obj: T, propertyName: string): T[K] | undefined {
    const properties: string[] = propertyName.split('.');

    for (let prop of properties) {
        if (!obj || !obj.hasOwnProperty(prop)) {
            return undefined;
        }
        obj = obj[prop] as T;
    }

    return obj as T[K];
}

type Row = {
    id: string | number;
};

export function arrayToDictionary<T extends Row>(arr: T[]): Record<string | number, T> {
    return arr.reduce((dict, row) => {
        dict[row.id] = row;
        return dict;
    }, {} as Record<string | number, T>);
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const getFormattedDateForFileName = (): string => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so we add 1
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}
