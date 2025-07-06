import { Model, Types } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';

interface IStripeAccountInfo {
    status?: boolean;
    stripeAccountId?: string;
    accountUrl?: string;
    externalAccountId?: string;
}

interface IAuthenticationProps {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
}

export type IUser = {
    name: string;
    role: USER_ROLES;
    contact: string;
    email: string;
    password: string;
    profile: string;
    verified: boolean;
    deviceToken?:string;
    authentication?: IAuthenticationProps;
    accountInformation?: IStripeAccountInfo;
    latitude?: number;
    longitude?: number;
    nid_image:string
    address?: string;
}

export type IShop = IUser & {
    shopImage: string;
    shopName: string;
    tradeLicense: number;
    bin: number;
    shopContact: string;
    address: string;
};



export type UserModal = {
    isExistUserById(id: string): any;
    isExistUserByEmail(email: string): any;
    isAccountCreated(id: string): any;
    isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;