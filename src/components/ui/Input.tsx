import { type ReactNode, useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightElement?: ReactNode;
}

export function Input({ label, error, icon, rightElement, style, onFocus, onBlur, ...rest }: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.field,
          focused && styles.fieldFocused,
          error && styles.fieldError,
        ]}
      >
        {icon && <Ionicons name={icon} size={18} color={focused ? Palette.primary[500] : Palette.textMuted} />}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Palette.textMuted}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {rightElement}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: Palette.textSecondary,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Palette.neutral[50],
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Palette.border,
    paddingHorizontal: Spacing.four,
    minHeight: 52,
  },
  fieldFocused: {
    borderColor: Palette.primary[400],
    backgroundColor: Palette.surface,
  },
  fieldError: {
    borderColor: Palette.danger.base,
  },
  input: {
    flex: 1,
    fontSize: Typography.body.fontSize,
    color: Palette.text,
    paddingVertical: 12,
  },
  errorText: {
    fontSize: Typography.caption.fontSize,
    color: Palette.danger.text,
  },
});
