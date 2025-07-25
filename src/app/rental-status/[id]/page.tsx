interface RentalStatusPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RentalStatusPage({ params }: RentalStatusPageProps) {
  const { id } = await params;
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Rental Status
        </h1>
        <p className="text-gray-600 text-center mb-4">
          Rental ID: {id}
        </p>
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            Active
          </div>
        </div>
      </div>
    </div>
  );
}