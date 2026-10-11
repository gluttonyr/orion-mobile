import { Text, type StyleProp, type TextStyle } from 'react-native';
import { Palette } from '@/constants/theme';
import { formatCurrency } from '@/lib/format';

interface PriceTagProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  style?: StyleProp<TextStyle>;
}

const SIZE_MAP = { sm: 14, md: 18, lg: 24 };

export function PriceTag({ amount, size = 'md', color = Palette.primary[500], style }: PriceTagProps) {
  return (
    <Text style={[{ fontSize: SIZE_MAP[size], fontWeight: '800', color }, style]}>
      {formatCurrency(amount)}
    </Text>
  );
}
