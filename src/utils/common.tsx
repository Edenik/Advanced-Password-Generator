export const passwordStrengthLabels: Record<number, string> = {
    0: 'Weak',
    1: 'Weak',
    2: 'Fair',
    3: 'Good',
    4: 'Strong',
};

export const passwordStrengthColors: Record<string, string> = {
    Weak: '#F25F5C',
    Fair: '#FFE066',
    Good: '#247BA0',
    Strong: '#70C1B3',
};

export const createPasswordLabel = (score: number): string => {
    return passwordStrengthLabels[score] || 'Weak';
};