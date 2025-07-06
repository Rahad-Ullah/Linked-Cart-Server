import { model, Schema } from 'mongoose'
import { ICategory, CategoryModel } from './category.interface'
import config from '../../../config';

const CategorySchema = new Schema<ICategory, CategoryModel>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        image: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum : ["Active", "Delete"],
            default: "Active"
        }
    },
    { timestamps: true },
);

CategorySchema.post('find', function (categories) {
    categories.forEach((category: ICategory) => {
        if (category.image) {
            category.image = `http://${config.ip_address}:${config.port}${category.image}`;
        }
    });
});

export const Category = model<ICategory, CategoryModel>('Category', CategorySchema)