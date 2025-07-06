import { USER_ROLES } from "../../../enums/user";
import { IShop, IUser } from "./user.interface";
import { JwtPayload, Secret } from 'jsonwebtoken';
import { Shop, User } from "./user.model";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import generateOTP from "../../../util/generateOTP";
import { emailTemplate } from "../../../shared/emailTemplate";
import { emailHelper } from "../../../helpers/emailHelper";
import unlinkFile from "../../../shared/unlinkFile";
import { IChangePassword } from "../../../types/auth";
import bcrypt from 'bcrypt';
import config from "../../../config";
import stripe from "../../../config/stripe";
import { jwtHelper } from "../../../helpers/jwtHelper";
import QueryBuilder from "../../builder/queryBuilder";
import { calculateDistance, getLatLongFromAddress } from "../../../helpers/distanceCalculator";
import { sendLocation } from "../../../helpers/locationHelper";


const createUserToDB = async (payload: Partial<IUser & IShop>): Promise<IUser> => {
    const createUser = await User.create(payload);
    if (!createUser) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
    }

    //send email
    const otp = generateOTP();
    const values = {
        name: createUser.name,
        otp: otp,
        email: createUser.email!
    };




    const createAccountTemplate = emailTemplate.createAccount(values);
    emailHelper.sendEmail(createAccountTemplate);

    //save to DB
    const authentication = {
        oneTimeCode: otp,
        expireAt: new Date(Date.now() + 3 * 60000),
    };

    if(createUser.role === USER_ROLES.SHOP){
        const latLong = await getLatLongFromAddress(payload.address!);
        await User.findByIdAndUpdate(createUser._id, {
            $set: {
                latitude: latLong.lat,
                longitude: latLong.long,
            },
        });

    }
    await User.findOneAndUpdate(
        { _id: createUser._id },
        { $set: { authentication } }
    );

    return createUser;
};

const getUserProfileFromDB = async (user: JwtPayload): Promise<Partial<IUser>> => {
    const { id } = user;
    const shopId = id;
    const shop = await User.findById(shopId);
    console.log("shop", shop)

    let isExistUser: any = await Shop.findById(id);
    if (!isExistUser) {
        if(shop){
            isExistUser=shop
        }else{
            throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
        }
        
    }
    return isExistUser;
};

const updateProfileToDB = async (user: JwtPayload, payload: Partial<IUser & IShop>): Promise<Partial<IUser | null>> => {
    const { id } = user;
    const isExistUser = await User.isExistUserById(id);
    if (!isExistUser) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }

    //unlink file here
    if (payload.profile) {
        unlinkFile(isExistUser.profile);
    }
    console.log(payload);
    

    const updateDoc = await User.findOneAndUpdate(
        { _id: id },
        payload,
        { new: true }
    );
    return updateDoc;
};


const changePasswordToDB = async (user: JwtPayload, payload: IChangePassword) => {

    const { currentPassword, newPassword, confirmPassword } = payload;
    const isExistUser = await Shop.findById(user.id).select('+password');
    if (!isExistUser) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }

    //current password match
    if (currentPassword && !(await User.isMatchPassword(currentPassword, isExistUser.password))) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect');
    }

    //newPassword and current password
    if (currentPassword === newPassword) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Please give different password from current password');
    }

    //new password and confirm password check
    if (newPassword !== confirmPassword) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Password and Confirm password doesn't matched");
    }

    //hash password
    const hashPassword = await bcrypt.hash(newPassword, Number(config.bcrypt_salt_rounds));

    const updateData = {
        password: hashPassword,
    };

    await User.findOneAndUpdate({ _id: user.id }, updateData, { new: true });
};

// delete user
const deleteUserFromDB = async (user: JwtPayload, password: string) => {

    if (!password) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid Password")
    }

    const isExistUser = await User.findById(user.id).select('+password');
    if (!isExistUser) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }

    //check match password
    if (password && !(await User.isMatchPassword(password, isExistUser.password))) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect');
    }

    const updateUser = await User.findByIdAndDelete(user.id);
    if (!updateUser) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    return;
};

const shopUpdateToDB = async (user: JwtPayload, payload: IShop&IUser) => {

    const shopId = user.id;
    if(payload.address){
        const latlang =await getLatLongFromAddress(payload.address);
        await Shop.findByIdAndUpdate(shopId, {
            $set: {
                latitude: (latlang).lat,
                longitude: latlang.long,
            },
        });
    }
    const shop = await Shop.findByIdAndUpdate(
        shopId,
        payload,
        { new: true }
    );

    if (!shop) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update shop information")
    }
}

