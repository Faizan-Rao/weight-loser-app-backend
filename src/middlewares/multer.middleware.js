
import multer from "multer";

const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, './public/uploads')
    },
    filename : (req, file, cb)=>{
        cb(null, Date.now() + "_weight_loser_" + file.originalname.toLowerCase().trim().replace(/\s/g, "_"))
    }
})

export const upload = multer({
    storage
})

