
/**
 * Utility to clean up request bodies and parse dates for Prisma
 */
export const prepareData = (body: any, dateFields: string[] = []) => {
    const data = { ...body };

    // Remove ID if present to let Prisma handle it
    delete data.id;

    // Convert date strings to Date objects
    dateFields.forEach(field => {
        if (data[field]) {
            data[field] = new Date(data[field]);
        }
    });

    return data;
};
