import {authApiClient, publicApiClient} from '@services/apiClient';
import {setToken, getToken, clearToken} from '@utils/secureStorage';
import {useAuthStore} from '@store/useAuthStore';
import {removeFCMToken} from './notificationService';

interface LoginCredentials {
  id: string;
  password: string;
}

interface SignupCredentials {
  id: string;
  password: string;
  name: string;
  email: string;
  birth: string;
  tel: string;
  schoolName: string;
  grade: number;
  classNumber: number;
  role: 'TEACHER' | 'STUDENT';
}

// 공통 에러 처리 함수
function handleApiError(error: any): string {
  if (error.response) {
    const errorCode = error.response.data?.code;
    const errorMessage = error.response.data?.message;

    switch (errorCode) {
      case 'A003':
        return '유효하지 않은 JWT 토큰입니다. 다시 로그인해주세요.';
      case 'A005':
        return '리프레시 토큰이 만료되었습니다. 다시 로그인해주세요.';
      case 'A006':
        return '블랙리스트에 등록된 토큰입니다. 로그아웃 후 재로그인해 주세요.';
      default:
        return String(errorMessage) || '알 수 없는 에러가 발생했습니다.';
    }
  } else {
    return '네트워크 오류 또는 서버 응답이 없습니다.';
  }
}

// user 관련 API 함수

// 로그인
export const logIn = async (credentials: LoginCredentials): Promise<any> => {
  try {
    const response = await publicApiClient.post('/user/sign-in', credentials);

    await setToken(response.data.data.tokenResponse);

    console.log(response.data.data.tokenResponse.accessToken);

    // 로그인 상태를 true로 설정
    useAuthStore.getState().setIsLoggedIn(true);

    return response.data;
  } catch (error) {
    return Promise.reject(handleApiError(error));
  }
};

// 로그아웃
export const logOut = async (): Promise<any> => {
  const {resetUserInfo, setIsLoggedIn} = useAuthStore.getState();

  try {
    await removeFCMToken();
    await authApiClient.get('/user/logout');
    await clearToken();

    // 로그인 상태 false
    setIsLoggedIn(false);

    // 유저정보 초기화
    resetUserInfo();

  } catch (error) {
    return Promise.reject(handleApiError(error));
  }
};

// 회원가입
export const signUp = async (userData: SignupCredentials): Promise<any> => {
  try {
    const response = await publicApiClient.post('/user/sign-up', userData);

    // 회원가입 성공 시 토큰을 저장하고 로그인 상태로 전환

    console.log('회원가입 성공 메세지', response.data.data);

    return response.data;
  } catch (error) {
    return Promise.reject(handleApiError(error));
  }
};

// 아이디 중복 체크
export const checkUsername = async (userId: string): Promise<any> => {
  try {
    const response = await publicApiClient.post(`/user/check/id`, {userId});
    return response.data;
  } catch (error) {
    return Promise.reject(handleApiError(error));
  }
};

// 토큰 갱신
export const refreshAuthToken = async (): Promise<any> => {
  try {
    const Tokens = await getToken();

    const refreshToken = Tokens.refreshToken;

    if (!refreshToken) throw new Error('No refresh token available');
    console.log('저장된 리프레쉬 토큰', refreshToken);
    const response = await publicApiClient.post('/user/access', {refreshToken});

    await setToken(response.data.data);

    return response.data.accessToken;
  } catch (error) {
    console.log('리프레시 토큰 갱신 에러', error);
    return Promise.reject(handleApiError(error));
  }
};

// 회원정보 조회
export const getUserInfo = async (): Promise<any> => {
  try {
    const response = await authApiClient.get('/user/info');
    const userInfo = response.data.data;
    console.log('유저 정보 조회 성공');
    const authStore = useAuthStore.getState();

    // 유저정보 갱신
    await authStore.setUserInfo(userInfo);
    return response.data;
  } catch (error) {
    console.log('유저정보 조회 실패');
    return Promise.reject(handleApiError(error));
  }
};

// 회원 프로필 사진 업데이트용 S3 URL 받기
export const updateProfilePicture = async (): Promise<any> => {
  try {
    const response = await authApiClient.patch('/user/info/image');
    const s3Url = response.data.data.url;
    return s3Url;
  } catch (error) {
    return Promise.reject(handleApiError(error));
  }
};

// 비밀번호 변경
export const changePassword = async (password: string): Promise<any> => {
  try {
    return await authApiClient.patch('/user/info/password', {password});
  } catch (error) {
    return Promise.reject(handleApiError(error));
  }
};

// 회원 탈퇴
export const signOut = async (): Promise<any> => {
  try {
    const response = await authApiClient.delete('/user/info');
    console.log('회원탈퇴 성공', response.data.data);

    await clearToken();

    // 로그인 상태를 false로 설정
    useAuthStore.getState().setIsLoggedIn(false);

    return response;
  } catch (error) {
    console.log('회원탈퇴 실패', error);
    return Promise.reject(handleApiError(error));
  }
};

// mail 관련 API 함수

// 이메일 인증 요청 (회원가입용)
export const requestEmailVerification = async (email: string): Promise<any> => {
  try {
    return (await publicApiClient.post('/mail/auth/request', {email})).data;
  } catch (error) {
    return Promise.reject(handleApiError(error));
  }
};

// 이메일 인증 요청 (아이디 찾기)
export const requestEmailVerificationId = async (
  email: string,
): Promise<any> => {
  try {
    return (await publicApiClient.post('/mail/auth/request/find-id', {email}))
      .data;
  } catch (error) {
    return Promise.reject(handleApiError(error));
  }
};

// 이메일 인증 요청 (비밀번호 찾기)
export const requestEmailVerificationPassword = async (
  email: string,
  id: string,
): Promise<any> => {
  try {
    return (
      await publicApiClient.post('/mail/auth/request/find-password', {
        email,
        id,
      })
    ).data;
  } catch (error) {
    return Promise.reject(handleApiError(error));
  }
};

// 이메일 인증번호 확인
export const verifyEmailCode = async (
  email: string,
  verificationCode: string,
): Promise<any> => {
  try {
    return await publicApiClient.post('/mail/auth/verify', {
      email,
      code: verificationCode,
    });
  } catch (error) {
    return Promise.reject(handleApiError(error));
  }
};

// 인증번호로 아이디 찾기
export const findIdByVerificationCode = async (
  email: string,
  verificationCode: string,
): Promise<any> => {
  try {
    const response = await publicApiClient.post('/mail/auth/find-id', {
      email,
      code: verificationCode,
    });

    return response.data.data.id;
  } catch (error) {
    return Promise.reject(handleApiError(error));
  }
};

// 인증번호로 비밀번호 찾기
export const resetPasswordByVerificationCode = async (
  email: string,
  verificationCode: string,
): Promise<any> => {
  try {
    return await publicApiClient.post('/mail/auth/find-password', {
      email,
      code: verificationCode,
    });
  } catch (error) {
    return Promise.reject(handleApiError(error));
  }
};

export const deleteProfileImage = async () => {
  try {
    return await authApiClient.delete('/user/info/image');
  } catch (error) {
    return Promise.reject(handleApiError(error));
  }
};
