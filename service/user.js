const models = require("../models")
const multer = require("multer")
const path = require("path")
const sendEmail = require("../utils/sendEmail")
const Sequelize = models.Sequelize
const { createToken } = require('../utils/jwt')
const bcrypt = require("bcryptjs")
const role = require('../config/role.json')
const sequelize = models.sequelize
const { QueryTypes } = require("sequelize");
const { query } = require("express")
const Op = Sequelize.Op

const addRoleQuery = async (req) => {
    const { roleName, description } = req.body
    if (req.query.raw == "query") {
        const roleExists = await models.sequelize.query(`SELECT 
            *
           FROM 
             "role" AS "role" 
             where "role"."role_name"='${roleName}'
             `, {
            type: QueryTypes.SELECT
        })
        if (roleExists.length == 0) { return "role already exists" }
        else {
            const role = models.sequelize.query(`INSERT INTO "role" ("role_name","description")
            VALUES ('${roleName}','${description}')`)
            return role
        }
    }
    else {
        const roleExists = await models.role.findOne({ where: { roleName: roleName } })
        if (roleExists) return res.status(400).json({ message: "Role already exists" })
        const role = await models.role.create({ roleName, description })
        return role
    }
}

const registerQuery = async (req) => {
    const { name, email, mobilenumber, password } = req.body
    if (req.query.raw == query) {
        const userExists = await models.sequelize.query(`select * from "user"
        where "user"."email"='${email}'`)
        if (userExists.length == 0) {
            return "user already Exists"
        }
        else {
            const result = await models.sequelize.query(`INSERT INTO "user" ("name","email","mobilenumber","password","roleId","is_active")
            VALUES ('${name}','${email}','${mobilenumber}','${password}',${2},'${true}')`)
            return result
        }
    }
    else {
        const userExists = await models.user.findOne({
            where: { email: email }
        })
        if (userExists) {
            //res.status(401).json({ message: "User already Exists" })
            return "User already Exists"
        }
        else {
            const result = await models.user.create({ name, email, mobilenumber, password, roleId: 2, is_active: true })
            return result
        }
    }
}

const loginQuery = async (req) => {
    const { email, password } = req.body
    const result = await models.user.findOne({
        where: {
            email: email
        }
    })
    if (!result) {
        return "user not found"

    } else {
        const checkPassword = await result.comparePassword(password)
        if (checkPassword) {
            //  console.log(result.dataValues.roleId)
            const token = await createToken({
                email: result.dataValues.email,
                mobileNumber: result.dataValues.mobileNumber,
                roleId: result.dataValues.roleId,
                id: result.dataValues.id
            })
            await models.userToken.create({
                userId: result.dataValues.id,
                token: token
            })
            return req.data = {
                message: "User Login Successfully",
                token: token,
                name: result.name,
                email: result.email
            }
        } else {
            return req.data = {
                message: "Wrong Credentials"
            }
        }
    }
}

const logoutQuery = async (req) => {
    const user = await models.user.findOne({
        where: { email: req.userDetails.email }
    })
    const remove = await models.userToken.destroy({
        where: { userId: user.id }
    })
    return remove
}

const getAllRegisterUserQuery = async (req) => {
    if (req.query.raw == "query") {
        const result = await models.sequelize.query(`SELECT 
        *
      FROM 
        "user" AS "user" 
        LEFT JOIN "role" AS "role" ON "user"."role_id" = "role"."id"`, {
            type: QueryTypes.SELECT
        })
        return result
    } else {
        const result = await models.user.findAll({
            include: [{
                model: models.role
            }]
        })
        return result
    }
}
module.exports = {
    addRoleQuery,
    registerQuery,
    loginQuery,
    logoutQuery,
    getAllRegisterUserQuery,
}