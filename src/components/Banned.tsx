export default function BannedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md max-w-md text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Acceso restringido</h1>
        <p className="mb-4">
          Tu cuenta ha sido <span className="font-semibold">baneada</span> y no puedes acceder a la plataforma.
        </p>
        <p>
          Si crees que esto es un error, por favor contacta con el administrador.
        </p>
      </div>
    </div>
  );
}