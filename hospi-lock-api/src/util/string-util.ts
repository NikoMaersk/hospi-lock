

export function capitalizeFirstLetter(str: string): string {
    const newStr = `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
    return newStr;
}