const jwt = require("jsonwebtoken")
const models = require("../models")

// const verifyToken = async (req, res, next ) => {
module.exports = async (req, res, next) => {

    try {
        const role = req.userDetails.roleId
        // const role = req.user.roleId
        const result = await models.rolePermission.findAll({
            where: { roleId: role },
            include: [
                {
                    model: models.permissionSystemInfo
                }
            ]

        })
        let match = false;
        result.map((e) => {
            if (e.dataValues.permissionSystemInfo.dataValues.systemInfo.method === req.method && e.dataValues.permissionSystemInfo.dataValues.systemInfo.baseUrl === req.baseUrl && e.dataValues.permissionSystemInfo.dataValues.systemInfo.path == req.url) {
                match = true
            }
        })
        if (match) {
            next()
        } else {
            res.status(403).json({ message: 'forbidden' })
        }
    } catch (err) {
        console.log(err)
        return res.status(401).json({ status: true, message: "Please signin again!", data: err })
    }
}