// src/components/UIComponents.js
import React from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

// ── Button ──────────────────────────────────────────────────
export const Button = ({
  title, onPress, variant = 'primary', loading, style, textStyle, disabled,
}) => {
  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.85}
        style={[styles.btnWrap, style]}
      >
        <LinearGradient
          colors={[colors.primary, '#00B4D8']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={[styles.btnGradient, (disabled || loading) && { opacity: 0.5 }]}
        >
          {loading
            ? <ActivityIndicator color={colors.bg} />
            : <Text style={[styles.btnText, textStyle]}>{title}</Text>
          }
        </LinearGradient>
      </TouchableOpacity>
    );
  }
  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.85}
        style={[styles.btnOutline, (disabled || loading) && { opacity: 0.5 }, style]}
      >
        {loading
          ? <ActivityIndicator color={colors.primary} />
          : <Text style={[styles.btnOutlineText, textStyle]}>{title}</Text>
        }
      </TouchableOpacity>
    );
  }
  // ghost
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.7} style={style}>
      <Text style={[styles.btnGhostText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

// ── Input ────────────────────────────────────────────────────
export const Input = ({
  label, error, style, containerStyle, ...rest
}) => (
  <View style={[styles.inputContainer, containerStyle]}>
    {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
    <TextInput
      style={[styles.input, error && styles.inputError, style]}
      placeholderTextColor={colors.textMuted}
      selectionColor={colors.primary}
      {...rest}
    />
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

// ── Card ─────────────────────────────────────────────────────
export const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

// ── Badge ────────────────────────────────────────────────────
export const Badge = ({ label, color }) => (
  <View style={[styles.badge, { backgroundColor: color + '25', borderColor: color + '50' }]}>
    <Text style={[styles.badgeText, { color }]}>{label}</Text>
  </View>
);

// ── Section Header ────────────────────────────────────────────
export const SectionHeader = ({ title, action, onAction }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {action ? (
      <TouchableOpacity onPress={onAction}>
        <Text style={styles.sectionAction}>{action}</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

// ── Empty State ───────────────────────────────────────────────
export const EmptyState = ({ icon, title, subtitle, action, onAction }) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyIcon}>{icon}</Text>
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptySub}>{subtitle}</Text>
    {action && (
      <Button title={action} onPress={onAction} style={{ marginTop: 20, width: 200 }} />
    )}
  </View>
);

// ── Divider ───────────────────────────────────────────────────
export const Divider = ({ style }) => <View style={[styles.divider, style]} />;

const styles = StyleSheet.create({
  // Button
  btnWrap:         { borderRadius: 14, overflow: 'hidden' },
  btnGradient:     { height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
  btnText:         { fontSize: 16, fontWeight: '700', color: colors.bg, letterSpacing: 0.3 },
  btnOutline:      { height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 14, borderWidth: 1.5, borderColor: colors.primary },
  btnOutlineText:  { fontSize: 16, fontWeight: '600', color: colors.primary },
  btnGhostText:    { fontSize: 14, fontWeight: '600', color: colors.primary },

  // Input
  inputContainer:  { marginBottom: 16 },
  inputLabel:      { fontSize: 13, fontWeight: '600', color: colors.textSub, marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' },
  input:           { backgroundColor: colors.card, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border },
  inputError:      { borderColor: colors.error },
  errorText:       { fontSize: 12, color: colors.error, marginTop: 4 },

  // Card
  card:            { backgroundColor: colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },

  // Badge
  badge:           { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  badgeText:       { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

  // Section
  sectionHeader:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sectionTitle:    { fontSize: 18, fontWeight: '700', color: colors.text },
  sectionAction:   { fontSize: 13, color: colors.primary, fontWeight: '600' },

  // Empty
  emptyState:      { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  emptyIcon:       { fontSize: 52, marginBottom: 16 },
  emptyTitle:      { fontSize: 20, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 8 },
  emptySub:        { fontSize: 14, color: colors.textSub, textAlign: 'center', lineHeight: 22 },

  // Divider
  divider:         { height: 1, backgroundColor: colors.border, marginVertical: 16 },
});
