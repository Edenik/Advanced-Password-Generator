import { Dictionary } from "../utils/interfaces";

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


export interface GeneratedObject {
    [key: string]: any;
}

export function randomChoice<T>(values: T[]): T {
    return values[Math.floor(Math.random() * values.length)];
}
// Define the types for better type safety
type OptionValues = string[] | number[] | boolean[]; // Add more types as needed
type Options = Record<string, OptionValues>;



export function generateObjects(
  options: Options,
  numObjects: number,
  unique: boolean = false,
  amountPerObject: number = 1,
): GeneratedObject[] {
  const generated: GeneratedObject[] = [];
  const generatedSet: Set<string> = new Set();

  // Helper function to check object uniqueness
  const isObjectUnique = (obj: GeneratedObject): boolean => {
    const objString = Object.entries(obj)
      .map(([key, value]) => `${key}:${value}`)
      .join(',');
    return !generatedSet.has(objString);
  };

  while (generated.length < (numObjects * amountPerObject)) {
    const obj: GeneratedObject = {};
    for (const prop in options) {
      if (options.hasOwnProperty(prop)) {
        const values = options[prop];
        const randomIndex = Math.floor(Math.random() * values.length);
        obj[prop] = values[randomIndex];
      }
    }

    for (let i = 0; i < amountPerObject; i++) {
      if (unique) {
        if (isObjectUnique(obj)) {
          generated.push(obj);
          generatedSet.add(Object.entries(obj).map(([key, value]) => `${key}:${value}`).join(','));
        }
      } else {
        generated.push(obj);
      }
    }
  }

  return generated;
}
export function calculateUniqueObjects(options: Dictionary<any[]>): number {
    let combinations: any[] = [[]];
    for (const values of Object.values(options)) {
        combinations = combinations.flatMap((combo) => values.map((value) => [...combo, value]));
    }

    const uniqueObjects = new Set(combinations.map((combo) => JSON.stringify(combo))); // Explicitly specify the type for the parameter.
    return uniqueObjects.size;
}
