export default function TestCSS() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
          CSS Test Page
        </h1>
        <p className="text-gray-600 text-center">
          This page is used for testing CSS styles.
        </p>
        <div className="mt-4 space-y-2">
          <div className="p-3 bg-blue-100 text-blue-800 rounded">Primary</div>
          <div className="p-3 bg-green-100 text-green-800 rounded">Success</div>
          <div className="p-3 bg-red-100 text-red-800 rounded">Error</div>
        </div>
      </div>
    </div>
  );
}