import express from "express";
import { applyPartner } from "../controllers/PartnerController.js";
import { upload } from "../middlewares/upload.js";
import protect from "../middlewares/protect.js";

const PartnerRouter = express.Router();

PartnerRouter.post(
  "/apply",protect,
  upload.fields([
    { name: "idProof", maxCount: 1 },
    { name: "skillProof", maxCount: 1 },
  ]),
  applyPartner  
);


export default PartnerRouter;
