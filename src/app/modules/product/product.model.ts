import { Schema, model } from "mongoose";
import { IProduct, ProductModel } from "./product.interface";
import config from "../../../config";
import { Offer } from "../offer/offer.model";
import crypto from "crypto";
import { getRandomId } from "../../../shared/idGenerator";
const productSchema = new Schema<IProduct, ProductModel>(
    {
        shop: { 
            type: Schema.Types.ObjectId,
            ref: "User", 
            required: true,
            immutable: true
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
            immutable: true
        },
        image: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        discount: { type: Number, required: false },
        quantity: { type: Number, required: false },
        stock: { type: Boolean, default: true },
        status: {
            type: String,
            enum: ['Active', 'Delete'],
            default: "Active"
        },
        offer: {
            type: Schema.Types.ObjectId,
            ref: 'Offer',
            required: false
        },
        productId: { type: String, required: false, unique: true }
    },
    {
        timestamps: true

    }
);



productSchema.post('find',async function (products) {
    
    for (const product of products) {
        product.image = `http://${config.ip_address}:${config.port}${product.image}`;
        if(product.offer){
            const offer = await Offer.findById(product.offer);
            if(new Date(offer?.endDate!) > new Date()){
                product.discount = offer?.discount;
            }
           
        }
    }
    return products;
  
});

productSchema.post('findOne',async function (product: IProduct) {
    if(product?.offer){
        const offer = await Offer.findById(product?.offer);
        if(new Date(offer?.endDate!) > new Date()){
        product.discount = offer?.discount||product.discount;
        }
    }
})

productSchema.pre('save', async function (next) {
    this.productId = getRandomId("PROD",4);
    next();
})



export const Product = model<IProduct, ProductModel>('Product', productSchema);