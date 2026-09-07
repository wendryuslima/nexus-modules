const LoginHeader = () => {
  return (
    <div className="flex flex-col gap-4 items-center">
      <img
        src="/nexuslogo-png.jpg"
        alt="Nexus"
        className="h-11 w-auto rounded-xl"
      />
      <h2>Bem vindo de volta</h2>
      <h1>Entre na sua conta para continuar.</h1>
    </div>
  );
};

export default LoginHeader;
