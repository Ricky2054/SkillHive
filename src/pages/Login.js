import HorizontalBar from "../components/styling_Comps/HorizontalBar";
import LineChart from "../features/LineChart";
import LoginFeature from "../features/LoginFeature";

const Login = () => {
  return (
    <div className="relative w-full h-full overflow-hidden">
        <HorizontalBar />
        <LineChart />
        <div className="w-full h-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 rounded-lg bg-white bg-opacity-10 backdrop-blur-sm">
            <LoginFeature />
        </div>
    </div>
  )
}


export default Login;