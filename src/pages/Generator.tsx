import { useCallback, useState } from 'react';
import PasswordGeneratorForm, { FormData } from '../components/Form';
import PasswordStrengthMeter from '../components/PasswordStrangeMeter';
import EnhancedTable from '../components/Table';
import { FieldsSchema, calculateUniqueObjects, generateObjects, getFieldValues } from '../services/FieldsMaker';
import PasswordGenerator from '../services/PasswordGenerator';
import { Column, Data, sleep } from '../utils/utils';

const fields = (formData?: FormData): FieldsSchema => {
    return {
        passwordLength: { type: 'number', min: formData?.passwordLength[0] ?? 6, max: formData?.passwordLength[1] ?? 40 },
        easyToSay: { type: 'boolean', exclude_values: [!formData?.easyToSay ?? null] },
        easyToRead: { type: 'boolean', exclude_values: [!formData?.easyToRead ?? null] },
        allCharacters: { type: 'boolean', exclude_values: [!formData?.allCharacters ?? null] },
        upperCase: { type: 'boolean', exclude_values: [!formData?.upperCase ?? null] },
        lowerCase: { type: 'boolean', exclude_values: [!formData?.lowerCase ?? null] },
        numbers: { type: 'boolean', exclude_values: [!formData?.numbers ?? null] },
        symbols: { type: 'boolean', exclude_values: [!formData?.symbols ?? null] },
    };

}

const generate = (generator: PasswordGenerator, formData?: FormData) => {
    const values = getFieldValues(fields(formData));
    const totalPossible = calculateUniqueObjects(values);
    const objects = generateObjects(values, totalPossible, false, formData?.amountPasswordsPerLength);

    const errors = [];
    const results = [];
    for (const possibleProps of objects) {
        try {
            const password = generator.generatePassword({ ...possibleProps });
            const { message, score, success, scoreResult } = generator.validatePassword(password); // Replace this function call with the actual implementation
            const resultExtended = { id: `${crypto.randomUUID()}`, password, length: password.length, message, score, scoreResult, success, values: { ...possibleProps } };
            results.push(resultExtended);
        } catch (e) {
            errors.push({ values: { ...possibleProps }, error: e });
        }
    }

    return results;
}

const columns: Column[] = [
    {
        id: 'password',
        numeric: false,
        canCopy: true,
        disablePadding: true,
        width: '35%',
        label: 'Password',
    },
    {
        id: 'length',
        numeric: true,
        canCopy: true,
        disablePadding: false,
        width: '5%',
        label: 'Length',
    },
    {
        id: 'scoreResult.crack_times_seconds.offline_fast_hashing_1e10_per_second' as keyof Data,
        numeric: true,
        disablePadding: false,
        canCopy: true,
        label: 'Offline fast hashing 1e10 per second',
        width: '10%',
        renderer: (row: Data) => `${row.scoreResult?.crack_times_display.offline_fast_hashing_1e10_per_second ?? ''}`,
    },
    {
        id: 'scoreResult.crack_times_seconds.offline_slow_hashing_1e4_per_second' as keyof Data,
        numeric: true,
        disablePadding: false,
        canCopy: true,
        label: 'Offline slow hashing 1e4 per second',
        width: '10%',
        renderer: (row: Data) => `${row.scoreResult?.crack_times_display.offline_slow_hashing_1e4_per_second ?? ''}`,
    },
    {
        id: 'scoreResult.crack_times_seconds.online_no_throttling_10_per_second' as keyof Data,
        numeric: true,
        disablePadding: false,
        canCopy: true,
        label: 'Online no throttling 10 per second',
        width: '10%',
        renderer: (row: Data) => `${row.scoreResult?.crack_times_display.online_no_throttling_10_per_second ?? ''}`,
    },
    {
        id: 'scoreResult.crack_times_seconds.online_throttling_100_per_hour' as keyof Data,
        numeric: true,
        disablePadding: false,
        canCopy: true,

        label: 'Online throttling 100 per hour',
        width: '10%',
        renderer: (row: Data) => `${row.scoreResult?.crack_times_display.online_throttling_100_per_hour ?? ''}`,
    },
    {
        id: 'score',
        numeric: false,
        disablePadding: false,
        label: 'Strength',
        width: '15%',
        renderer: (row: Data) => <PasswordStrengthMeter score={row.score!} message={row.message as string[]} />,
    },
];

const MIN_PASS_LENGTH = 6
const MAX_PASS_LENGTH = 100
const INITIAL_MIN_PASS_LENGTH = 10
const INITIAL_MAX_PASS_LENGTH = 20
const MIN_AMOUNT_PASS_LENGTH = 1
const MAX_AMOUNT_PASS_LENGTH = 100

const generator = new PasswordGenerator();


const Generator = () => {
    const [rows, setRows] = useState<Data[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasGenerated, setHasGenerated] = useState<boolean>(false);

    const generateAndSet = useCallback(async (formData?: FormData) => {
        setLoading(true)
        setHasGenerated(true)
        await sleep(500)
        const data = generate(generator, formData)
        setRows(data);
        setLoading(false);
    }, [])

    const handleGeneratePassword = useCallback((values: FormData) => { setLoading(true); generateAndSet(values) }, [generateAndSet])

    return (
        <div className="App">
            <PasswordGeneratorForm
                handleGeneratePassword={handleGeneratePassword}
                initalMinPassLength={INITIAL_MIN_PASS_LENGTH} initialMaxPassLength={INITIAL_MAX_PASS_LENGTH}
                maxPassLength={MAX_PASS_LENGTH} minPassLength={MIN_PASS_LENGTH} 
                minAmountPerPassLength={MIN_AMOUNT_PASS_LENGTH} maxAmountPerPassLength={MAX_AMOUNT_PASS_LENGTH} />
            {hasGenerated ?
                <EnhancedTable rows={rows} columns={columns} loading={loading} /> : <></>}
        </div>
    );
}

export default Generator;
