export const paginateArray = (array: any[], query:Record<string,any>) => {
  let limit = Number(query?.limit) || 30;
  let page = Number(query?.page) || 1;
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const arr = array.slice(startIndex, endIndex)
  const total = arr.length;
  return {
      data:arr ,
      pagination: {
          total,
          page,
          limit,
          totalPage: Math.ceil(array.length / limit),
      }
  };
};