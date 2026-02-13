
/**
 * Utility to clean up request bodies and parse dates for Prisma
 */
export const prepareData = (body: any, dateFields: string[] = []) => {
    const data = { ...body };

    // Remove specific fields that shouldn't be sent to Prisma updates/creates
    const fieldsToRemove = ['id', 'createdAt', 'updatedAt'];
    fieldsToRemove.forEach(field => delete data[field]);

    // Remove objects/arrays (likely relations) to avoid Prisma nested update errors
    Object.keys(data).forEach(key => {
        const val = data[key];
        if (val && typeof val === 'object' && !dateFields.includes(key) && !(val instanceof Date)) {
            delete data[key];
        }
    });

    // Convert date strings to Date objects
    dateFields.forEach(field => {
        if (data[field]) {
            data[field] = new Date(data[field]);
        }
    });

    return data;
};
