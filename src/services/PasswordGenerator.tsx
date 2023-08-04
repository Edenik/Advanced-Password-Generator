
import zxcvbn from 'zxcvbn';

interface CharTypes {
    uppercase: boolean;
    lowercase: boolean;
    digits: boolean;
    symbols: boolean;
}

export interface GeneratePasswordProps {
    passwordLength?: number;
    easyToSay?: boolean;
    easyToRead?: boolean;
    allCharacters?: boolean;
    upperCase?: boolean;
    lowerCase?: boolean;
    numbers?: boolean;
    symbols?: boolean;
}
export enum PatternType {
    consecutiveDigits,
    consecutiveLowercaseLetters,
    consecutiveUppercaseLetters,
    consecutiveSymbols,
}

interface ValidationResult {
    success: boolean;
    message: string | string[];
    score?: number;
    scoreResult?: ScoreResult;
}

export interface ScoreResult {
    guesses: number;
    guesses_log10: number;
    sequence: Sequence[];
    calc_time: number;
    crack_times_seconds: CrackTimesSeconds;
    crack_times_display: CrackTimesDisplay;
    score: number;
    feedback: Feedback;
}

export interface CrackTimesDisplay {
    online_throttling_100_per_hour: string;
    online_no_throttling_10_per_second: string;
    offline_slow_hashing_1e4_per_second: string;
    offline_fast_hashing_1e10_per_second: string;
}

export interface CrackTimesSeconds {
    online_throttling_100_per_hour: number;
    online_no_throttling_10_per_second: number;
    offline_slow_hashing_1e4_per_second: number;
    offline_fast_hashing_1e10_per_second: number;
}

export interface Feedback {
    warning: string;
    suggestions: any[];
}

export interface Sequence {
    pattern: string;
    token: string;
    i: number;
    j: number;
    guesses: number;
    guesses_log10: number;
}


class PasswordGenerator {
    private bannedPasswords: Set<string>;
    private consecutiveLimit: number;
    private commonPatterns: Array<[RegExp, string]>;
    private minLimit: number;
    private maxLimit: number;

    constructor(consecutiveLimit: number = 3, minLimit = 6, maxLimit = 700) {
        this.bannedPasswords = new Set(["password", "123456", "qwerty"]);
        this.consecutiveLimit = consecutiveLimit;
        this.minLimit = minLimit;
        this.maxLimit = maxLimit;
        this.commonPatterns = [
            [new RegExp(`\\d{${consecutiveLimit}}`), `repeated ${consecutiveLimit} consecutive digits`],
            [new RegExp(`[a-z]{${consecutiveLimit}}`), `repeated ${consecutiveLimit} consecutive lowercase letters`],
            [new RegExp(`[A-Z]{${consecutiveLimit}}`), `repeated ${consecutiveLimit} consecutive uppercase letters`],
            [new RegExp(`[!@#$%^&*(),.?":{}|<>]{${consecutiveLimit}}`), `repeated ${consecutiveLimit} consecutive symbols`],
        ];
    }

    private calculateCharacterSetsEntropy(charTypes: CharTypes): number {
        const totalCharacterSets = Object.values(charTypes).filter((value) => value).length;
        const bitsPerCharacterSet = Math.log2(totalCharacterSets);
        return bitsPerCharacterSet;
    }

    private calculatePasswordEntropy(password: string): number {
        const charTypes: CharTypes = {
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            digits: /\d/.test(password),
            symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        };

        const bitsPerCharacterSet = this.calculateCharacterSetsEntropy(charTypes);
        const passwordLength = password.length;
        return bitsPerCharacterSet * passwordLength;
    }

    private checkPasswordStrength(password: string): ValidationResult {
        const scoreResult = zxcvbn(password) as ScoreResult;
        const { score } = scoreResult;

        if (score >= 3) {
            return { success: true, message: "Password strength is sufficient.", score, scoreResult };
        }
        return { success: false, message: "Password strength is not sufficient.", score, scoreResult };
    }

    private countCharacterVariety(password: string, minVariety: number): ValidationResult {
        const charTypes: CharTypes = {
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            digits: /\d/.test(password),
            symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        };
        const varietyCount = Object.values(charTypes).filter((value) => value).length;
        if (varietyCount >= minVariety) {
            return { success: true, message: `Password contains at least ${minVariety} character types (uppercase, lowercase, digits, symbols).` };
        }
        return { success: false, message: `Password should include at least ${minVariety} character types (uppercase, lowercase, digits, symbols).` };
    }

    private checkCommonBannedPasswords(password: string): ValidationResult {
        const commonBannedPassword = Array.from(this.bannedPasswords).find((commonPassword) => password.toLowerCase().includes(commonPassword));
        if (commonBannedPassword) {
            return { success: false, message: `Password is a common or easily guessable password. Found in banned passwords: '${commonBannedPassword}'.` };
        }
        return { success: true, message: "Password is not a common or easily guessable password." };
    }

    private checkPatterns(password: string): ValidationResult {
        const patternMessages = this.commonPatterns
            .map(([pattern, explanation]) => {
                const patternMatch = password.match(pattern);
                if (patternMatch) {
                    const commonPattern = patternMatch[0];
                    return `${explanation}: '${commonPattern}' found.`;
                }
                return null;
            })
            .filter((message) => message !== null);

        if (patternMessages.length) {
            return { success: false, message: "Password contains common patterns:\n" + patternMessages.join("\n") };
        }
        return { success: true, message: "Password does not contain common patterns." };
    }

    public validatePassword(password: string, minVariety: number = 3): ValidationResult {
        const checks: ValidationResult[] = [
            this.checkPasswordStrength(password),
            this.countCharacterVariety(password, minVariety),
            this.checkCommonBannedPasswords(password),
            this.checkPatterns(password),
        ];

        const errorMessages: string[] = checks.filter((check) => !check.success).map((check) => check.message).flat();
        const explanation = errorMessages.length ? errorMessages : ["Password is strong! It meets all the criteria to resist attacks."];

        // Calculate the score as the percentage of successful checks

        return { success: checks[0].success, score: checks[0].score, scoreResult: checks[0].scoreResult,  message: explanation };
    }

    public generatePassword({ passwordLength = 12, easyToSay = true, easyToRead = true,
        allCharacters = true, upperCase = true, lowerCase = true,
        numbers = true, symbols = true }: GeneratePasswordProps): string {
        if (passwordLength < this.minLimit || passwordLength > this.maxLimit) {
            throw new Error(`Password length must be between ${this.minLimit} and ${this.maxLimit}`);
        }

        let allowedChars = "";

        if (easyToSay) {
            allowedChars += "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".replace(/[lI]/g, 'I');
        } else {
            if (lowerCase) {
                allowedChars += "abcdefghijklmnopqrstuvwxyz";
            }
            if (upperCase) {
                allowedChars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            }
        }

        if (easyToRead) {
            allowedChars = allowedChars.replace(/[oO0]/g, 'o');
        } else {
            if (numbers) {
                allowedChars += "0123456789";
            }
            if (symbols) {
                allowedChars += "!@#$%^&*(),.?\":{}|<>";
            }
        }

        if (allCharacters) {
            allowedChars += "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*(),.?\":{}|<>";
        }

        if (!allowedChars) {
            throw new Error("Invalid combination, try again");
        }

        let generatedPassword = '';
        for (let i = 0; i < passwordLength; i++) {
            generatedPassword += allowedChars[Math.floor(Math.random() * allowedChars.length)];
        }

        return generatedPassword;
    }
}

export default PasswordGenerator;
