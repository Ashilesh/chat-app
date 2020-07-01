const users = [];

const addUser = ({id, name, room}) => {
    console.log('add User');

    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // check if there is already existing user with same name
    const existingUser = users.find((user) => user.room === room && user.name === name);

    if(existingUser) {

        // handle this to frontend
        console.log('error - Username is taken');
        return {error : "Username is taken."}
    }

    const user = {id, name, room};
    users.push(user);

    console.log(users);

    return {user};
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);

    if(index !== -1){

        // delete one element from array located in 'index' and return 1st element
        return users.splice(index, 1)[0];
    }

}

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = {addUser, removeUser, getUser, getUsersInRoom};