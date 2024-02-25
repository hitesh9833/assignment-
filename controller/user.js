const models = require("../models")
const multer = require("multer")
const path = require("path")
const sendEmail = require("../utils/sendEmail")
const Sequelize = models.Sequelize
const { createToken } = require('../utils/jwt')
const fs = require('fs');
const { addRoleQuery, registerQuery, loginQuery, logoutQuery, getAllRegisterUserQuery } = require('../service/user')
const bcrypt = require("bcryptjs")


const addRole = async (req, res) => {
    const role = await addRoleQuery(req)
    return res.status(200).json({ role })
}

const register = async (req, res) => {
    const result = await registerQuery(req)
    res.status(200).send({
        msg: "register successfully",
        data: result
    })
}

const login = async (req, res) => {
    const result = await loginQuery(req)
    res.send(result)
}
const logout = async (req, res) => {
    // console.log(req.userDetails.email);
    const result = await logoutQuery(req)
    res.json({
        msg: "logout successfully",
        result: result
    })
}
const getAllRegisterUser = async (req, res) => {
    const result = await getAllRegisterUserQuery(req)
    res.send(result);
}

const uploadResume = async (req, res) => {
    var storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, "public/resume")
        },
        filename: (req, file, cb) => {
            cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
        }
    })

    const txtFileFilter = function (req, file, cb) {
        if (file.mimetype === 'text/plain') {
            cb(null, true);
        } else {
            cb(new Error('Only .txt files are allowed!'), false);
        }
    }

    const upload = multer({ storage: storage, fileFilter: txtFileFilter }).single('filename')
    upload(req, res, async (err) => {
        if (err) {
            console.log(err)
            return res.status(400).json({ message: "File not valid" })
        }
        console.log(req.file)
        req.file.destination = req.file.destination + "/" + req.file.filename
        return res.status(200).json({ message: "resume uploaded", data: req.file })
    })

}
const emailSend = async (req, res) => {
    let data = await models.user.findOne({
        where: { email: req.body.email }
    })
    let response = {};
    if (data) {
        let otpCode = Math.floor((Math.random() * 10000) + 1)
        let data = await models.otp.create({
            email: req.body.email,
            code: otpCode,
        })
        let text = `<html>
        <body style="text-align:center">
                <p style="font-size:28px"><b>Welcome to My Job App</b></p>
        <p style="font-size:20px">Your One Time Password(${otpCode}) is</p>
        <span style="font-size: 20px;
            border: 1px solid;
            border-radius: 7px;
            padding: 8px 50px;">8521</span>
        </body>
        </html>`;
        sendEmail(req.body.email, "OTP verification", text)
        response.statusType = "success"
        response.message = "please check your email"
        response.data = data
    }
    else {
        response.statusType = "error"
        response.message = "email Id does not exist"
    }
    res.send(response);
}
const changePassword = async (req, res) => {
    let data = await models.otp.findOne({
        where: { code: req.body.otp }
    })
    // 
    data.destroy();
    let response = {};
    if (data != null) {

        let result = await models.user.findOne({
            where: { email: req.body.email }
        })
        if (result) {
            const hashpassword = await bcrypt.hash(req.body.password, 10);
            let data = await models.user.update({
                password: hashpassword
            },
                {
                    where: { email: req.body.email }
                })
            response.message = "Successfully change password"
            response.statusText = "Success"
            res.send(response);
        }
        else {
            response.message = "email not found"
            response.statusText = "error"
            res.send(response);
        }

        // res.send(response);
    }
    else {
        response.message = "otp not matched"
        response.statusText = "error"
        res.send(response);
    }

}

// Function to check file existence
const checkFileExistence = async (filePath) => {
    return new Promise((resolve, reject) => {
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};


const readResume = async (req, res) => {
    const filePath = `public/resume/${req.query.filename}`;

    try {

        await checkFileExistence(filePath);


        const fileStream = fs.createReadStream(filePath);


        let fileData = '';
        fileStream.on('data', (chunk) => {
            fileData += chunk;
        });

        fileStream.on('end', async () => {
            res.status(200).json({ ResumeData: fileData });
        });

        fileStream.on('error', (err) => {
            console.error('Error reading input file:', err);
            res.status(500).send("Something went wrong");
        });
    } catch (err) {
        console.error('Error accessing input file:', err);
        if (err.code === 'ENOENT') {
            res.status(404).send("File Not Found");
        } else {
            res.status(500).send("Something went wrong");
        }
    }
};

const deleteFile = async (filePath) => {
    try {
        await fs.promises.unlink(filePath);
        console.log('File deleted successfully');
    } catch (err) {
        throw err;
    }
};

const removeFile = async (req, res) => {
    const fileName = req.query.filename;
    const filePath = path.join('public/resume', fileName);

    try {
        await fs.promises.access(filePath, fs.constants.F_OK);

        await deleteFile(filePath);

        res.status(200).send("File deleted successfully");
    } catch (err) {
        console.error('Error deleting file:', err);
        if (err.code === 'ENOENT') {
            res.status(404).send("File Not Found");
        } else {
            res.status(500).send("Something went wrong");
        }
    }
};

const getFileList = async (req, res) => {
    const folderPath = req.query.folderPath; // Path of the folder whose files you want to list

    try {
        // Check if the folder exists
        await fs.promises.access(folderPath, fs.constants.F_OK);

        // Read the contents of the folder
        fs.readdir(folderPath, (err, files) => {
            if (err) {
                console.error('Error reading folder contents:', err);
                res.status(500).send("Error reading folder contents");
            } else {
                res.status(200).json({ files });
            }
        });
    } catch (err) {
        console.error('Error accessing folder:', err);
        if (err.code === 'ENOENT') {
            res.status(404).send("Folder Not Found");
        } else {
            res.status(500).send("Something went wrong");
        }
    }
};

module.exports = {
    addRole,
    register,
    login,
    logout,
    getAllRegisterUser,
    uploadResume,
    emailSend,
    changePassword,
    readResume,
    removeFile,
    getFileList

}