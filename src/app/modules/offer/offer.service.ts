import unlinkFile from "../../../shared/unlinkFile";
import { IOffer } from "./offer.interface";
import { Offer } from "./offer.model";

const createOffer = async (payload: IOffer): Promise<IOffer | null> => {
    const result = await Offer.create(payload);
    return result;
};
const getAllOffer = async (): Promise<IOffer[] | null> => {
    const result = await Offer.find({status: "Active"}).sort({createdAt: -1});
    return result;
};

const updateOffer = async (id: string, payload: IOffer): Promise<IOffer | null> => {
    const existOffer = await Offer.findById(id);
    if(!existOffer){
        throw new Error("Offer not found");
    }
    if(payload.image){
        unlinkFile(existOffer.image);
    }
    const result = await Offer.findByIdAndUpdate(id, payload, { new: true });
    return result;
};

const deleteOffer = async (id: string): Promise<IOffer | null> => {
    const existOffer = await Offer.findById(id);
    if(!existOffer){
        throw new Error("Offer not found");
    }
    unlinkFile(existOffer.image);
    const result = await Offer.findByIdAndDelete(id);
    return result;
};

export  const OfferService = {
    createOffer,
    getAllOffer,
    updateOffer,
    deleteOffer
};