const addStripeAccountToDB = async (user: JwtPayload) => {

  
    const existingUser = await User.findById(user.id).select("+accountInformation").lean();
    if (existingUser?.accountInformation?.accountUrl) {

        return existingUser?.accountInformation?.accountUrl
    }

    // Create account for Canada
    const account = await stripe.accounts.create({
         type: "express",
    country: "US",
    email: user.email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: "individual",
    individual: {
      first_name: existingUser?.name,
      email: existingUser?.email,
    },
    business_profile: {
      mcc: "7299",
      product_description: "Freelance services on demand",
      url: "https://yourplatform.com",
    },

    });

    if (!account) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create account.");
    }

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: 'http://10.0.80.75:5000/failed',
        return_url: 'https://10.0.80.75:5000/success',
        type: 'account_onboarding',
    });

    // Update the user account with the Stripe account ID
    const updateAccount = await User.findOneAndUpdate(
        { _id: user.id },
        {
            $set: {
                "accountInformation.stripeAccountId": account.id
            }
        },
        { new: true }
    );

    if (!updateAccount) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update account.");
    }

    return accountLink?.url; // Return the onboarding link
}

const getStoresFromDB = async (user: JwtPayload, query: Record<string, any>) => {
    if([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(user.role)){
       const shopQuery = new QueryBuilder(Shop.find({role:USER_ROLES.SHOP}),query).paginate().sort()
       const [shops,pagination]= await Promise.all([shopQuery.modelQuery.lean(),shopQuery.getPaginationInfo()])
       return {shops,pagination}
    }

    const userData = await User.findById(user.id).select('+accountInformation').lean()

    const shops = await User.find({ role: USER_ROLES.SHOP }).limit(query.close?4:100).lean().exec()
    if(!userData?.latitude){
        return shops
    }
    const mapShops = await Promise.all(shops.map(async (shop:any) => {
        const distance = await calculateDistance(userData?.latitude!, userData?.longitude!, shop?.address);
        return {
            ...shop,
            distance
        };
    }).sort((a:any, b:any) => a.distance - b.distance))

    return mapShops


    
}

const getStoreByIdFromDBForDriver = async (user: JwtPayload) => {
    const shops = await User.find({ role: USER_ROLES.SHOP,address:{
        $exists: true   
    } }).lean().exec()

    const userData = await User.findById(user.id).select('+accountInformation').lean()
    if(!userData?.latitude){
        return []
    }
    const mapShops = await Promise.all(shops.filter(async (shop:any) => {

        const distance = await calculateDistance(userData?.latitude!, userData?.longitude!, shop?.address);
        if(typeof distance !== 'number'){
            return false
        }
       
        
        return distance < 100
    }))
    

    sendLocation(userData._id.toString(), mapShops)

    return mapShops
  
}

const getUsersDataForAdminFromDb = async (query: Record<string, any>) => {
    const userQuery = new QueryBuilder(User.find({}),query).paginate().sort().filter()
    const [users,pagination]= await Promise.all([userQuery.modelQuery.lean(),userQuery.getPaginationInfo()])
    return {users,pagination}
}

const createShopper = async (payload: IUser) => {
    const isExistUser = await User.isExistUserByEmail(payload.email);
    if (isExistUser) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User already exist!");
    }
    // @ts-ignore
    if(!payload.nid_image || !payload.driverLicense){
        throw new ApiError(StatusCodes.BAD_REQUEST, "Please upload your NID and Driver License");
    }
    const createUser = await User.create({
        ...payload,
        role: USER_ROLES.SHOPPER,
        verified: true,
       
    });

    const emailTemplateDa = emailTemplate.addDeliveryBoy({password:payload.password,email:payload.email,name:payload.name});
    await emailHelper.sendEmail(emailTemplateDa)
    return createUser;
};

const changeUserStatus = async (userId:string)=>{
    const user = await User.findById(userId)
    if(!user){
        throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    const updateUser = await User.findByIdAndUpdate(userId,{verified:!user.verified},{new:true})
    return updateUser
}

export const UserService = {
    createUserToDB,
    getUserProfileFromDB,
    updateProfileToDB,
    changePasswordToDB,
    deleteUserFromDB,
    shopUpdateToDB,
    addStripeAccountToDB,
    getStoresFromDB,
    getStoreByIdFromDBForDriver,
    getUsersDataForAdminFromDb,
    createShopper,
    changeUserStatus
};