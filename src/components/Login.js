import { useEffect, useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import Input from "./Input";
import { FaArrowsRotate } from "react-icons/fa6";
import useNavigation from "../hooks/useNavigation";
// import { useAuth } from '../context/AuthContext';
import { useLoginMutation, useSignupMutation } from "../store";


const LoginFeature = () => {
    const [isSignUp, setIsSignUp] = useState(true);
    const [opacity, setOpacity] = useState(false);
    
    const [login, { isLoading: isLoginLoading, error: loginError }] = useLoginMutation();
    const [signup, { isLoading: isRegisterLoading, error: registerError }] = useSignupMutation();
    
    const { navigate } = useNavigation();
    // const authToken =window.localStorage.getItem('authToken')
    
    // if(authToken) {
    //     navigate('/dashboard')
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isSignUp) {
                const userData = {
                    email: e.target.Email.value,
                    username: e.target.username.value,
                    password: e.target.password.value,
                };
                const result = await signup(userData);
                console.log(result)
                localStorage.setItem('authToken', result.token);
                navigate('/dashboard');
            } else {
                const isValidEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(e.target.Email.value);
                if (!isValidEmail) {
                    throw new Error('Please enter a valid email address');
                }
                const userData = {
                    email: e.target.Email.value,
                    password: e.target.password.value,
                };
                const result = await login(userData);
                console.log(result)
                localStorage.setItem('authToken', result.token);
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('Failed:', err);
        }
    };

    const InputsFields = [
        {
            name: "username",
            placeholder: "Username",
            minlength: 3,
            maxlength: 20,
            required: true,
            showOnLogin: false,
        },
        {
            name: "Email",
            placeholder: "Email",
            minlength: null,
            maxlength: null,
            required: true,
            showOnLogin: true,
        },
        {
            name: "password",
            placeholder: "Password",
            minlength: null,
            maxlength: null,
            required: true,
            showOnLogin: true,
        },
    ];

    let ErrorsMap = new Map();
    let ErrorsMsg = "An unexpected error occurred.";
    if (loginError || registerError) {
        console.log(loginError || registerError)
    }

    let Inputs = InputsFields.map((data, i) => {
        const ErrorObject = ErrorsMap.get(data?.name);
        if (isSignUp || data.showOnLogin) {
            return (
                <Input key={i} data={data} ErrorObject={ErrorObject} />
            );
        }
        return null;
    }).filter(Boolean);

    const isLoading = isLoginLoading || isRegisterLoading;
    const error = loginError || registerError;

    useEffect(() => {
        const opacityPause = setTimeout(() => {
            setOpacity(true)
        }, 1000);
        
        return () => {
            clearTimeout(opacityPause)
        }
    }, [])

    return (
        <div className={`flex flex-row justify-center items-center bg-white w-[42rem] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 rounded-lg shadow-lg transition-opacity duration-1000 ease-in-out ${opacity ? 'opacity-100' : 'opacity-0'}`}>
            <div className="p-10 text-[#3399ff] text-2xl font-semibold w-80">
                {isSignUp ? "Create your account" : "Login to your account"}
            </div>
            <div className="p-2 text-[#3399ff] text-sm ">
                {error && error.data?.message}
            </div>
            <form
                onSubmit={handleSubmit}
                className="flex flex-col justify-center items-center"
            >
                {Inputs}
                <button
                    className="flex justify-between items-center px-4 bg-[#eff3f4] rounded-full w-112 h-12 text-base font-semibold text-[#3399ff] m-2 mt-12 border-[1px] border-[#eff3f4] outline-none w-full"
                >
                    <span className="flex-grow text-center">
                        {isLoading ? (
                            <AiOutlineLoading className="animate-spin text-2xl inline" />
                        ) : (
                            isSignUp ? 'Sign Up' : 'Login'
                        )}
                    </span>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            setIsSignUp(!isSignUp);
                        }}
                        className="bg-[#3399ff] text-white p-2 rounded-full hover:bg-[#3399ff] transition-colors duration-300 group"
                    >
                        <FaArrowsRotate className="h-5 w-5 transition-transform duration-300 ease-in-out group-hover:rotate-180" />
                    </button>
                </button>
            </form>
        </div>
    )
}

export default LoginFeature;