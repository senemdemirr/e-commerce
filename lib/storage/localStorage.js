const STORAGE_KEY = "user";

export function isLocalStorageExists() {
    return localStorage.getItem(STORAGE_KEY) ? true : false;
}

export function getAllUser() {
    const users = isLocalStorageExists() ? localStorage.getItem(STORAGE_KEY) : null;
    return users ? JSON.parse(users) : [];
}

export function addUser(user) {
    const users = getAllUser();
    users.push(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function checkUser(user) {
    const users = getAllUser();
    if (!users) return;
    const userCheck = users.find(u => u.email === user.email);
    return userCheck ? true : false;
}

export function updateUser(user) {
    const users = getAllUser();
    const newData = users.map(u => {
        if (u.email === user.email) {
            return { ...u, password: user.newPassword };
        }
        return u;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
}

export function clearUser(user) {
    const users = getAllUser();
    if(!users) return;
        const newData = users.filter(u => u.email !== user.email);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
}