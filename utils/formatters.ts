
export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
};

export const parseCurrencyToNumber = (value: string): number => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return 0;
    return Number(digits) / 100;
};

export const maskCurrencyInput = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '0,00';
    const val = Number(digits) / 100;
    return formatCurrency(val);
};

export const formatPercent = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value);
};

export const parsePercentToNumber = (value: string): number => {
    const digits = value.replace(/[^0-9,]/g, '').replace(',', '.');
    const val = Number(digits);
    return isNaN(val) ? 0 : val;
};
