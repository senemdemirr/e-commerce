const STORAGE_KEY = "user";

export function getUser() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
}
export function addUser(user) {
    const users = getUser() ?? [];
    users.push(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}
export function checkUser(user) {
    const users = getUser();
    if (users) {
        const userCheck = users.find(u => u.email === user.email);
        if (userCheck) {
            return true;
        }
        else {
            return false;
        }

    }
}
export function updateUser(user) {
    const users = getUser();
    const newData = users.map(u => {
        if (u.email === user.email) {
            return { ...u, password: user.newPassword };
        }
        return u;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
}
export function clearUser(user) {
    const users = getUser();
    if (users) {
        const newData = users.filter(u => u.email !== user.email && u.password !== user.password);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
    }
}