const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    destination: function (req, file, next) {
        next(null, 'A:/Projects/WattSwap/WattSwap_Primary/server/public/images/')
    },
    filename: function (req, file, next) {
        console.log(file)
        next(null, new Date().toISOString().replace(/:/g, '-') + path.extname(file.originalname))
    },
});
const upload = multer({storage: storage})

module.exports = upload