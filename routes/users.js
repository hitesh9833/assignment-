var express = require('express');
var router = express.Router();
const { wrapper } = require("../utils/errorWrap")
const expressValidator = require("../middleware/validationError")
const { verifyToken } = require("../middleware/auth")
const checkPermission = require("../middleware/checkPermission")
const { addRole, register, login, logout, uploadResume, emailSend, changePassword, getAllRegisterUser, readResume, removeFile, getFileList } = require("../controller/user");
const { userValidation } = require('../validation/register');


/* GET users listing. */
router.post('/role', verifyToken, checkPermission, wrapper(addRole));
router.post('/register', userValidation, expressValidator, (register))
router.post('/login', wrapper(login))
router.post("/forgot-password", wrapper(emailSend))
router.post('/changePassword', wrapper(changePassword))
router.delete('/logout', verifyToken, wrapper(logout))
router.post("/resume", verifyToken, wrapper(uploadResume));
router.get('/register/user', verifyToken, wrapper(getAllRegisterUser))
router.get('/read-resume', verifyToken, wrapper(readResume))
router.delete('/remove-file/', verifyToken, wrapper(removeFile))  //admin
router.get('/file-list', verifyToken, wrapper(getFileList))   // admin 
module.exports = router;
