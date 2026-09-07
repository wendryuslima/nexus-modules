type SignUpRequestDto = {
  email: string;
  password: string;
};

type SignUpResponseDto = {
  data: {
    user_id: string;
    email: string;
    created_at: string;
  };
};

export type { SignUpRequestDto, SignUpResponseDto };
