export default function FirebaseStatus() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Firebase Status
        </h1>
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Connected
          </div>
          <p className="text-gray-600 mt-4">
            Firebase services are running successfully.
          </p>
        </div>
      </div>
    </div>
  );
}