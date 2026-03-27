import { useParams } from "react-router-dom";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import useFetch from "../../hooks/useFetch";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
);

const AnalyticsDashboard = () => {
  const { eventId } = useParams();
  const {
    data: analytics,
    loading,
    error,
  } = useFetch(`/feedback/analytics/${eventId}`);

  if (loading) return <p>Loading analytics...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!analytics) return <p>No analytics available.</p>;

  const sentimentData = {
    labels: ["Positive", "Neutral", "Negative"],
    datasets: [
      {
        data: [
          analytics.sentimentBreakdown?.positive || 0,
          analytics.sentimentBreakdown?.neutral || 0,
          analytics.sentimentBreakdown?.negative || 0,
        ],
        backgroundColor: ["#22c55e", "#eab308", "#ef4444"],
      },
    ],
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Event Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <p className="text-gray-500">Average Rating</p>
          <p className="text-4xl font-bold text-primary">
            {analytics.averageRating}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <p className="text-gray-500">Total Feedbacks</p>
          <p className="text-4xl font-bold">{analytics.totalFeedbacks}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <p className="text-gray-500">Performance Score</p>
          <p className="text-4xl font-bold">
            {analytics.performanceScore ?? 0}
          </p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow max-w-md mx-auto">
        <h3 className="text-lg font-semibold mb-4">Sentiment Breakdown</h3>
        <Doughnut data={sentimentData} />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
