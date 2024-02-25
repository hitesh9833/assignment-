const jwt = require('jsonwebtoken')
const privateKey = process.env.JWT_SECRET || 'qwertyuiopasdfghjklzxcvbnm'
exports.createToken = async (data) => {
    const token = await jwt.sign(data, privateKey);
    return token
}

exports.verification = async (token) => {
    const decodedValue =  jwt.verify(token, privateKey)
    console.log(decodedValue)
    return decodedValue
}
