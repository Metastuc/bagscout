export function chunkArray<T>(array: Array<T>, chunkSize: number): Array<Array<T>> {
    const chunks: Array<Array<T>> = [];

    for (let index = 0; index < array.length; index += chunkSize) {
        chunks.push(array.slice(index, index + chunkSize));
    }

    return chunks;
}
