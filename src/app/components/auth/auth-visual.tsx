const AuthVisual = () => {
  return (
    <aside className="relative hidden h-dvh overflow-hidden bg-ice lg:flex lg:flex-col lg:justify-between lg:px-10 lg:pt-[clamp(2rem,9vh,6rem)] lg:pb-[clamp(1rem,3vh,2rem)] xl:px-16">
      <div className="pointer-events-none absolute -top-24 -right-20 size-72 rounded-full border border-primary/15">
        <div className="absolute top-0 right-0 size-32 rounded-full bg-ice-deep" />
      </div>
      <div className="pointer-events-none absolute bottom-24 -left-10 size-40 rounded-full border border-primary/15" />

      <div className="relative z-10 max-w-xl">
        <h2 className="font-heading text-5xl leading-[1.12] font-semibold tracking-tight text-foreground xl:text-6xl">
          Conecte.
          <br />
          Colabore.
          <br />
          <span className="text-primary">Simplifique.</span>
        </h2>
        <p className="mt-[clamp(0.75rem,2.5vh,1.5rem)] max-w-md text-lg leading-8 text-muted-foreground">
          Um espaço para sua equipe se comunicar, compartilhar e trabalhar melhor.
        </p>
      </div>

      <img
        src="/undraw_connecting-teams_nnjy.svg"
        alt="Pessoas conectadas e colaborando em equipe"
        className="relative z-10 ml-auto min-h-0 w-full max-w-2xl flex-1 object-contain object-bottom"
      />
    </aside>
  );
};

export default AuthVisual;
