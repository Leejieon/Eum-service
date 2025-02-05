import React from 'react';
import { Text } from '@components/common/Text';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenType } from '@store/useCurrentScreenStore';

type NavigationProps = NativeStackNavigationProp<ScreenType>;

type LectureIdProps = {
  lectureId: number;
  lectureStatus: boolean;
};

function ClassHandleButtonList({
  lectureId,
  lectureStatus,
}: LectureIdProps): React.JSX.Element {
  const navigation = useNavigation<NavigationProps>();

  const handleStartLesson = (action: 'lesson' | 'exam' | 'homework') => {
    navigation.navigate('QuestionCreateScreen', { lectureId, action });
  };

  return (
    <View style={styles.buttonList}>
      <TouchableOpacity
        style={[styles.classButton, lectureStatus && styles.disabledButton]}
        onPress={() => !lectureStatus && handleStartLesson('lesson')}
        disabled={lectureStatus}>
        <Text style={styles.buttonText}>
          {lectureStatus ? '수업 진행 중입니다...' : '수업 시작하기'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.testButton}
        onPress={() => handleStartLesson('exam')}>
        <Text style={styles.buttonText}>시험 내기</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.homeworkButton}
        onPress={() => handleStartLesson('homework')}>
        <Text style={styles.buttonText}>숙제 내기</Text>
      </TouchableOpacity>
    </View>
  );
}

export default ClassHandleButtonList;

const styles = StyleSheet.create({
  buttonList: {
    flexDirection: 'column',
    marginTop: 6,
    gap: 15,
    padding: 8,
  },
  classButton: {
    backgroundColor: '#14AE5C',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: '#FF5F5F',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  homeworkButton: {
    backgroundColor: '#5F9FFF',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5, // 버튼 비활성화 스타일
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 1,
  },
});
