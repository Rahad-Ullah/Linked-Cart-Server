import { StatusCodes } from 'http-status-codes'
import ApiError from '../../../errors/ApiErrors'
import { ICategory } from './category.interface'
import { Category } from './category.model'
import unlinkFile from '../../../shared/unlinkFile'
import { checkMongooseIDValidation } from '../../../shared/checkMongooseIDValidation'

const createCategoryToDB = async (payload: ICategory) => {
  const { name, image } = payload;
  const isExistName = await Category.findOne({ name: name })

  if (isExistName) {
    unlinkFile(image);
    throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "This Category Name Already Exist");
  }

  const createCategory: any = await Category.create(payload)
  if (!createCategory) {
    unlinkFile(image);
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create Category')
  }

  return createCategory
}

const getCategoriesFromDB = async (): Promise<ICategory[]> => {
  const result = await Category.find({ status: "Active" })
  return result;
}

const updateCategoryToDB = async (id: string, payload: ICategory) => {

  checkMongooseIDValidation(id, "Category");

  const isExistCategory: any = await Category.findById(id);

  if (!isExistCategory) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Category doesn't exist");
  }

  if (payload.image) {
    unlinkFile(isExistCategory?.image);
  }

  const updateCategory = await Category.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  })

  return updateCategory
}

const deleteCategoryToDB = async (id: string): Promise<ICategory | null> => {
  checkMongooseIDValidation(id, "Category");

  const deleteCategory = await Category.findByIdAndUpdate(
    id,
    { status: "Delete" },
    { new: true }
  );

  return deleteCategory
}

export const CategoryService = {
  createCategoryToDB,
  getCategoriesFromDB,
  updateCategoryToDB,
  deleteCategoryToDB
}
