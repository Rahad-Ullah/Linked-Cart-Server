import mongoose from "mongoose";
import { ICart } from "./cart.interface";
import { Product } from "../product/product.model";
import { JwtPayload } from "jsonwebtoken";
import { Cart } from "./cart.model";
import { IProduct } from "../product/product.interface";

const makeCartToDB = async (user: JwtPayload, cart: ICart): Promise<ICart> => {

    if (!mongoose.Types.ObjectId.isValid(cart.product)) {
        throw new Error('Invalid product id');
    }
    cart.quantity = cart.quantity || 1;

    const isExistProduct: IProduct | null = await Product.findById(cart.product).lean();

    if(isExistProduct?.quantity! < cart.quantity) {
        throw new Error('This product is out of stock');
    }
    
    if (!isExistProduct) {
        throw new Error('Product not found');
    }

    const payload = {
        quantity: cart.quantity,
        product: cart.product,
        user: user.id,
        shop: isExistProduct.shop
    }

    const isExistCart = await Cart.findOne({
        product: cart.product,
        user: user.id
    });

    if (isExistCart) {
        await Cart.findByIdAndUpdate(
            { _id: isExistCart?._id },
            {
                $inc: { quantity: Number(cart.quantity) }
            },
            { new: true }
        );
        return isExistCart;
    }

    const newCart: ICart = await Cart.create(payload);
    if (!newCart) {
        throw new Error('Failed to add product to cart');
    }

    return newCart
}

const deleteCartFromDB = async (user: JwtPayload, cart: string): Promise<ICart | null> => {


    const cartExist = await Cart.findOneAndDelete({
        _id: cart,
        user: user.id
    });


    

    if (!cartExist) {
        throw new Error('Failed to delete product from cart');
    }

    return cartExist;
}

const decreaseCartQuantityFromDB = async (user: JwtPayload, productId: string): Promise<ICart | null> => {

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error('Invalid product id');
    }

    const cartExist = await Cart.findOne({
        product: productId,
        user: user.id
    });

    if (!cartExist) {
        throw new Error('Product not found in cart');
    }

    if (cartExist.quantity <= 1) {
        await Cart.findOneAndDelete({ product: productId, user: user._id });
        return null;
    }

    
    const updatedCart = await Cart.findByIdAndUpdate(
        {_id : cartExist._id},
        {
            $inc: {
                quantity: -1
            }
        },
        { new: true }
    );

    return updatedCart;
};

const increaseCartQuantityFromDB = async (user: JwtPayload, productId: string): Promise<ICart | null> => {

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error('Invalid product id');
    }
    const product = await Product.findById(productId);
    if (!product) {
        throw new Error('Product not found');
    }
    if (product.quantity <= 0) {
        throw new Error('Product quantity is not enough');
    }

    const cartExist = await Cart.findOne({
        product: productId,
        user: user.id
    });
    
    
    if (!cartExist) {
        throw new Error('Product not found in cart');
    }
    
    const updatedCart = await Cart.findByIdAndUpdate(
        {_id : cartExist._id},
        {
            $inc: {
                quantity: + 1
            }
        },
        { new: true }
    );

    return updatedCart;
};


const getCartFromDB = async (user: JwtPayload) => {
   const cartsData = await Cart.aggregate([
  {
    $match: {
      user: new mongoose.Types.ObjectId(user.id),
    },
  },
  {
    $lookup: {
      from: "products",
      localField: "product",
      foreignField: "_id",
      as: "productInfo",
    },
  },
  {
    $unwind: "$productInfo"
  },
  {
    $group: {
      _id: "$shop",
      totalQuantity: { $sum: 1 },
      cartId: { $first: "$_id" },
      products: {
        $push: {
          _id: "$_id",
          product: "$productInfo",
          quantity: "$quantity",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",

        },
      },
    },
  },
  {
    $lookup: {
      from: "users",
      localField: "_id",
      foreignField: "_id",
      as: "shop",
      pipeline: [
        {
          $project: {
            name: 1,
            email: 1,
            role: 1,
            contactNo: 1,
            address: 1,
            profile: 1,
          },
        },
      ]
    },
  },
  {
    $addFields:{
        shop: {
            $arrayElemAt: ["$shop", 0]
        }
    }
  }
 

]);

const paymentStatus = await Cart.find({user:user.id}).populate('product').exec();

const totalPrice = paymentStatus.reduce((acc:any, cart:any) => {

    const price = (cart.product.price - (cart.product.price * cart.product.discount) / 100) * cart.quantity;
    
    return acc + price;

    

}, 0);
const delivery_charge = 67.5;
const total = totalPrice + delivery_charge;
    return {
        cartsData:cartsData.map((cart:any) => {
            const products = cart.products.map((product:any) => {
                const productItem = {
                    ...product.product,
                    price: (product.product.price - (product.product.price * product.product.discount) / 100) 
                }
                
                return {
               ...product,
               product:productItem
                }
            })
            
            
            return {
                ...cart,
                products
            }
        }),
        payment:{
            subtotal:totalPrice,
            delivery_charge:delivery_charge,
            total:total
        }
    };
}

export const CartService = {
    makeCartToDB,
    deleteCartFromDB,
    decreaseCartQuantityFromDB,
    getCartFromDB,
    increaseCartQuantityFromDB
};