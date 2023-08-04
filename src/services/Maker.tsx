export interface Dictionary<T> {
    [key: string]: T;
}

export interface GeneratedObject {
    [key: string]: any;
}

export interface SortingField {
    name: string;
    order: "asc" | "desc"
}

export type FunctionProperties<T> = {
    [K in keyof T]: T[K];
  };

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
