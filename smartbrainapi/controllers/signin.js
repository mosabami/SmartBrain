const  { Password }  = require('../helpers/password');
const passwordHasher = new Password()

const tableName = 'users'
const handleSignin = (req,res,db) => {
    let { email, password } = req.body
    if (!email || !password) {
        return res.status(400).json('incorrect form submision')
    }
    db.select('email','hash').from('login')
        .where('email','=',email)
        .then(data => {
            console.log(data)
            const { email,hash } = data[0];
            if(passwordHasher.compare(hash, password)) {
                console.log('the hash is',hash);
                return db.select('*').from(tableName)
                .where('email','=',email)
                .then(user => {
                    // console.log(user);
                    res.json(user[0]);
                })
                .catch(err =>res.status(400).json('unable to get user'))
                // 
            } else {
                res.status(400).json('wrong credential')
            }
        }).catch(err=> res.status(400).json('wrong credentil'))
}

module.exports = {
    handleSignin:handleSignin
}
