import { useParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';

const FeedbackList = () => {
  const { eventId } = useParams();
  const { data: feedbacks, loading, error } = useFetch(`/feedback/event/${eventId}`);

  if (loading) return <p>Loading feedback...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Feedback</h1>
      <div className="space-y-4">
        {feedbacks?.map((fb) => (
          <div key={fb._id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">{fb.user?.name}</span>
              <div className="flex items-center space-x-2">
                <span className="text-yellow-500">{'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  fb.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                  fb.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>{fb.sentiment}</span>
              </div>
            </div>
            <p className="text-gray-600">{fb.comment}</p>
          </div>
        ))}
        {(!feedbacks || feedbacks.length === 0) && <p className="text-gray-500">No feedback yet.</p>}
      </div>
    </div>
  );
};

export default FeedbackList;
