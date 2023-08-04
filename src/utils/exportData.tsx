import { Dictionary } from "../services/Maker";
import { createPasswordLabel } from "./common";
import { Data } from "./utils";

interface TextTableColumn {
    header: string;
    fieldName: string;
    alignment?: 'left' | 'center' | 'right';
}

const columns: TextTableColumn[] = [
    { header: 'Password', fieldName: 'password' },
    { header: 'Strength', fieldName: 'strength' },
    { header: 'Length', fieldName: 'length' },
    { header: 'All characters', fieldName: 'allCharacters' },
    { header: 'Easy to read', fieldName: 'easyToRead' },
    { header: 'Easy to say', fieldName: 'easyToSay' },
    { header: 'Lower case', fieldName: 'lowerCase' },
    { header: 'Upper case', fieldName: 'upperCase' },
    { header: 'Numbers', fieldName: 'numbers' },
    { header: 'Symbols', fieldName: 'symbols' },
];

function drawTable(columns: TextTableColumn[], data: Record<string, string>[]): string {
    // Calculate the maximum width for each column
    const columnWidths: number[] = columns.map(column => {
        const dataLengths = data.map(row => row[column.fieldName].length);
        return Math.max(column.header.length, ...dataLengths);
    });

    // Function to draw a horizontal line
    const drawLine = () => '+' + columnWidths.map(width => '-'.repeat(width + 6)).join('+') + '+';

    // Draw the table header
    const header = drawLine() + '\n' +
        '|' + columns.map((column, index) => padText(column.header, columnWidths[index], 2, column.alignment)).join('|') + '|' + '\n' +
        drawLine();

    // Draw the table data
    const rows = data.map(row => '|' + columns.map((column, index) => padText(row[column.fieldName], columnWidths[index], 2, column.alignment)).join('|') + '|');

    return header + '\n' + rows.join('\n') + '\n' + drawLine();
}

// Function to pad text within a given width and align the content based on the specified alignment
function padText(text: string, width: number, paddingSize: number, alignment: 'left' | 'center' | 'right' = 'left'): string {
    const padding = width - text.length + paddingSize * 2;
    const leftPadding = padding > 0 ? ' '.repeat(Math.floor(padding / 2)) : '';
    const rightPadding = padding > 0 ? ' '.repeat(Math.ceil(padding / 2)) : '';

    if (alignment === 'right') {
        return " " + leftPadding + rightPadding + text + " ";
    } else if (alignment === 'left') {
        return " " + text + leftPadding + rightPadding + " ";
    } else { // center
        return " " + leftPadding + text + rightPadding + " ";
    }
}

function escapeAndWrapDoubleQuotes(value: string): string {
    // If the value contains double quotes, escape them by doubling them and then wrap the whole value in double quotes.
    if (value.includes('"')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    // If the value does not contain double quotes, return it as is.
    return value;
  }
  

type FileFormat = "json" | "txt";


const mapData = (data: Data[]) => {
    return data.map((row) => {
        return {
            password: row.password,
            strength: createPasswordLabel(row.score ?? 0),
            length: row.length.toString(),
            allCharacters: row.values.allCharacters.toString(),
            easyToRead: row.values.easyToRead.toString(),
            easyToSay: row.values.easyToSay.toString(),
            lowerCase: row.values.lowerCase.toString(),
            upperCase: row.values.upperCase.toString(),
            numbers: row.values.numbers.toString(),
            symbols: row.values.symbols.toString(),
        }
    }) as Dictionary<string>[];
}
export function exportData(data: Data[], format: FileFormat) {
    let fileData: string;
    let fileName: string;
    let mimeType: string;

    switch (format) {
        case "json":
            fileData = JSON.stringify(data);
            fileName = "data.json";
            mimeType = "application/json";
            break;
        case "txt":
            fileData = drawTable(columns, mapData(data));
            fileName = "data.txt";
            mimeType = "text/plain";
            break;
        default:
            throw new Error("Unsupported file format.");
    }

    const blob = new Blob([fileData], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = fileName;
    link.href = url;
    link.click();
}
