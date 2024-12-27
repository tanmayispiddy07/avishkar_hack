import React, { useState } from 'react';

const HealthReport = () => {
  const [answers, setAnswers] = useState({
    question1: '',
    question2: '',
    question3: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file || !answers.question1 || !answers.question2 || !answers.question3) {
      setMessage('Please fill out all questions and upload a file.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('question1', answers.question1);
    formData.append('question2', answers.question2);
    formData.append('question3', answers.question3);

    try {
      const response = await fetch('http://localhost:8000/upload-health-report', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setMessage('Health report uploaded successfully!');
      } else {
        const errorData = await response.json();
        setMessage(errorData.detail || 'Failed to upload health report.');
      }
    } catch (error) {
      setMessage('Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-semibold text-center mb-6">Health Report</h2>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Question 1</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-md mt-1"
              value={answers.question1}
              onChange={(e) => setAnswers({ ...answers, question1: e.target.value })}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Question 2</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-md mt-1"
              value={answers.question2}
              onChange={(e) => setAnswers({ ...answers, question2: e.target.value })}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Question 3</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-md mt-1"
              value={answers.question3}
              onChange={(e) => setAnswers({ ...answers, question3: e.target.value })}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Upload Health Report</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="w-full p-3 border border-gray-300 rounded-md mt-1"
              onChange={handleFileChange}
            />
          </div>

          {message && <p className="text-sm mt-4 text-red-500">{message}</p>}

          <div className="mt-6">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Uploading...' : 'Submit Health Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HealthReport;
