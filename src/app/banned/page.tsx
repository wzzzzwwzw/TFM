export default function BannedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md max-w-md text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Acceso restringido</h1>
        <p className="mb-4">
          Your account is  <span className="font-semibold">BANNED!</span> and you cant access the app.
        </p>
        <p>
          If you think this is a mistake, please contact support at <a href="mailto:support@example.com">waelwzwz@gmail.com</a>.
        </p>
      </div>
    </div>
  );
}