package com.eum.lecture_service.query.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.eum.lecture_service.query.document.TeacherOverviewModel;

public interface TeacherOverviewRepository extends MongoRepository<TeacherOverviewModel, Long> {

	Optional<TeacherOverviewModel> findByTeacherIdAndClassId(Long teacherId, Long classId);
}

