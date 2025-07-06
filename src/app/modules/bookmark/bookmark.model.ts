import { model, Schema } from "mongoose";
import { IBookmark, BookmarkModel } from "./bookmark.interface"

const bookmarkSchema = new Schema<IBookmark, BookmarkModel>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true
        }
    }, 
    {
        timestamps: true
    }
);

export const Bookmark = model<IBookmark, BookmarkModel>("Bookmark", bookmarkSchema);