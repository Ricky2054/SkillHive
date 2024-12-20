import { useEffect, useState } from "react";

const Input = ({ data, ErrorObject }) => {
    const [value, setValue] = useState("")
    const [placeholder, setPlaceholder] = useState(false);

    const onFocused = () => {
        setPlaceholder(true);
    }
    const onBlured = () => {
        setPlaceholder(false);
    }

    useEffect(() => {
        if (value !== '') {
            setPlaceholder(true);
        }
    },[placeholder])

    return (
        <div className="flex flex-row w-112 h-12 m-2 bg-gray-100 border-l-[3px] border-l-[#3399ff] justify-center">
            <div className={`mt-0.5 flex flex-col w-full justify-between items-start text-xs px-1 text-gray-500 `}> 
                    <div className={`pl-1 transition-all duration-300 ease-in-out  ${placeholder ? 'text-xs' : 'text-base'} ${ErrorObject && 'text-red-500 text-xs'}`}>
                        {ErrorObject ? ErrorObject.message : placeholder ? data.placeholder : ' '}
                    </div>
                <input
                    id="auto-input-styles"
                    className="pl-1 w-full h-12 text-base flex-1 bg-gray-100 select-none outline-none text-[#3399ff] caret-[#3399ff] auto-input-styles placeholder:text-gray-500"
                    name={data.name}
                    type="text"
                    minLength={data.minlength}
                    maxLength={data.maxlength}
                    required={data.required}
                    onChange={(e) => setValue(e.target.value)}
                    onFocus={onFocused}
                    onBlur={onBlured}
                    placeholder={placeholder ? '' : data.placeholder}
                />
            </div>
            <div className="w-12 h-4 text-xs px-0.5 mt-0.5 text-gray-500">
                {data.maxlength && <div className="w-12">{value.length} / {data.maxlength}</div>}
            </div>
        </div>
    )
}

export default Input;