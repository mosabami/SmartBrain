const { scrypt, randomBytes } = require('crypto');
const { promisify } = require('util');

const scryptAsync = promisify(scrypt)
class Password {
    toHash = async (password) => {
        const salt = randomBytes(8).toString('hex')
        const buff = (await scryptAsync(password, salt,64));
        console.log('this is first he',`${buff.toString('hex')}.${salt}`)
        return `${buff.toString('hex')}.${salt}`;
    }

    compare = async (storedPassword,suppliedPassword) => {
        console.log("stored password", storedPassword)
        const [hashPassword,salt] = storedPassword.split('.');
        console.log(salt)
        const buff = (await scryptAsync(suppliedPassword, salt,64));
        // return false;
        return buff.toString('hex') === hashPassword;
    }
}


module.exports = {
    Password,
  };