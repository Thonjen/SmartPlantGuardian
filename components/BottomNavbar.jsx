import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const BottomNavbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const activeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(activeAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(activeAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(activeAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  }, [pathname]);

  const isActive = (route) => pathname === route;

  const tabs = [
    { route: '/', label: 'Monitor', icon: 'leaf' },
    { route: '/history', label: 'History', icon: 'time' },
    { route: '/settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <View style={styles.navbarContainer}>
      <View style={styles.navbarBackground} />
      <View style={styles.tabRow}>
        {tabs.map((tab, index) => {
          const active = isActive(tab.route);

          return (
            <TouchableOpacity
              key={index}
              style={[styles.tabItem, active && styles.activeTabItem]}
              onPress={() => router.push(tab.route)}
            >
              <Animated.View
                style={[
                  styles.iconContainer,
                  active && {
                    backgroundColor: '#a5d6a7',
                    transform: [
                      {
                        translateY: activeAnim.interpolate({
                          inputRange: [0.9, 1, 1.1],
                          outputRange: [-5, -15, -5],
                        }),
                      },
                      { scale: activeAnim },
                    ],
                  },
                ]}
              >
                <Ionicons name={tab.icon} size={24} color="#2e7d32" />
              </Animated.View>
              <Text style={[styles.tabLabel, { color: '#2e7d32' }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default BottomNavbar;

const styles = StyleSheet.create({
  navbarContainer: {
    height: 70,
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navbarBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#c8e6c9',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 6,
    elevation: 8,
  },
  tabRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingBottom: 5,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 60,
  },
  activeTabItem: {
    marginTop: -20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
  },
});
