import ParticipantCard from '@components/classLessoning/ParticipantCard';
import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCurrentScreenStore } from '@store/useCurrentScreenStore';
import TeacherLessoningGridInteractionTool from '@components/classLessoning/TeacherLessoningGridInteractionTool';
import { getResponsiveSize } from '@utils/responsive';
import LeftIcon from '@assets/icons/leftIcon.svg';
import RightIcon from '@assets/icons/rightIcon.svg';
import LeftOffIcon from '@assets/icons/leftOffIcon.svg';
import RightOffIcon from '@assets/icons/rightOffIcon.svg';
import { iconSize } from '@theme/iconSize';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenType } from '@store/useCurrentScreenStore';
import { useLectureStore, useLessonStore } from '@store/useLessonStore';
import { useStudentListStore } from '@store/useStudentListStore';
import SockJS from 'sockjs-client';
import * as StompJs from '@stomp/stompjs';

type NavigationProps = NativeStackNavigationProp<ScreenType>;

function LessoningStudentListScreen(): React.JSX.Element {
  const setCurrentScreen = useCurrentScreenStore(
    (state) => state.setCurrentScreen
  );
  const navigation = useNavigation<NavigationProps>();
  useFocusEffect(() => {
    setCurrentScreen('LessoningStudentListScreen');
  });

  const {
    participants,
    addParticipant,
    updateParticipant,
    removeParticipant,
  } = useStudentListStore();

  const lectureId = useLessonStore((state) => state.lectureId);
  const lessonId = useLessonStore((state) => state.lessonId);
  const teacherId = useLectureStore((state) => state.teacherId);
  const setLectureInfo = useLectureStore((state) => state.setLectureInfo);
  const setIsTeaching = useLessonStore((state) => state.setIsTeaching);

  const [isConnected, setIsConnected] = useState(false);
  console.log('구독 연결 됨!', isConnected);

  const clientRef = useRef<StompJs.Client | null>(null);

  const ROWS = 4;
  const COLUMNS = 4;
  const PARTICIPANTS_PER_PAGE = ROWS * COLUMNS;

  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(participants.length / PARTICIPANTS_PER_PAGE);

  const currentParticipants = participants.slice(
    currentPage * PARTICIPANTS_PER_PAGE,
    (currentPage + 1) * PARTICIPANTS_PER_PAGE
  );

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleParticipantPress = (id: number) => {
    setLectureInfo(id, teacherId!);
    setIsTeaching(true);
    navigation.navigate('LessoningScreen');
  };

  // STOMP 클라이언트 초기화 및 설정
  useEffect(() => {
    const client = new StompJs.Client({
      webSocketFactory: () => new SockJS('http://k11d101.p.ssafy.io/ws-gateway/drawing'),
      debug: (str) => console.log('STOMP Debug:', str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('STOMP client successfully connected');
        setIsConnected(true);

        const teacherTopic = `/topic/lesson/${lessonId}`;
        client.subscribe(teacherTopic, (message) => {
          const data = JSON.parse(message.body);
          const { type, studentId, studentName, studentImage, currentPage } = data;

          if (type === 'in') {
            addParticipant({
              studentId,
              studentName,
              studentImage,
              currentPage,
              status: 'default',
            });
          } else if (type === 'now') {
            updateParticipant(studentId, { status: 'active', currentPage });
          } else if (type === 'out') {
            updateParticipant(studentId, { status: 'inactive' });
            setTimeout(() => {
              removeParticipant(studentId);
            }, 3000);
          }
        });
      },
      onDisconnect: () => {
        console.log('STOMP client disconnected');
        setIsConnected(false);
      },
      onWebSocketError: (error) => {
        console.error('WebSocket Error:', error);
        setIsConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.mainContainer}>
      {/* 상단 바 */}
      <View style={styles.interactionToolContainer}>
        <TeacherLessoningGridInteractionTool lectureId={lectureId!} />
      </View>

      {/* 총 인원수 */}
      <View style={styles.header}>
        <Text style={styles.totalText}>총 인원: {participants.length}명</Text>
      </View>

      {/* 참가자 그리드 */}
      <FlatList
        data={currentParticipants}
        keyExtractor={(item) => String(item.studentId)}
        numColumns={COLUMNS}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <ParticipantCard
            participant={item}
            onPress={() => handleParticipantPress(item.studentId)}
          />
        )}
      />

      {/* 페이지 컨트롤 */}
      <View style={styles.pageControls}>
        {/* 좌측 화살표 */}
        <TouchableOpacity
          onPress={goToPreviousPage}
          disabled={currentPage === 0}
          style={[styles.arrow, styles.leftArrow]}>
          {currentPage === 0 ? (
            <LeftOffIcon width={iconSize.xl} height={iconSize.xl} />
          ) : (
            <LeftIcon width={iconSize.xl} height={iconSize.xl} />
          )}
        </TouchableOpacity>

        {/* 우측 화살표 */}
        <TouchableOpacity
          onPress={goToNextPage}
          disabled={currentPage === totalPages - 1 || totalPages === 0}
          style={[styles.arrow, styles.rightArrow]}>
          {currentPage === totalPages - 1 || totalPages === 0 ? (
            <RightOffIcon width={iconSize.xl} height={iconSize.xl} />
          ) : (
            <RightIcon width={iconSize.xl} height={iconSize.xl} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default LessoningStudentListScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  interactionToolContainer: {
    zIndex: 2,
    position: 'absolute',
    top: 10,
    width: '100%',
    height: '15%',
  },
  header: {
    position: 'absolute',
    top: getResponsiveSize(32),
    right: getResponsiveSize(38),
    backgroundColor: '#fff',
    padding: getResponsiveSize(12),
    borderRadius: 8,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  grid: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: getResponsiveSize(128),
  },
  pageControls: {
    zIndex: 1,
    position: 'absolute',
    width: '100%',
    top: '50%',
  },
  arrow: {
    padding: getResponsiveSize(3),
  },
  leftArrow: {
    position: 'absolute',
    left: getResponsiveSize(25),
  },
  rightArrow: {
    position: 'absolute',
    right: getResponsiveSize(25),
  },
});
