import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext()


export function UserProvider({children}) {
    const [currentUser, setCurrentUser] = useState(()=> {
        const savedUserId = localStorage.getItem('currentUserId');
        return savedUserId  ? parseInt(savedUserId) : null;
    })

    const [users, setUsers] = useState([])


    const createNewUser = () => {{
        const newUserId = Math.floor(Math.random()*100000)+1;

          const newUser = {
            id: newUserId,
            username: `User_${newUserId}`,
            created_at: new Date().toISOString()
        };
        setCurrentUser(newUserId)
        localStorage.setItem('currentUserId', newUserId)
        return newUser
    }}


    useEffect(()=> {
         if (!currentUser) {
            createNewUser();
        }
    }, [])
    
    return (
        <UserContext.Provider value={{currentUser, users,createNewUser}}>
            {children}
        </UserContext.Provider>
    )
}
export function useUser() {
    const context = useContext(UserContext)
    if (!context) {
        throw new Error('error UserProvider');
    }
    return context
}

