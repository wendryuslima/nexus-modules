type SignInRequestDto = {
  email: string;
  password: string;
};

type SignInResponseDto = {
  data: {
    user_id: string;
    email: string;
  };
};

export type { SignInRequestDto, SignInResponseDto };
