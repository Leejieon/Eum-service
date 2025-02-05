import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { getResponsiveSize } from '@utils/responsive';
import { useNavigation } from '@react-navigation/native';

interface StudentInteractionToolProps {
  solveType: 'EXAM' | 'HOMEWORK';
  currentPage: number;
  totalPages: number;
  onNextPage: () => void;
  onPrevPage: () => void;
  onSubmit: () => void;
  setAnswer: (answer: string) => void;
  answerText: string;
}

const StudentInteractionTool = ({
  solveType,
  currentPage,
  totalPages,
  onNextPage,
  onPrevPage,
  onSubmit,
  setAnswer,
  answerText,
}: StudentInteractionToolProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [localAnswerText, setLocalAnswerText] = useState(answerText);
  const navigation = useNavigation();

  const handleOpenModal = () => {
    setLocalAnswerText(answerText);
    setIsModalVisible(true);
  };

  const handleSubmitAnswer = () => {
    setAnswer(localAnswerText);
    setIsModalVisible(false);
  };

  const handleExit = () => {
    Alert.alert(
      '진행 상황 삭제',
      '현재까지 진행 상황이 모두 삭제됩니다. 나가시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '나가기',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <View style={styles.InteractionToolBar}>
      <View style={styles.InteractionContainer}>
        <View style={styles.floatingToolbar}>
          <View style={styles.pageControlContainer}>
            <TouchableOpacity
              onPress={onPrevPage}
              disabled={currentPage === 1}
              style={styles.pageButton}>
              <Text
                style={[
                  styles.pageButtonText,
                  currentPage === 1 && styles.disabledText,
                ]}>
                이전
              </Text>
            </TouchableOpacity>

            <Text style={styles.pageInfoText}>
              {currentPage} / {totalPages}
            </Text>

            <TouchableOpacity
              onPress={onNextPage}
              disabled={currentPage === totalPages}
              style={styles.pageButton}>
              <Text
                style={[
                  styles.pageButtonText,
                  currentPage === totalPages && styles.disabledText,
                ]}>
                다음
              </Text>
            </TouchableOpacity>
          </View>

          {/* 답변 입력 */}
          <Text style={styles.currentAnswerText}>
            입력한 답: {answerText || '입력하지 않음'}
          </Text>
          <TouchableOpacity onPress={handleOpenModal} style={styles.inputButton}>
            <Text style={styles.inputButtonText}>
              {answerText ? '정답 수정하기' : '정답 입력하기'}
            </Text>
          </TouchableOpacity>

          {/* 제출 버튼 */}
          <TouchableOpacity
            onPress={onSubmit}
            style={[
              styles.submitButton,
              solveType === 'EXAM' && styles.examSubmitButton,
            ]}>
            <Text style={styles.submitButtonText}>
              {solveType === 'EXAM' ? '시험 제출하기' : '숙제 제출하기'}
            </Text>
          </TouchableOpacity>

          {/* 나가기 버튼 */}
          <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
            <Text style={styles.exitButtonText}>나가기</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 답변 입력 모달 */}
      <Modal
        transparent
        animationType="slide"
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>정답을 입력하세요</Text>
            <TextInput
              style={styles.input}
              value={localAnswerText}
              onChangeText={setLocalAnswerText}
              placeholder="답을 입력하세요"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmitAnswer}
                style={styles.submitCheckButton}>
                <Text style={styles.submitCheckButtonText}>제출</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default StudentInteractionTool;

const styles = StyleSheet.create({
  InteractionToolBar: {
    ...StyleSheet.absoluteFillObject,
  },
  InteractionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: getResponsiveSize(12),
    marginTop: getResponsiveSize(6),
    marginHorizontal: 'auto',
    padding: getResponsiveSize(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: getResponsiveSize(4) },
    shadowOpacity: 0.1,
    shadowRadius: getResponsiveSize(4),
    elevation: 4,
  },
  floatingToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '70%',
  },
  pageControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageInfoText: {
    marginHorizontal: getResponsiveSize(12),
    fontSize: getResponsiveSize(14),
    fontWeight: '600',
    color: '#333',
  },
  pageButton: {
    paddingVertical: getResponsiveSize(8),
    paddingHorizontal: getResponsiveSize(16),
    borderRadius: getResponsiveSize(8),
    backgroundColor: '#E0F7FA',
    alignItems: 'center',
  },
  pageButtonText: {
    fontSize: getResponsiveSize(14),
    color: '#007AFF',
    fontWeight: '600',
  },
  disabledText: {
    color: '#999',
  },
  inputButton: {
    paddingVertical: getResponsiveSize(8),
    paddingHorizontal: getResponsiveSize(16),
    borderRadius: getResponsiveSize(8),
    backgroundColor: '#d7ffcd',
    alignItems: 'center',
  },
  inputButtonText: {
    fontSize: getResponsiveSize(14),
    color: '#2fd355',
    fontWeight: 'bold',
  },
  submitButton: {
    paddingVertical: getResponsiveSize(8),
    paddingHorizontal: getResponsiveSize(16),
    borderRadius: getResponsiveSize(8),
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: getResponsiveSize(14),
    color: '#FFF',
    fontWeight: 'bold',
  },
  exitButton: {
    paddingVertical: getResponsiveSize(8),
    paddingHorizontal: getResponsiveSize(16),
    borderRadius: getResponsiveSize(8),
    backgroundColor: '#FF6F61',
    alignItems: 'center',
  },
  exitButtonText: {
    fontSize: getResponsiveSize(14),
    color: '#FFF',
    fontWeight: 'bold',
  },
  currentAnswerText: {
    fontSize: getResponsiveSize(14),
    fontWeight: 'bold',
    color: '#555',
    marginHorizontal: getResponsiveSize(10),
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    padding: getResponsiveSize(32),
    backgroundColor: 'white',
    borderRadius: getResponsiveSize(10),
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: getResponsiveSize(18),
    fontWeight: 'bold',
    marginBottom: getResponsiveSize(16),
  },
  input: {
    width: '100%',
    padding: getResponsiveSize(16),
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: getResponsiveSize(5),
    marginBottom: getResponsiveSize(32),
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: getResponsiveSize(16),
    marginRight: getResponsiveSize(8),
    backgroundColor: '#FFCDD2',
    borderRadius: getResponsiveSize(8),
  },
  cancelButtonText: {
    color: '#D32F2F',
    fontWeight: 'bold',
    fontSize: getResponsiveSize(14),
  },
  submitCheckButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: getResponsiveSize(16),
    marginLeft: getResponsiveSize(8),
    backgroundColor: '#C8E6C9',
    borderRadius: getResponsiveSize(8),
  },
  submitCheckButtonText: {
    color: '#388E3C',
    fontWeight: 'bold',
    fontSize: getResponsiveSize(14),
  },
  examSubmitButton: {
    backgroundColor: '#2196F3',
  },
});
