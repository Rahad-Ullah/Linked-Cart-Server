import { StatusCodes } from "http-status-codes";
import { IProduct } from "./product.interface";
import { Product } from "./product.model";
import { JwtPayload } from "jsonwebtoken";
import { disconnect, FilterQuery } from "mongoose";
import ApiError from "../../../errors/ApiErrors";
import QueryBuilder from "../../../helpers/QueryBuilder";
import { Bookmark } from "../bookmark/bookmark.model";
import { checkMongooseIDValidation } from "../../../shared/checkMongooseIDValidation";
import unlinkFile from "../../../shared/unlinkFile";
import { Offer } from "../offer/offer.model";

const createProductToDB = async (payload: IProduct): Promise<IProduct> => {
    if(!payload.offer){
        payload.offer = null as any;
    }
    const product = await Product.create(payload);

    if (!product) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create Product");
    }
    return product;
};

const retrievedProductsFromDB = async (user: JwtPayload, query: FilterQuery<any>): Promise<{ products: IProduct[], pagination: any }> => {

    const productsQuery = new QueryBuilder(
        Product.find({ status: "Active" }),
        query
    ).paginate().filter().search(["name", "color", "description"]);

    const [ products, pagination ] =  await Promise.all([
        productsQuery.queryModel.populate("category", "name").lean().exec(),
        productsQuery.getPaginationInfo()
    ]);

    const newProducts = await Promise.all(products.map(async (product: IProduct) => {
        const bookmark = await Bookmark.findOne({user: user?.id, product: product?._id});
        const offer = await Offer.findOne({ _id:product.offer});

        const discount = offer?.discount||product.discount;
        const currentPrice = product.price - (product.price * (discount||0)) / 100;
        const regularPrice = product.price;
        
        
        return {
            ...product,
            bookmark: !!bookmark,
            discount: discount,
            currentPrice: parseFloat(currentPrice.toFixed(2)),
            regularPrice,
        }
    }))

    return { products: newProducts, pagination }
}

const updateProductInDB = async (id: string, payload: IProduct): Promise<IProduct> => {

    checkMongooseIDValidation(id, "Product")
    if(payload.offer as any ==""){
        payload.offer = null as any;
    }
    const product: IProduct | null = await Product.findById(id).lean();
    if(payload.image){
        unlinkFile(product?.image as string);
    }

    payload.quantity = Number(payload.quantity||product?.quantity);
    payload.price = Number(payload.price||product?.price);

    if(payload?.quantity < 0){

        throw new ApiError(StatusCodes.BAD_REQUEST, "Quantity cannot be negative");
        
    }

    const updateProduct = await Product.findByIdAndUpdate(
        { _id: id },
        payload,
        { new: true }
    )

    if (!updateProduct) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update Product");
    }

    return updateProduct;

}

const deleteProductFromDB = async (id: string): Promise<IProduct> => {
    checkMongooseIDValidation(id, "Product")
    const deletedProduct = await Product.findByIdAndUpdate(
        id,
        { status: "Delete" },
        { new: true }
    );

    if (!deletedProduct) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to delete Product");
    }

    return deletedProduct;
}

const retrievedProductDetailsFromDB = async (id: string): Promise<IProduct> => {
    
    checkMongooseIDValidation(id, "Product")

    const product = await Product.findById(id).populate("category", "name").lean().exec();
    return product as IProduct;
}

const retrievedShopProductsFromDB = async (user: JwtPayload, query: FilterQuery<any>): Promise<{ products: IProduct[], pagination: any }> => {

    const productsQuery = new QueryBuilder(
        Product.find({ status: "Active", shop: user.id }),
        query
    ).paginate().filter().search(["name"]);

    const [ products, pagination ] =  await Promise.all([
        productsQuery.queryModel.populate("category", "name").lean().exec(),
        productsQuery.getPaginationInfo()
    ]);

    return { products, pagination }
}


export const ProductService = {
    createProductToDB,
    retrievedProductsFromDB,
    updateProductInDB,
    deleteProductFromDB,
    retrievedProductDetailsFromDB,
    retrievedShopProductsFromDB
}