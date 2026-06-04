import React, { useState, useEffect, useRef } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
  Animated, Platform,
} from 'react-native';

let _handler = null;

export function showAlert(title, message, buttons) {
  if (Platform.OS === 'web') {
    const text = message ? `${title}\n${message}` : title;
    if (buttons && buttons.length > 1) {
      if (window.confirm(text)) {
        const action = buttons.find(b => b.style !== 'cancel');
        action?.onPress?.();
      }
    } else {
      window.alert(text);
    }
    return;
  }
  _handler?.({ title, message, buttons: buttons ?? [{ text: 'אישור' }] });
}

export function AlertHost() {
  const [cfg, setCfg] = useState(null);
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    _handler = setCfg;
    return () => { _handler = null; };
  }, []);

  useEffect(() => {
    if (cfg) {
      scale.setValue(0.85);
      opacity.setValue(0);
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 180, friction: 12 }),
        Animated.timing(opacity, { toValue: 1, useNativeDriver: true, duration: 160 }),
      ]).start();
    }
  }, [cfg]);

  const dismiss = (btn) => {
    Animated.parallel([
      Animated.timing(scale, { toValue: 0.9, useNativeDriver: true, duration: 120 }),
      Animated.timing(opacity, { toValue: 0, useNativeDriver: true, duration: 120 }),
    ]).start(() => {
      setCfg(null);
      btn?.onPress?.();
    });
  };

  const multi = cfg?.buttons?.length > 1;

  return (
    <Modal
      visible={!!cfg}
      transparent
      animationType="none"
      onRequestClose={() => dismiss()}
      statusBarTranslucent
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => dismiss()}>
        <Animated.View style={[styles.box, { transform: [{ scale }], opacity }]}>
          {cfg?.title && <Text style={styles.title}>{cfg.title}</Text>}
          {cfg?.message && <Text style={styles.message}>{cfg.message}</Text>}

          <View style={[styles.btnRow, multi && styles.btnRowMulti]}>
            {cfg?.buttons?.map((btn, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.btn,
                  multi && styles.btnMulti,
                  multi && i < cfg.buttons.length - 1 && styles.btnBorderRight,
                ]}
                onPress={() => dismiss(btn)}
                activeOpacity={0.5}
              >
                <Text style={[
                  styles.btnText,
                  btn.style === 'cancel' && styles.cancelText,
                  btn.style === 'destructive' && styles.destructiveText,
                ]}>
                  {btn.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  box: {
    backgroundColor: '#fff',
    borderRadius: 14,
    width: '100%',
    maxWidth: 310,
    overflow: 'hidden',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
    textAlign: 'right',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  message: {
    fontSize: 13,
    color: '#444',
    textAlign: 'right',
    paddingHorizontal: 20,
    paddingBottom: 16,
    lineHeight: 19,
  },
  btnRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc',
  },
  btnRowMulti: {
    flexDirection: 'row-reverse',
  },
  btn: {
    paddingVertical: 13,
    alignItems: 'center',
  },
  btnMulti: {
    flex: 1,
  },
  btnBorderRight: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: '#ccc',
  },
  btnText: {
    fontSize: 17,
    color: '#007AFF',
  },
  cancelText: {
    color: '#8E8E93',
    fontWeight: '600',
  },
  destructiveText: {
    color: '#FF3B30',
  },
});
