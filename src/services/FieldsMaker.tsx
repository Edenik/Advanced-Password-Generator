export type FieldSchema =
    | { type: 'string'; exclude_values?: string[] }
    | { type: 'number'; min?: number; max?: number; exclude_values?: number[] }
    | { type: 'boolean'; exclude_values?: boolean[] }
    | { type: 'enum'; enum: any[]; exclude_values?: any[] }
    | { type: 'date'; startDate?: Date; endDate?: Date; exclude_values?: Date[] }
    | { type: 'custom'; values: any[] }
    | { type: 'object'; properties: FieldsSchema }
    | { type: 'array'; itemSchema: FieldSchema }
    | { type: 'oneOf'; oneOf: FieldSchema[] }
    | { type: 'allOf'; allOf: FieldSchema[] }
    | { type: 'anyOf'; anyOf: FieldSchema[] };

export interface FieldsSchema {
    [key: string]: FieldSchema;
}

export type FieldValues = string[] | number[] | boolean[] | Date[] | any[][] | { [key: string]: any };


export function getFieldValues(fields: FieldsSchema): { [key: string]: any } {
    const values: { [key: string]: FieldValues } = {};

    for (const [name, schema] of Object.entries(fields)) {
        switch (schema.type) {
            case 'string':
                values[name] = [''];
                if (schema.exclude_values && schema.exclude_values.length > 0) {
                    values[name] = values[name].filter((value: string) => !schema.exclude_values?.includes(value));
                }
                break;

            case 'number':
                const { min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER } = schema;
                values[name] = [];
                if (min !== undefined && max !== undefined && min <= max) {
                    for (let i = min; i <= max; i++) {
                        values[name].push(i);
                    }
                }
                if (schema.exclude_values && schema.exclude_values.length > 0) {
                    values[name] = values[name].filter((value: number) => !schema.exclude_values?.includes(value));
                }
                break;

            case 'boolean':
                values[name] = [true, false];
                if (schema.exclude_values && schema.exclude_values.length > 0) {
                    values[name] = values[name].filter((value: boolean) => !schema.exclude_values?.includes(value));
                }
                break;

            case 'enum':
                values[name] = schema.enum;
                if (schema.exclude_values && schema.exclude_values.length > 0) {
                    values[name] = values[name].filter((value: any) => !schema.exclude_values?.includes(value));
                }
                break;

            case 'date':
                const { startDate = new Date(), endDate = new Date(), exclude_values = [] } = schema;
                values[name] = [];

                // Assuming startDate and endDate are provided in chronological order.
                // If not, you may want to add logic to handle that case.
                const currentDate = new Date(startDate);
                while (currentDate <= endDate) {
                    if (!exclude_values.some((excludedDate) => excludedDate.getTime() === currentDate.getTime())) {
                        values[name].push(new Date(currentDate));
                    }
                    currentDate.setDate(currentDate.getDate() + 1);
                }
                break;

            case 'custom':
                values[name] = schema.values;
                break;

            case 'object':
                values[name] = getFieldValues(schema.properties);
                break;

            case 'array':
                values[name] = getFieldValues({ item: schema.itemSchema });
                break;

            case 'oneOf':
                values[name] = [];
                for (const subSchema of schema.oneOf) {
                    const subValues = getFieldValues({ [name]: subSchema });
                    for (const subName in subValues) {
                        values[name].push(subValues[subName]);
                    }
                }
                break;

            case 'allOf':
                values[name] = schema.allOf.reduce((acc: FieldValues[], subSchema) => {
                    const subValues = getFieldValues({ [name]: subSchema });
                    for (const subName in subValues) {
                        acc.push(subValues[subName]);
                    }
                    return acc;
                }, []);
                break;
        }
    }

    return values;
}

export const fields: FieldsSchema = {
    name: { type: 'string', exclude_values: ['John', 'Jane'] },
    age: { type: 'number', min: 18, max: 65, exclude_values: [30, 40] },
    graduated: { type: 'boolean', exclude_values: [false] },
    role: { type: 'enum', enum: ['admin', 'manager', 'user'], exclude_values: ['user'] },
    joinDate: { type: 'date', startDate: new Date('2023-01-01'), endDate: new Date('2023-01-10'), exclude_values: [new Date('2023-01-05')] },
    customField: { type: 'custom', values: [100, 'customValue', true] },
    contactInfo: {
        type: 'object',
        properties: {
            email: { type: 'string' },
            phone: { type: 'string', exclude_values: ['555-1234'] },
        },
    },
    interests: { type: 'array', itemSchema: { type: 'string' } },
    userType: {
        type: 'oneOf',
        oneOf: [
            { type: 'string', exclude_values: ['guest'] },
            { type: 'enum', enum: ['user', 'admin'] },
        ],
    },
    multipleFields: {
        type: 'allOf',
        allOf: [
            { type: 'string' },
            { type: 'enum', enum: ['A', 'B', 'C'] },
        ],
    },
};