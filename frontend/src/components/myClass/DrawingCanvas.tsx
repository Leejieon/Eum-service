import {Text} from '@components/common/Text';
import {borderRadius} from '@theme/borderRadius';
import {borderWidth} from '@theme/borderWidth';
import {spacing} from '@theme/spacing';
import {getResponsiveSize} from '@utils/responsive';
import React, {useRef, useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  GestureResponderEvent,
  Pressable,
  findNodeHandle,
  UIManager,
} from 'react-native';
import Canvas from 'react-native-canvas';

type Tool = 'whiteCholk' | 'redCholk' | 'blueCholk' | 'eraser';

const DrawingCanvas: React.FC = () => {
  // 실제 그리기 도구는 useRef로 관리
  const currentTool = useRef<Tool>('whiteCholk');
  const currentColor = useRef('#ffffff');
  // UI 상태용 선택된 도구는 useState로 관리
  const [selectedTool, setSelectedTool] = useState<Tool>('whiteCholk');
  const canvasRef = useRef<Canvas | null>(null);
  const [canvasSize, setCanvasSize] = useState<{width: number; height: number}>(
    {
      width: 0,
      height: 0,
    },
  );

  const canvasBounds = useRef<{
    left: number;
    right: number;
    top: number;
    bottom: number;
  } | null>(null);

  const handleLayout = () => {
    if (canvasRef.current) {
      const handle = findNodeHandle(canvasRef.current);
      if (handle) {
        UIManager.measure(handle, (x, y, width, height, pageX, pageY) => {
          // 캔버스의 절대 위치 저장
          canvasBounds.current = {
            left: pageX,
            right: pageX + width,
            top: pageY,
            bottom: pageY + height - getResponsiveSize(30),
          };
          setCanvasSize({width, height});
        });
      }
    }
  };

  useEffect(() => {
    if (canvasRef.current && canvasSize.width && canvasSize.height) {
      const canvas = canvasRef.current;
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;

      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // 초기 캔버스 배경색 설정
      ctx.fillStyle = '#004414';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [canvasSize]);

  const handleDrawing = (
    evt: GestureResponderEvent,
    type: 'start' | 'move' | 'end',
  ) => {
    const {locationX, locationY, pageX, pageY} = evt.nativeEvent;
    const canvas = canvasRef.current;

    if (!canvas || !canvasBounds.current) return;

    const {left, right, top, bottom} = canvasBounds.current;
    const ctx = canvas.getContext('2d');

    // 현재 터치 위치가 캔버스 범위 내에 있는지 확인
    const isInsideCanvas =
      pageX >= left && pageX <= right && pageY >= top && pageY <= bottom;

    if (type === 'start' && isInsideCanvas) {
      ctx.beginPath();
      ctx.moveTo(locationX, locationY);
    } else if (type === 'move' && isInsideCanvas) {
      if (currentTool.current === 'eraser') {
        ctx.strokeStyle = '#004414';
        ctx.lineWidth = 50;
      } else {
        ctx.strokeStyle = currentColor.current;
        ctx.lineWidth = 2;
      }
      ctx.lineTo(locationX, locationY);
      ctx.stroke();
    } else if (type === 'end') {
      // 터치가 끝나면 그리기 종료
      ctx.closePath();
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: evt => handleDrawing(evt, 'start'),
      onPanResponderMove: evt => handleDrawing(evt, 'move'),
      onPanResponderRelease: evt => handleDrawing(evt, 'end'),
    }),
  ).current;

  const handleToolChange = (tool: Tool) => {
    currentTool.current = tool; // 실제 그리기 도구 변경
    setSelectedTool(tool); // UI 상태 변경
  };

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <View style={styles.toolbar}>
        <View style={styles.cholks}>
          <Pressable
            style={[
              styles.whiteCholk,
              selectedTool === 'whiteCholk' && styles.selectedTool,
            ]}
            onPress={() => {
              handleToolChange('whiteCholk');
              currentColor.current = '#ffffff';
            }}
          />
          <Pressable
            style={[
              styles.redCholk,
              selectedTool === 'redCholk' && styles.selectedTool,
            ]}
            onPress={() => {
              handleToolChange('redCholk');
              currentColor.current = '#ff4f4f';
            }}
          />
          <Pressable
            style={[
              styles.blueCholk,
              selectedTool === 'blueCholk' && styles.selectedTool,
            ]}
            onPress={() => {
              handleToolChange('blueCholk');
              currentColor.current = '#5c8fff';
            }}
          />
        </View>
        <Pressable
          style={[
            styles.eraser,
            selectedTool === 'eraser' && styles.selectedTool,
          ]}
          onPress={() => handleToolChange('eraser')}>
          <Text color="white">지우개</Text>
        </Pressable>
      </View>

      <View style={styles.drawingArea} {...panResponder.panHandlers}>
        <Canvas ref={canvasRef} style={styles.canvas} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  drawingArea: {
    flex: 1,
    backgroundColor: '#ffffff', // 배경색 추가
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    position: 'absolute',
    zIndex: 1,
    bottom: 0,
    width: '100%',
  },
  cholks: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  whiteCholk: {
    width: getResponsiveSize(30),
    height: getResponsiveSize(10),
    backgroundColor: '#fff',
    borderRadius: borderRadius.sm,
  },
  redCholk: {
    width: getResponsiveSize(30),
    height: getResponsiveSize(10),
    backgroundColor: '#ff4f4f',
    borderRadius: borderRadius.sm,
  },
  blueCholk: {
    width: getResponsiveSize(30),
    height: getResponsiveSize(10),
    backgroundColor: '#5c8fff',
    borderRadius: borderRadius.sm,
  },
  eraser: {
    justifyContent: 'center',
    alignItems: 'center',
    width: getResponsiveSize(60),
    height: getResponsiveSize(30),
    backgroundColor: '#550055',
    borderRadius: borderRadius.md,
  },
  selectedTool: {
    borderWidth: borderWidth.md,
    borderColor: '#ffff00',
  },
});

export default DrawingCanvas;
