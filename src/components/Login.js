import { useEffect, useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import Input from "./Input";
import { FaArrowsRotate } from "react-icons/fa6";
import useNavigation from "../hooks/useNavigation";

const LoginFeature = () => {
    const [isSignUp, setIsSignUp] = useState(true);
    const [results, setResults] = useState({ isLoading: false, isSuccess: true, isError: false, error: null });
    const [opacity, setOpacity] = useState(false);

    const { navigate } = useNavigation();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isSignUp) {
            const user = {
                email: e.target.email.value,
                password: e.target.password.value,
            };
            console.log(user)
        } else if (!isSignUp) {
            
            const isValidEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(e.target.Email.value);
            if (!isValidEmail) {
                throw new Error('Please enter a valid email address');
            }
            const user = {
                email: e.target.Email.value,
                password: e.target.password.value,
            };
            console.log(user)
        }
    };

    const InputsFields = [
        {
            name: "Email",
            placeholder: "Email",
            minlength: null,
            maxlength: null,
            required: true,
        },
        {
            name: "password",
            placeholder: "Password",
            minlength: null,
            maxlength: null,
            required: true,
        },
    ];

    let ErrorsMap = new Map();
    let ErrorsMsg = "An unexpected error occurred.";
    if (results?.isError) {
        console.log(results)
    }

    let Inputs = InputsFields.map((data, i) => {
        const ErrorObject = ErrorsMap.get(data?.name)
        return (
            <Input key={i} data={data} ErrorObject={ErrorObject} />
        );
    });

    if (results.isError) {
        console.log(results.isError)
    }
    
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
                {results.isError && ErrorsMsg}
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
                        {results?.isLoading ? (
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