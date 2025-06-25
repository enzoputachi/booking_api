

export const buildTripQuery = (
    { 
    filter = {}, 
    sort = { createdAt: 'desc'}, 
    page = 1, 
    pageSize = 10,
    } = {}

) => {
    const where = {...filter};
    const orderBy = sort;
    const skip = (page -1) * pageSize;;
    const take = pageSize;
    return {
        where,
        orderBy,
        skip,
        take,
    };
}