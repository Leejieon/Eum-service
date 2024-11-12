import { authApiClient } from '@services/apiClient';

// 레슨 생성
export type CreateLessonRequest = {
  lectureId: number;
  title: string;
  questionIds: number[];
};

export type CreateLessonResponse = {
  lessonId: number;
};

export const createLesson = async (
  lessonData: CreateLessonRequest
): Promise<CreateLessonResponse> => {
  try {
    console.log('레슨 생성 요청 데이터:', lessonData);

    const { data } = await authApiClient.post<{
      code: string;
      data: CreateLessonResponse;
      message: string;
    }>('/lesson', lessonData);

    console.log('레슨 생성 응답:', data);
    return data.data;
  } catch (error) {
    console.error('레슨 생성 실패:', error);
    throw error;
  }
};

// 레슨 삭제
export type DeleteLessonResponse = {
  code: string;
  data: null;
  message: string;
};

export const deleteLesson = async (lessonId: number): Promise<void> => {
  try {
    console.log(`레슨 삭제 요청: lessonId = ${lessonId}`);

    const { data } = await authApiClient.delete<DeleteLessonResponse>(`/lesson/${lessonId}`);

    console.log('레슨 삭제 응답:', data.message);
  } catch (error) {
    console.error('레슨 삭제 실패:', error);
    throw error;
  }
};

// 레슨 상세 조회
export type LessonDetailResponse = {
  questionIds: number[];
  questionAnswers: string[];
  studentAnswers: string[];
  drawingPaths: string;
};

export const getLessonDetail = async (
  lectureId: number,
  lessonId: number,
): Promise<LessonDetailResponse> => {
  try {
    console.log(`레슨 상세 조회 요청: lectureId = ${lectureId}, lessonId = ${lessonId}`);

    const { data } = await authApiClient.get<LessonDetailResponse>(
      `/lecture/${lectureId}/lesson/${lessonId}`
    );

    console.log('레슨 상세 조회 응답:', data);
    return data;
  } catch (error) {
    console.error('레슨 상세 조회 실패:', error);
    throw error;
  }
};

// 수업 상태 변경
export type SwitchLessonStatusResponse = {
  status: string;
  data: null;
  message: string;
};

export const switchLessonStatus = async (
  lectureId: number
): Promise<SwitchLessonStatusResponse> => {
  try {
    console.log(`수업 상태 변경 요청: lectureId = ${lectureId}`);

    const { data } = await authApiClient.post<SwitchLessonStatusResponse>(
      `/lecture/${lectureId}/switch`
    );

    console.log('수업 상태 변경 응답:', data);
    return data;
  } catch (error) {
    console.error('수업 상태 변경 실패:', error);
    throw error;
  }
};
