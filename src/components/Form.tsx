import { Button, FormControl, FormControlLabel, FormGroup, FormLabel, Grid, Slider, Switch } from '@mui/material';
import React, { memo, useCallback, useMemo, useReducer } from 'react';

interface FormInput {
    label: string;
    type: 'slider' | 'switch';
    state: string;
    minLength?: number;
    maxLength?: number;
    marks?: { value: number, label: string }[]
    handler?: (event: Event, newValue: number | number[]) => void;
}

export interface FormData {
    passwordLength: number[];
    easyToSay: boolean;
    easyToRead: boolean;
    allCharacters: boolean;
    upperCase: boolean;
    lowerCase: boolean;
    numbers: boolean;
    symbols: boolean;
    amountPasswordsPerLength: number;
}

interface Props {
    minPassLength: number;
    maxPassLength: number;
    initalMinPassLength: number;
    initialMaxPassLength: number;
    minAmountPerPassLength: number;
    maxAmountPerPassLength: number;
    handleGeneratePassword: (values: FormData) => void;
}


type FormAction = { type: keyof FormData; payload: boolean | number | number[] };

// Define the reducer function
const formReducer = (state: FormData, action: FormAction): FormData => {
    const { type, payload } = action;
    return { ...state, [type]: payload };
};


const PasswordGeneratorForm = (props: Props) => {
    const {
        minPassLength, maxPassLength,
        initalMinPassLength, initialMaxPassLength,
        minAmountPerPassLength, maxAmountPerPassLength, handleGeneratePassword } = props;

    const [formData, dispatch] = useReducer(formReducer, {
        passwordLength: [initalMinPassLength, initialMaxPassLength],
        easyToSay: true,
        easyToRead: true,
        allCharacters: true,
        upperCase: true,
        lowerCase: true,
        numbers: true,
        symbols: true,
        amountPasswordsPerLength: 1,
    });

    const generateAmount = useMemo(() => {
        return (formData.passwordLength[1] - formData.passwordLength[0] + 1) * formData.amountPasswordsPerLength
    } ,[formData.passwordLength, formData.amountPasswordsPerLength])

    const handleInputChange = useCallback((property: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.type === 'checkbox' ? event.target.checked : Number(event.target.value);
        dispatch({ type: property, payload: value });
    }, []);

    const handlePasswordLengthChange = useCallback((event: Event, newValue: number | number[]) => {
        dispatch({ type: 'passwordLength', payload: newValue });
    }, []);

    const handleAmountPerLengthChange = useCallback((event: Event, newValue: number | number[]) => {
        dispatch({ type: 'amountPasswordsPerLength', payload: newValue });
    }, []);


    const formInputs = useCallback((): FormInput[] => {
        return [
            {
                label: 'Password length', state: 'passwordLength', type: 'slider', marks: [
                    {
                        value: minPassLength,
                        label: `${minPassLength} Chars`,
                    },
                    {
                        value: maxPassLength,
                        label: `${maxPassLength} Chars`,
                    },
                ],
                minLength: minPassLength,
                maxLength: maxPassLength,
                handler: handlePasswordLengthChange
            },
            {
                label: 'Passwords per length', state: 'amountPasswordsPerLength', type: 'slider', marks: [
                    {
                        value: minAmountPerPassLength,
                        label: `${minAmountPerPassLength}`,
                    },
                    {
                        value: maxAmountPerPassLength,
                        label: `${maxAmountPerPassLength}`,
                    },
                ], minLength: minAmountPerPassLength,
                maxLength: maxAmountPerPassLength, handler: handleAmountPerLengthChange
            },
            { label: 'Easy to Say', state: 'easyToSay', type: 'switch' },
            { label: 'Easy to Read', state: 'easyToRead', type: 'switch' },
            { label: 'All Characters', state: 'allCharacters', type: 'switch' },
            { label: 'Uppercase', state: 'upperCase', type: 'switch' },
            { label: 'Lowercase', state: 'lowerCase', type: 'switch' },
            { label: 'Numbers', state: 'numbers', type: 'switch' },
            { label: 'Symbols', state: 'symbols', type: 'switch' },
        ]
    }, []);

    return (
        <FormControl component="form" style={{ maxWidth: '80%', margin: 'auto', padding: '16px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <Grid container spacing={2} alignContent="center" alignItems="center" marginLeft={0} justifyContent={"center"} width={"100%"}>
                {formInputs().map((input) => (
                    <Grid item
                        xs={12}
                        sm={input.type === 'slider' ? 12 : 6}
                        md={input.type === 'slider' ? 12 : 6}
                        lg={input.type === 'slider' ? 6 : 3}
                        key={input.state}>
                        <Input
                            input={input}
                            value={formData[input.state as keyof FormData]}
                            handleSlideChange={input.handler!}
                            handleInputChange={handleInputChange}
                            marks={input.marks}
                            maxLength={input.maxLength}
                            minLength={input.minLength}
                        />
                    </Grid>
                ))}
            </Grid>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Button variant="contained" color="primary" onClick={() => handleGeneratePassword(formData)}>
                    Generate Passwords ({generateAmount})
                </Button>
            </div>
        </FormControl>
    );
};


interface InputProps {
    input: FormInput;
    value: number | number[] | string | boolean | undefined;
    maxLength?: number;
    minLength?: number;
    marks?: { value: number; label: string; }[];
    handleSlideChange: (event: Event, newValue: number | number[]) => void;
    handleInputChange: (property: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => void;
}
const Input = memo(({ input, value, minLength, maxLength, marks, handleInputChange, handleSlideChange }: InputProps) => {

    return <FormGroup ref={undefined} key={input.label} style={{ marginBottom: '16px' }}>
        {input.type === 'slider' ? (
            <div key={`slider_${input.label}_${input.state}`} style={{ paddingInline: '30px' }}>
                <FormLabel component="legend">{input.label}: {!Array.isArray(value) ? value : (value as number[]).join('-')}</FormLabel>
                <Slider
                    value={value as number[]}
                    min={minLength}
                    max={maxLength}
                    valueLabelDisplay="auto"
                    marks={marks}
                    step={1}
                    onChange={handleSlideChange}
                    aria-labelledby="password-length-slider"
                />
            </div>
        ) : (
            <FormControlLabel
                key={input.label}
                sx={{ display: 'flex', justifyContent: 'center' }}
                control={
                    <Switch
                        key={`switch_${input.label}`}
                        checked={value as boolean}
                        onChange={handleInputChange(input.state as keyof FormData)}
                    />
                }
                label={input.label}
            />
        )}
    </FormGroup>
}
)


export default memo(PasswordGeneratorForm);
