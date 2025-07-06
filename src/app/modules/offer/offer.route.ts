import express from "express";
import { OfferController } from "./offer.controller";
import validateRequest from "../../middlewares/validateRequest";
import { OfferValidation } from "./offer.validation";
import fileUploadHandler from "../../middlewares/fileUploaderHandler";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
const router = express.Router();
router.route('/')
    .post(auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),fileUploadHandler(),validateRequest(OfferValidation.createOfferZodSchema), OfferController.createOffer)
    .get(OfferController.getAllOffer)

router.route('/:id')
    .patch(auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),fileUploadHandler(),validateRequest(OfferValidation.createOfferZodSchema.partial()), OfferController.updateOffer)
    .delete(auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),OfferController.deleteOffer)

export const OfferRoutes = router;