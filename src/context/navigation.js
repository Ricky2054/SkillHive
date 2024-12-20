import { useState, createContext, useEffect } from "react";

const NavigationContext = createContext()
const NavigationProvider = ({ children }) => {
    const [currentPath, setCurrentPath] = useState(window.location.pathname);

    useEffect(() => {
        const handler = () => {
            setCurrentPath(window.location.pathname);
        }
        window.addEventListener("popstate", handler);

        return () => {
        }
    }, []);

    const navigate = (path) => {
        window.history.pushState({},'', path)
        setCurrentPath(path);
    }

    return <NavigationContext.Provider value={{ currentPath, navigate }}>
        {children}
    </NavigationContext.Provider>
}

export { NavigationContext };
export default NavigationProvider;