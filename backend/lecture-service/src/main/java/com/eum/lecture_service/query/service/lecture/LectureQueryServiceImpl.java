package com.eum.lecture_service.query.service.lecture;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.eum.lecture_service.config.exception.ErrorCode;
import com.eum.lecture_service.config.exception.EumException;
import com.eum.lecture_service.query.document.LectureModel;
import com.eum.lecture_service.query.document.StudentOverviewModel;
import com.eum.lecture_service.query.document.TeacherOverviewModel;
import com.eum.lecture_service.query.document.eventModel.ClassModel;
import com.eum.lecture_service.query.document.eventModel.TeacherModel;
import com.eum.lecture_service.query.dto.lecture.LectureDetailResponse;
import com.eum.lecture_service.query.dto.lecture.LectureListResponse;
import com.eum.lecture_service.query.dto.lecture.LectureUpdateResponse;
import com.eum.lecture_service.query.dto.lecture.TodayDto;
import com.eum.lecture_service.query.repository.ClassReadRepository;
import com.eum.lecture_service.query.repository.LectureReadRepository;
import com.eum.lecture_service.query.repository.StudentOverviewRepository;
import com.eum.lecture_service.query.repository.StudentReadRepository;
import com.eum.lecture_service.query.repository.TeacherOverviewRepository;
import com.eum.lecture_service.query.repository.TeacherReadRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LectureQueryServiceImpl implements LectureQueryService {

	private final static String ROLE_STUDENT = "STUDENT";
	private final static String ROLE_TEACHER = "TEACHER";
	private final LectureReadRepository lectureReadRepository;
	private final TeacherReadRepository teacherReadRepository;
	private final StudentReadRepository studentReadRepository;
	private final TeacherOverviewRepository teacherOverviewRepository;
	private final StudentOverviewRepository studentOverviewRepository;
	private final ClassReadRepository classReadRepository;

	@Override
	public LectureDetailResponse getLectureDetail(String role, Long memberId, Long lectureId) {
		LectureModel lecture = lectureReadRepository.findById(lectureId)
			.orElseThrow(() -> new EumException(ErrorCode.LECTURE_NOT_FOUND));

		TeacherModel teacherModel = teacherReadRepository.findById(lecture.getTeacherId())
			.orElseThrow(() -> new EumException(ErrorCode.TEACHER_NOT_FOUND));

		ClassModel classModel = classReadRepository.findById(lecture.getClassId())
			.orElseThrow(() -> new EumException(ErrorCode.CLASS_NOT_FOUND));

		if(ROLE_STUDENT.equals(role)) {
			StudentOverviewModel studentOverviewModel = studentOverviewRepository.findByStudentIdAndLectureId(memberId,
					lecture.getLectureId())
				.orElseThrow(() -> new EumException(ErrorCode.STUDENTMODEL_NOT_FOUND));
			studentOverviewModel.getOverview().setLessonCount((long)lecture.getLessons().size());
			return LectureDetailResponse.fromLectureModelForStudent(lecture, teacherModel, studentOverviewModel, classModel);
		}
		else if(ROLE_TEACHER.equals(role)) {
			TeacherOverviewModel teacherOverviewModel = teacherOverviewRepository.findByTeacherIdAndLectureId(memberId,
					lecture.getLectureId())
				.orElseThrow(() -> new EumException(ErrorCode.TEACHERMODEL_NOT_FOUND));
			return LectureDetailResponse.fromLectureModelForTeacher(lecture, teacherModel, teacherOverviewModel, classModel);
		}
		return null;
	}

	@Override
	public List<LectureListResponse> getLectureList(String role, Long memberId) {
		if (ROLE_STUDENT.equals(role)) {
			return studentReadRepository.findById(memberId)
				.map(student -> lectureReadRepository.findByClassId(student.getClassId())
					.stream()
					.map(lecture -> {
						ClassModel classModel = classReadRepository.findById(lecture.getClassId())
							.orElseThrow(() -> new EumException(ErrorCode.CLASS_NOT_FOUND));
						TeacherModel teacherModel = teacherReadRepository.findById(lecture.getTeacherId())
							.orElseThrow(() -> new EumException(ErrorCode.TEACHER_NOT_FOUND));
						return LectureListResponse.fromLectureModel(lecture, classModel, teacherModel);
					})
					.collect(Collectors.toList()))
				.orElseGet(Collections::emptyList);
		} else if (ROLE_TEACHER.equals(role)) {
			return lectureReadRepository.findByTeacherId(memberId).stream()
				.map(lecture -> {
					ClassModel classModel = classReadRepository.findById(lecture.getClassId())
						.orElseThrow(() -> new EumException(ErrorCode.CLASS_NOT_FOUND));
					TeacherModel teacherModel = teacherReadRepository.findById(lecture.getTeacherId())
						.orElseThrow(() -> new EumException(ErrorCode.TEACHER_NOT_FOUND));
					return LectureListResponse.fromLectureModel(lecture, classModel, teacherModel);
				})
				.collect(Collectors.toList());
		}
		return Collections.emptyList();
	}

	@Override
	public List<LectureListResponse> getLectureListByDay(TodayDto todayDto, String role, Long memberId) {
		if (ROLE_STUDENT.equals(role)) {
			return studentReadRepository.findById(memberId)
				.map(student -> lectureReadRepository.findByClassIdAndSchedule_DayAndYearAndSemester(
						student.getClassId(), todayDto.getDay(), todayDto.getYear(), todayDto.getSemester())
					.stream()
					.map(lecture -> {
						ClassModel classModel = classReadRepository.findById(lecture.getClassId())
							.orElseThrow(() -> new EumException(ErrorCode.CLASS_NOT_FOUND));
						TeacherModel teacherModel = teacherReadRepository.findById(lecture.getTeacherId())
							.orElseThrow(() -> new EumException(ErrorCode.TEACHER_NOT_FOUND));
						return LectureListResponse.fromLectureModelWithPeriod(lecture, todayDto.getDay(), classModel, teacherModel);
					})
					.collect(Collectors.toList()))
				.orElseGet(Collections::emptyList);
		} else if (ROLE_TEACHER.equals(role)) {
			return lectureReadRepository.findByTeacherIdAndSchedule_DayAndYearAndSemester(
					memberId, todayDto.getDay(), todayDto.getYear(), todayDto.getSemester()).stream()
				.map(lecture -> {
					ClassModel classModel = classReadRepository.findById(lecture.getClassId())
						.orElseThrow(() -> new EumException(ErrorCode.CLASS_NOT_FOUND));
					TeacherModel teacherModel = teacherReadRepository.findById(lecture.getTeacherId())
						.orElseThrow(() -> new EumException(ErrorCode.TEACHER_NOT_FOUND));
					return LectureListResponse.fromLectureModelWithPeriod(lecture, todayDto.getDay(), classModel, teacherModel);
				})
				.collect(Collectors.toList());
		}
		return Collections.emptyList();
	}


	@Override
	public LectureUpdateResponse getLectureForUpdate(Long lectureId) {
		LectureModel lecture = lectureReadRepository.findById(lectureId)
			.orElseThrow(() -> new EumException(ErrorCode.LECTURE_NOT_FOUND));

		return LectureUpdateResponse.fromLectureModel(lecture);
	}

	public List<ClassModel> getAvailableClasses(String schoolName) {
		return classReadRepository.findBySchool(schoolName);
	}
}
