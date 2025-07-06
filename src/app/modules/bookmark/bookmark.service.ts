import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { IBookmark } from "./bookmark.interface";
import { Bookmark } from "./bookmark.model";
import { JwtPayload } from "jsonwebtoken";
import { FilterQuery } from "mongoose";
import QueryBuilder from "../../../helpers/QueryBuilder";

const toggleBookmark = async (payload: IBookmark): Promise<string> => {

    // Check if the bookmark already exists
    const existingBookmark = await Bookmark.findOne(payload);

    if (existingBookmark) {
        // If the bookmark exists, delete it
        await Bookmark.findByIdAndDelete(existingBookmark._id);
        return "Bookmark Remove successfully";
    } else {

        // If the bookmark doesn't exist, create it
        const result = await Bookmark.create(payload);
        if (!result) {
            throw new ApiError(StatusCodes.EXPECTATION_FAILED, "Failed to add bookmark");
        }
        return "Bookmark Added successfully";
    }
};


const getBookmark = async (user: JwtPayload, query: FilterQuery<any>): Promise<{bookmarks:IBookmark[], pagination:any}> => {

    const bookmarksQuery = new QueryBuilder(
        Bookmark.find({ user: user?.id }),
        query
    ).paginate();

    const [bookmarks, pagination] = await Promise.all([
        bookmarksQuery.queryModel.populate("product").select("product").lean().exec(),
        bookmarksQuery.getPaginationInfo()
    ]);

    return {  bookmarks, pagination }

}

export const BookmarkService = { toggleBookmark, getBookmark }