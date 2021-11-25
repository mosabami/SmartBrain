const database = {
    users: [
        {
            id:'123',
            name:'John',
            email:'john@gmail.com',
            password: 'cookies',
            entries: 0,
            join: new Date()
        },
        {
            id:'124',
            name:'Sally',
            email:'sally@gmail.com',
            password: 'bananas',
            entries: 0,
            join: new Date()
        },
    ]
}

let selectedUser = database.users.filter(user => (user.id === '123'))[0]
selectedUser.entries = selectedUser.entries + 1
console.log(selectedUser)