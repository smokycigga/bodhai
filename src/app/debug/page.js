'use client';

export default function DebugPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  const testBackend = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/health`);
      const data = await response.json();
      alert(`Backend connected! Response: ${JSON.stringify(data)}`);
    } catch (error) {
      alert(`Backend failed: ${error.message}`);
    }
  };
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
      <p><strong>API URL:</strong> {apiUrl}</p>
      <button 
        onClick={testBackend}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
      >
        Test Backend Connection
      </button>
    </div>
  );
}
