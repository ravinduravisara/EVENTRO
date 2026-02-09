import { Link } from 'react-router-dom';
import Button from '../components/Button';

const Home = () => {
  return (
    <div className="text-center py-16">
      <h1 className="text-5xl font-bold text-gray-900 mb-4">Welcome to Eventro</h1>
      <p className="text-xl text-gray-600 mb-8">
        Discover, create, and manage events seamlessly.
      </p>
      <div className="flex justify-center space-x-4">
        <Link to="/events">
          <Button>Browse Events</Button>
        </Link>
        <Link to="/events/create">
          <Button variant="secondary">Create Event</Button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
