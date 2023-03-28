const  { Password }  = require('../helpers/password');
const passwordHasher = new Password()

const tableName = 'users'
const handleSignin =async  (req,res,db) => {
    let { email, password } = req.body
    if (!email || !password) {
        return res.json({'error':'incorrect form submision'})
    }
    db.select('email','hash').from('login')
        .where('email','=',email)
        .then(async data => {
            // console.log("the data i got from login is",data)
            const { email,hash } = data[0];
            const correctpass = await passwordHasher.compare(hash, password)
            // console.log("was the password correct?",correctpass)
            if(correctpass === true) {
                console.log('the hash is',hash);
                return db.select('*').from(tableName)
                .where('email','=',email)
                .then(user => {
                    // console.log("the user i found is ",user);
                    res.json(user[0]);
                })
                .catch(err =>res.json({"error":"unable to get user"}))
                // .catch(err =>res.status(400).json('unable to get user'))
                // 
            } else {
                res.status.json({'error':'wrong credentials were provided'})
            }
        }).catch(err=> res.json({'error':'wrong credentials'}))
}

module.exports = {
    handleSignin:handleSignin
}
