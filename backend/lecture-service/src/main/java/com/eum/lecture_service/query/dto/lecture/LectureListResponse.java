// LectureListResponse.java
package com.eum.lecture_service.query.dto.lecture;

import java.util.List;
import java.util.stream.Collectors;

import com.eum.lecture_service.query.document.LectureModel;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
public class LectureListResponse {

	private Long lectureId;
	private String title;
	private String subject;
	private String backgroundColor;
	private String fontColor;
	private Long year;
	private Long semester;
	private Long classId;
	private Long teacherId;
	private List<String> scheduleDays;

	public static LectureListResponse fromLectureModel(LectureModel lecture) {
		LectureListResponse response = new LectureListResponse();
		response.setLectureId(lecture.getLectureId());
		response.setTitle(lecture.getTitle());
		response.setSubject(lecture.getSubject());
		response.setBackgroundColor(lecture.getBackgroundColor());
		response.setFontColor(lecture.getFontColor());
		response.setYear(lecture.getYear());
		response.setSemester(lecture.getSemester());
		response.setClassId(lecture.getClassId());
		response.setTeacherId(lecture.getTeacherId());
		response.setScheduleDays(lecture.getSchedule().stream()
			.map(s -> s.getDay())
			.distinct()
			.collect(Collectors.toList()));
		return response;
	}

	// 특정 요일의 수업 목록 조회를 위한 메서드
	public static LectureListResponse fromLectureModelWithPeriod(LectureModel lecture) {
		LectureListResponse response = fromLectureModel(lecture);
		// 필요한 경우 period 정보 추가
		return response;
	}
}
