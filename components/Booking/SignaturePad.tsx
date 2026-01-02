import { useColorScheme } from '@/components/useColorScheme';
import Colors, { BrandColors } from '@/constants/Colors';
import React, { useEffect, useRef, useState } from 'react';
import { PanResponder, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';

interface SignaturePadProps {
  onSignatureChange: (signature: string | null) => void;
  width?: number;
  height?: number;
}

interface Point {
  x: number;
  y: number;
}

export default function SignaturePad({
  onSignatureChange,
  width = 300,
  height = 200,
}: SignaturePadProps) {
  const [paths, setPaths] = useState<Point[][]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[(colorScheme ?? 'light') as 'light' | 'dark'];
  const viewRef = useRef<View>(null);
  const domElementRef = useRef<HTMLElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const isDrawingRef = useRef(false); // Ref to avoid stale closures in event handlers
  const currentPathRef = useRef<Point[]>([]); // Ref to track current path
  const pathsRef = useRef<Point[][]>([]); // Ref to track all paths

  // Keep refs in sync with state
  useEffect(() => {
    isDrawingRef.current = isDrawing;
    currentPathRef.current = currentPath;
    pathsRef.current = paths;
  }, [isDrawing, currentPath, paths]);

  // Use a unique ID to identify the element in the DOM
  const signaturePadId = useRef(`signature-pad-${Math.random().toString(36).substr(2, 9)}`).current;

  // Ref callback to get DOM element on web
  const setViewRef = (ref: View | null) => {
    viewRef.current = ref;
  };

  // Set up DOM element access for web using a data attribute
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    let retries = 0;
    const maxRetries = 10;

    const findAndSetupElement = () => {
      // Find the element by the data attribute
      const element = document.querySelector(`[data-signature-pad-id="${signaturePadId}"]`) as HTMLElement;
      if (element && typeof element.addEventListener === 'function') {
        domElementRef.current = element;
        if (cleanupRef.current) {
          cleanupRef.current();
        }
        cleanupRef.current = setupListeners(element);
        return true;
      }
      return false;
    };

    // Try immediately
    if (findAndSetupElement()) {
      return;
    }

    // Retry with requestAnimationFrame for better timing
    const trySetup = () => {
      if (findAndSetupElement()) {
        return;
      }
      retries++;
      if (retries < maxRetries) {
        requestAnimationFrame(trySetup);
      }
    };

    requestAnimationFrame(trySetup);

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [width, height, signaturePadId]);

  // Helper to get coordinates from an event
  const getCoordinates = (evt: MouseEvent | TouchEvent): Point | null => {
    const element = domElementRef.current;
    if (!element) return null;
    
    const rect = element.getBoundingClientRect();
    const clientX = (evt as MouseEvent).clientX ?? (evt as TouchEvent).touches?.[0]?.clientX;
    const clientY = (evt as MouseEvent).clientY ?? (evt as TouchEvent).touches?.[0]?.clientY;
    
    if (clientX === undefined || clientY === undefined) return null;
    
    return {
      x: Math.max(0, Math.min(width, clientX - rect.left)),
      y: Math.max(0, Math.min(height, clientY - rect.top)),
    };
  };

  const handleEnd = () => {
    // Use refs to get the latest values (avoid stale closures)
    const pathToSave = currentPathRef.current;
    if (pathToSave.length > 0) {
      const newPaths = [...pathsRef.current, pathToSave];
      setPaths(newPaths);
      setCurrentPath([]);
      setIsDrawing(false);
      const svgData = generateSVG(newPaths);
      onSignatureChange(svgData);
    } else {
      setIsDrawing(false);
    }
  };

  // Setup event listeners helper (uses refs to avoid stale closures)
  const setupListeners = (element: HTMLElement) => {
    const handleMouseDown = (evt: MouseEvent) => {
      evt.preventDefault();
      const coords = getCoordinates(evt);
      if (coords) {
        setIsDrawing(true);
        setCurrentPath([coords]);
      }
    };

    const handleMouseMove = (evt: MouseEvent) => {
      if (!isDrawingRef.current) return;
      evt.preventDefault();
      const coords = getCoordinates(evt);
      if (coords) {
        setCurrentPath((prev) => {
          const lastPoint = prev[prev.length - 1];
          if (lastPoint && Math.abs(lastPoint.x - coords.x) < 1 && Math.abs(lastPoint.y - coords.y) < 1) {
            return prev;
          }
          return [...prev, coords];
        });
      }
    };

    const handleMouseUp = () => {
      handleEnd();
    };

    const handleMouseLeave = () => {
      handleEnd();
    };

    const handleTouchStart = (evt: TouchEvent) => {
      evt.preventDefault();
      const coords = getCoordinates(evt);
      if (coords) {
        setIsDrawing(true);
        setCurrentPath([coords]);
      }
    };

    const handleTouchMove = (evt: TouchEvent) => {
      if (!isDrawingRef.current) return;
      evt.preventDefault();
      const coords = getCoordinates(evt);
      if (coords) {
        setCurrentPath((prev) => {
          const lastPoint = prev[prev.length - 1];
          if (lastPoint && Math.abs(lastPoint.x - coords.x) < 1 && Math.abs(lastPoint.y - coords.y) < 1) {
            return prev;
          }
          return [...prev, coords];
        });
      }
    };

    const handleTouchEnd = () => {
      handleEnd();
    };

    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseup', handleMouseUp);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseup', handleMouseUp);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, []);

  // Native: PanResponder (works great on iOS/Android)
  const panResponder = useRef(
    Platform.OS !== 'web'
      ? PanResponder.create({
          onStartShouldSetPanResponder: () => true,
          onMoveShouldSetPanResponder: () => true,
          onPanResponderGrant: (evt) => {
            const { locationX, locationY } = evt.nativeEvent;
            setIsDrawing(true);
            setCurrentPath([{ x: locationX, y: locationY }]);
          },
          onPanResponderMove: (evt) => {
            if (isDrawing) {
              const { locationX, locationY } = evt.nativeEvent;
              setCurrentPath((prev) => {
                const lastPoint = prev[prev.length - 1];
                if (lastPoint && Math.abs(lastPoint.x - locationX) < 1 && Math.abs(lastPoint.y - locationY) < 1) {
                  return prev;
                }
                return [...prev, { x: locationX, y: locationY }];
              });
            }
          },
          onPanResponderRelease: () => {
            handleEnd();
          },
          onPanResponderTerminate: () => {
            setIsDrawing(false);
          },
        })
      : null
  ).current;

  const generateSVG = (pathArray: Point[][]): string => {
    const pathStrings = pathArray.map((points) => {
      if (points.length === 0) return '';
      let path = `M${points[0].x},${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        path += ` L${points[i].x},${points[i].y}`;
      }
      return path;
    });

    const svgContent = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      ${pathStrings.map((p) => `<path d="${p}" stroke="${BrandColors.primaryPink}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}
    </svg>`;

    if (Platform.OS === 'web') {
      return `data:image/svg+xml;base64,${btoa(svgContent)}`;
    }
    return svgContent;
  };

  const clearSignature = () => {
    setPaths([]);
    setCurrentPath([]);
    setIsDrawing(false);
    onSignatureChange(null);
  };

  const pathToSvgPath = (points: Point[]): string => {
    if (points.length === 0) return '';
    let path = `M${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L${points[i].x},${points[i].y}`;
    }
    return path;
  };

  const padStyle: any = [
    styles.pad,
    {
      width,
      height,
      borderColor: BrandColors.lightPink,
      // Web-specific styles (web platform still needs some CSS properties)
      ...(Platform.OS === 'web' ? {
        cursor: 'crosshair',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
      } : {}),
    },
  ];

  return (
    <View style={styles.container}>
      <View
        ref={setViewRef}
        style={padStyle}
        // @ts-ignore - dataSet is a React Native Web prop for data attributes
        {...(Platform.OS === 'web' ? { dataSet: { signaturePadId } } : {})}
        {...(Platform.OS !== 'web' && panResponder ? panResponder.panHandlers : {})}
      >
        <Svg width={width} height={height}>
          {paths.map((path, index) => (
            <Path
              key={index}
              d={pathToSvgPath(path)}
              stroke={BrandColors.primaryPink}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {currentPath.length > 0 && (
            <Path
              d={pathToSvgPath(currentPath)}
              stroke={BrandColors.primaryPink}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </Svg>
      </View>
      <TouchableOpacity onPress={clearSignature} style={styles.clearButton}>
        <Text style={[styles.clearButtonText, { color: colors.primary }]}>Clear</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  pad: {
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: BrandColors.white,
    marginBottom: 12,
    overflow: 'hidden',
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: BrandColors.lightPink,
  },
  clearButtonText: {
    fontWeight: '600',
  },
});
