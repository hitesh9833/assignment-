const { verification} = require('../utils/jwt')
const db = require('../models')
const redisClient = require('../utils/redis')


const verifyToken = async (req, res, next) => {
    if (req.headers.authorization) {
        let authHeader = req.headers.authorization
        //  console.log(authHeader);
        const token = authHeader.split(' ')[1]
        // console.log(token);
        const tokenInRedis = await redisClient.get(token)
        
        if (tokenInRedis) {
            let result = await verification(tokenInRedis)
                req.userDetails = result
            next()
        } else {

            const tokenFound =await db.userToken.findOne({
                where: {
                    token
                }
            })
            if (tokenFound) {
                let result = await verification(token)
                req.userDetails = result
                if (result) {
                    const data = await db.user.findOne({
                        where: {
                            email: result.email,
                            isActive:true
                        }
                    })
                    if (data) {
                    
                        await redisClient.setEx(token, 1800, token)
                        next()
                    } else {
                        return res.status(401).json({ success: false, message: '1Token Validation Failed...! \n UnAuthorised' })
                    }
                }
                else {
                    return res.status(401).json({ success: false, message: '2Token Validation Failed...! \n UnAuthorised' })
                }
            } else {
                return res.status(401).json({ success: false, message: '3Token Validation Failed...! \n UnAuthorised' })
            }
        }
    } else {
        return res.status(401).json({ success: false, message: '4Token Validation Failed...! \n UnAuthorised' })
    }
}


// module.exports = { TokenVerifier }


module.exports={
    verifyToken
}