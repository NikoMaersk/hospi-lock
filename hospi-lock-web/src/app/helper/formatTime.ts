export interface DateAndTime {
    date: string,
    time: string,
}

export function formatEpochTime(date: Date): DateAndTime {
    const pad = (num: number): string => num.toString().padStart(2, '0');

    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    const newDate: string = `${day}-${month}-${year}`;
    const time: string = `${hours}:${minutes}:${seconds}`;

    return { date: newDate, time };
}