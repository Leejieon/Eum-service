import React from 'react';
import { Text } from '@components/common/Text';
import { View, StyleSheet } from 'react-native';
import ProgressBox from '@components/homework/ProgressBox';
import { spacing } from '@theme/spacing';
import { getResponsiveSize } from '@utils/responsive';

type OverviewProps = {
  homeworkCnt?: number;
  examCnt?: number;
  problemBoxCnt?: number;
};

function Overview({ homeworkCnt = 0, examCnt = 0, problemBoxCnt = 0 }: OverviewProps): React.JSX.Element {
  return (
    <View style={styles.overview}>
      <Text variant="subtitle" weight="bold" style={styles.subtitle}>
        Overview
      </Text>
      <View style={styles.progressLayout}>
        <ProgressBox
          color="green"
          title="수업"
          content={`${problemBoxCnt}`}
          unit="번"
          icon="folderCheck"
          isLessonDetail={true}
        />
        <ProgressBox
          color="red"
          title="시험"
          content={`${examCnt}`}
          unit="번"
          icon="complete"
          isLessonDetail={true}
        />
        <ProgressBox
          color="blue"
          title="숙제"
          content={`${homeworkCnt}`}
          unit="개"
          icon="homeworkCheck"
          isLessonDetail={true}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overview: {
    flex: 1,
    gap: spacing.md,
  },
  subtitle: {
    marginStart: spacing.xl,
  },
  progressLayout: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xxl,
    paddingHorizontal: getResponsiveSize(20),
  },
});

export default Overview;
