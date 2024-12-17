import VideoCard from '../components/VideoCard';

const Dashboard = ({ searchTerm }) => {
    return (
        <div className="bg-zinc-50 h-full">
            <VideoCard topics={searchTerm} />
        </div>
    )   
}

export default Dashboard;